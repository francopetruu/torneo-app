import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MatchForm from "@/components/forms/match-form";
import MatchEventsTimeline from "@/components/matches/match-events-timeline";
import ScoreManagement from "@/components/matches/score-management";
import type { Database } from "@/types/database.types";

type Match = Database["public"]["Tables"]["matches"]["Row"];
type Team = Database["public"]["Tables"]["teams"]["Row"];

interface MatchWithTeams extends Match {
  home_team: Team;
  away_team: Team;
}

/**
 * MatchManagementPage component for managing matches
 * - List all matches
 * - Create/edit matches
 * - View match details with events and score management
 */
export default function MatchManagementPage() {
  const { toast } = useToast();
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("matches")
        .select(
          `
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*)
        `
        )
        .order("match_date", { ascending: false });

      if (error) throw error;

      setMatches(
        (data || []).map((match: any) => ({
          ...match,
          home_team: match.home_team as Team,
          away_team: match.away_team as Team,
        }))
      );
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("matches-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
        },
        () => {
          fetchMatches();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_events",
        },
        () => {
          if (selectedMatch) {
            fetchMatches();
            setRefreshTrigger((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedMatch]);

  const handleCreate = () => {
    setSelectedMatch(null);
    setFormOpen(true);
  };

  const handleEdit = (match: Match) => {
    setSelectedMatch(match);
    setFormOpen(true);
  };

  const handleViewDetails = async (match: Match) => {
    // Fetch latest match data
    const { data, error } = await supabase.from("matches").select("*").eq("id", match.id).single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load match details",
        variant: "destructive",
      });
      return;
    }

    setSelectedMatch(data);
    setDetailOpen(true);
  };

  const handleFormSuccess = () => {
    fetchMatches();
  };

  const handleScoreUpdate = () => {
    fetchMatches();
    setRefreshTrigger((prev) => prev + 1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      scheduled: "bg-secondary text-secondary-foreground",
      in_progress: "bg-primary text-primary-foreground",
      finished: "bg-muted text-muted-foreground",
    };
    return (
      <span
        className={`rounded-full px-2 py-1 text-xs font-medium ${
          styles[status as keyof typeof styles] || styles.scheduled
        }`}
      >
        {status === "in_progress" ? "Live" : status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
            <p className="text-muted-foreground">Loading matches...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Match Management</h2>
          <p className="text-muted-foreground">Manage matches, scores, and events</p>
        </div>
        <Button onClick={handleCreate}>Create New Match</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Home Team</TableHead>
              <TableHead className="text-center">Score</TableHead>
              <TableHead>Away Team</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground text-center">
                  No matches found. Create your first match!
                </TableCell>
              </TableRow>
            ) : (
              matches.map((match) => (
                <TableRow key={match.id}>
                  <TableCell>{formatDate(match.match_date)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {match.home_team.logo_url && (
                        <img
                          src={match.home_team.logo_url}
                          alt={match.home_team.name}
                          className="h-6 w-6 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      )}
                      <span className="font-medium">{match.home_team.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    {match.status === "finished" || match.status === "in_progress"
                      ? `${match.home_score} - ${match.away_score}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {match.away_team.logo_url && (
                        <img
                          src={match.away_team.logo_url}
                          alt={match.away_team.name}
                          className="h-6 w-6 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      )}
                      <span className="font-medium">{match.away_team.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{match.venue || "-"}</TableCell>
                  <TableCell>{getStatusBadge(match.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(match)}>
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(match)}>
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <MatchForm
        match={selectedMatch}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={handleFormSuccess}
      />

      {/* Match Details Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Match Details</DialogTitle>
            <DialogDescription>
              {selectedMatch && (
                <>
                  {matches.find((m) => m.id === selectedMatch.id)?.home_team.name} vs{" "}
                  {matches.find((m) => m.id === selectedMatch.id)?.away_team.name}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedMatch && (
            <div className="space-y-6">
              <ScoreManagement match={selectedMatch} onUpdate={handleScoreUpdate} />
              <MatchEventsTimeline
                match={selectedMatch}
                refreshTrigger={refreshTrigger}
                onEventChange={handleScoreUpdate}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
