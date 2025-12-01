import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Team = Database["public"]["Tables"]["teams"]["Row"];

interface TeamsListProps {
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
  refreshTrigger?: number;
}

/**
 * TeamsList component displays all teams in a table
 */
export default function TeamsList({ onEdit, onDelete, refreshTrigger }: TeamsListProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("teams")
        .select("*")
        .order("name", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setTeams(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch teams"));
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="text-muted-foreground">Loading teams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-destructive bg-destructive/10 rounded-lg border p-4">
        <p className="text-destructive text-sm font-medium">Error loading teams: {error.message}</p>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="border-border bg-muted/50 rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">No teams found. Create your first team!</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Logo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TableRow key={team.id}>
              <TableCell>
                {team.logo_url ? (
                  <img
                    src={team.logo_url}
                    alt={team.name}
                    className="h-10 w-10 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                    <span className="text-sm font-semibold">{team.name[0].toUpperCase()}</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">{team.name}</TableCell>
              <TableCell>{new Date(team.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(team)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(team)}>
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
