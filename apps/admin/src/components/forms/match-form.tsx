import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/types/database.types";

type Match = Database["public"]["Tables"]["matches"]["Row"];
type Team = Database["public"]["Tables"]["teams"]["Row"];

const matchFormSchema = z
  .object({
    home_team_id: z.string().min(1, "Home team is required"),
    away_team_id: z.string().min(1, "Away team is required"),
    match_date: z.string().min(1, "Match date is required"),
    match_time: z.string().min(1, "Match time is required"),
    venue: z.string().optional(),
    status: z.enum(["scheduled", "in_progress", "finished"]),
  })
  .refine((data) => data.home_team_id !== data.away_team_id, {
    message: "Home and away teams must be different",
    path: ["away_team_id"],
  });

type MatchFormValues = z.infer<typeof matchFormSchema>;

interface MatchFormProps {
  match: Match | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/**
 * MatchForm component for creating and editing matches
 * Handles timezone conversions for date/time input
 */
export default function MatchForm({ match, open, onOpenChange, onSuccess }: MatchFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);

  // Convert UTC timestamp to local date/time strings
  const getLocalDateTime = (utcDate: string) => {
    const date = new Date(utcDate);
    const localDate = date.toISOString().split("T")[0];
    const localTime = date.toTimeString().slice(0, 5); // HH:MM
    return { date: localDate, time: localTime };
  };

  // Convert local date/time to UTC timestamp
  const getUTCTimestamp = (date: string, time: string) => {
    const localDateTime = `${date}T${time}:00`;
    const localDate = new Date(localDateTime);
    return localDate.toISOString();
  };

  const form = useForm<MatchFormValues>({
    resolver: zodResolver(matchFormSchema),
    defaultValues: {
      home_team_id: match?.home_team_id || "",
      away_team_id: match?.away_team_id || "",
      match_date: match ? getLocalDateTime(match.match_date).date : "",
      match_time: match ? getLocalDateTime(match.match_date).time : "",
      venue: match?.venue || "",
      status: (match?.status as "scheduled" | "in_progress" | "finished") || "scheduled",
    },
  });

  // Fetch teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setTeamsLoading(true);
        const { data, error } = await supabase
          .from("teams")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;
        setTeams(data || []);
      } catch (error) {
        console.error("Error fetching teams:", error);
        toast({
          title: "Error",
          description: "Failed to load teams",
          variant: "destructive",
        });
      } finally {
        setTeamsLoading(false);
      }
    };

    if (open) {
      fetchTeams();
    }
  }, [open, toast]);

  // Reset form when match changes
  useEffect(() => {
    if (match) {
      const { date, time } = getLocalDateTime(match.match_date);
      form.reset({
        home_team_id: match.home_team_id,
        away_team_id: match.away_team_id,
        match_date: date,
        match_time: time,
        venue: match.venue || "",
        status: match.status as "scheduled" | "in_progress" | "finished",
      });
    } else {
      form.reset({
        home_team_id: "",
        away_team_id: "",
        match_date: "",
        match_time: "",
        venue: "",
        status: "scheduled",
      });
    }
  }, [match, form]);

  const onSubmit = async (values: MatchFormValues) => {
    try {
      setLoading(true);

      const matchDateUTC = getUTCTimestamp(values.match_date, values.match_time);

      if (match) {
        // Update existing match
        const { error } = await supabase
          .from("matches")
          .update({
            home_team_id: values.home_team_id,
            away_team_id: values.away_team_id,
            match_date: matchDateUTC,
            venue: values.venue || null,
            status: values.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", match.id);

        if (error) {
          throw error;
        }

        toast({
          title: "Match updated",
          description: "Match has been updated successfully.",
        });
      } else {
        // Create new match
        const { error } = await supabase.from("matches").insert({
          home_team_id: values.home_team_id,
          away_team_id: values.away_team_id,
          match_date: matchDateUTC,
          venue: values.venue || null,
          status: values.status,
        });

        if (error) {
          throw error;
        }

        toast({
          title: "Match created",
          description: "Match has been created successfully.",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving match:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : `Failed to ${match ? "update" : "create"} match`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{match ? "Edit Match" : "Create New Match"}</DialogTitle>
          <DialogDescription>
            {match
              ? "Update match information below."
              : "Fill in the details to create a new match."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="home_team_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Home Team</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={teamsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select home team" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="away_team_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Away Team</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={teamsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select away team" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teams
                          .filter((team) => team.id !== form.watch("home_team_id"))
                          .map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="match_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Match Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="match_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Match Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter venue name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="finished">Finished</SelectItem>
                    </SelectContent>
                  </Select>
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
                {loading ? "Saving..." : match ? "Update Match" : "Create Match"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
