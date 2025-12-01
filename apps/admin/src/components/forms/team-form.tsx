import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Database } from "@/types/database.types";

type Team = Database["public"]["Tables"]["teams"]["Row"];

const MAX_FILE_SIZE = 200 * 1024; // 200KB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const teamFormSchema = z.object({
  name: z.string().min(1, "Team name is required").max(100, "Team name is too long"),
  logo: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      `File size must be less than ${MAX_FILE_SIZE / 1024}KB`
    )
    .refine(
      (file) => !file || ALLOWED_FILE_TYPES.includes(file.type),
      "Only JPEG, PNG, and WebP images are allowed"
    ),
});

type TeamFormValues = z.infer<typeof teamFormSchema>;

interface TeamFormProps {
  team: Team | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/**
 * TeamForm component for creating and editing teams
 * Includes image upload with validation and preview
 */
export default function TeamForm({ team, open, onOpenChange, onSuccess }: TeamFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: team?.name || "",
      logo: undefined,
    },
  });

  // Reset form when team changes
  useEffect(() => {
    if (team) {
      form.reset({
        name: team.name,
        logo: undefined,
      });
      setPreview(team.logo_url);
      setLogoFile(null);
    } else {
      form.reset({
        name: "",
        logo: undefined,
      });
      setPreview(null);
      setLogoFile(null);
    }
  }, [team, form]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `File size must be less than ${MAX_FILE_SIZE / 1024}KB`,
          variant: "destructive",
        });
        e.target.value = ""; // Reset input
        return;
      }

      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Only JPEG, PNG, and WebP images are allowed",
          variant: "destructive",
        });
        e.target.value = ""; // Reset input
        return;
      }

      setLogoFile(file);
      form.setValue("logo", file, { shouldValidate: true });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // If no file selected, clear preview and file
      if (!team?.logo_url) {
        setPreview(null);
      }
      setLogoFile(null);
      form.setValue("logo", undefined);
    }
  };

  // Upload logo to Supabase Storage
  // Note: The "team-logos" storage bucket must exist in Supabase Storage
  // Create it in Supabase Dashboard > Storage > New Bucket
  // Make it public if you want logos to be accessible without authentication
  const uploadLogo = async (file: File, teamId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${teamId}-${Date.now()}.${fileExt}`;
      const filePath = `team-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("team-logos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        // Check if bucket doesn't exist
        if (uploadError.message.includes("Bucket not found")) {
          throw new Error(
            "Storage bucket 'team-logos' not found. Please create it in Supabase Dashboard > Storage."
          );
        }
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("team-logos").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      throw error;
    }
  };

  // Delete old logo from storage if exists
  const deleteOldLogo = async (logoUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = logoUrl.split("/");
      const filePath = urlParts.slice(urlParts.indexOf("team-logos")).join("/");

      await supabase.storage.from("team-logos").remove([filePath]);
    } catch (error) {
      console.error("Error deleting old logo:", error);
      // Don't throw - deletion failure shouldn't block update
    }
  };

  const onSubmit = async (values: TeamFormValues) => {
    try {
      setLoading(true);

      let logoUrl: string | null = team?.logo_url || null;

      // Upload new logo if provided
      if (logoFile) {
        // If editing and has old logo, delete it
        if (team?.logo_url) {
          await deleteOldLogo(team.logo_url);
        }

        // Upload new logo
        const uploadedUrl = await uploadLogo(logoFile, team?.id || "new");
        logoUrl = uploadedUrl;
      }

      if (team) {
        // Update existing team
        const { error } = await supabase
          .from("teams")
          .update({
            name: values.name,
            logo_url: logoUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", team.id);

        if (error) {
          throw error;
        }

        toast({
          title: "Team updated",
          description: `${values.name} has been updated successfully.`,
        });
      } else {
        // Create new team
        const { data, error } = await supabase
          .from("teams")
          .insert({
            name: values.name,
            logo_url: logoUrl,
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        toast({
          title: "Team created",
          description: `${values.name} has been created successfully.`,
        });
      }

      onSuccess();
      onOpenChange(false);
      form.reset();
      setPreview(null);
      setLogoFile(null);
    } catch (error) {
      console.error("Error saving team:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : `Failed to ${team ? "update" : "create"} team`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{team ? "Edit Team" : "Create New Team"}</DialogTitle>
          <DialogDescription>
            {team ? "Update team information below." : "Fill in the details to create a new team."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter team name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo"
              render={() => (
                <FormItem>
                  <FormLabel>Team Logo</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {preview && (
                        <div className="relative inline-block">
                          <img
                            src={preview}
                            alt="Logo preview"
                            className="h-24 w-24 rounded-full border-2 object-cover"
                          />
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleFileChange}
                      />
                      <FormDescription>
                        Upload a team logo (max {MAX_FILE_SIZE / 1024}KB). JPEG, PNG, or WebP
                        formats only.
                      </FormDescription>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : team ? "Update Team" : "Create Team"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
