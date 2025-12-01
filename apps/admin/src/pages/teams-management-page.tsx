import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import TeamsList from "@/components/teams/teams-list";
import TeamForm from "@/components/forms/team-form";
import DeleteTeamDialog from "@/components/teams/delete-team-dialog";
import type { Database } from "@/types/database.types";

type Team = Database["public"]["Tables"]["teams"]["Row"];

/**
 * TeamsManagementPage component for managing teams
 * - List all teams
 * - Create new team
 * - Edit existing team
 * - Delete team
 */
export default function TeamsManagementPage() {
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = () => {
    setSelectedTeam(null);
    setFormOpen(true);
  };

  const handleEdit = (team: Team) => {
    setSelectedTeam(team);
    setFormOpen(true);
  };

  const handleDelete = (team: Team) => {
    setSelectedTeam(team);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTeam) return;

    try {
      setDeleting(true);

      // Delete logo from storage if exists
      if (selectedTeam.logo_url) {
        try {
          const urlParts = selectedTeam.logo_url.split("/");
          const filePath = urlParts.slice(urlParts.indexOf("team-logos")).join("/");
          await supabase.storage.from("team-logos").remove([filePath]);
        } catch (error) {
          console.error("Error deleting logo:", error);
          // Continue with team deletion even if logo deletion fails
        }
      }

      // Delete team (cascade will handle players and matches)
      const { error } = await supabase.from("teams").delete().eq("id", selectedTeam.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Team deleted",
        description: `${selectedTeam.name} has been deleted successfully.`,
      });

      setDeleteDialogOpen(false);
      setSelectedTeam(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error deleting team:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete team",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Teams Management</h2>
          <p className="text-muted-foreground">Manage tournament teams, logos, and information</p>
        </div>
        <Button onClick={handleCreate}>Create New Team</Button>
      </div>

      <TeamsList onEdit={handleEdit} onDelete={handleDelete} refreshTrigger={refreshTrigger} />

      <TeamForm
        team={selectedTeam}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={handleFormSuccess}
      />

      <DeleteTeamDialog
        team={selectedTeam}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
    </div>
  );
}
