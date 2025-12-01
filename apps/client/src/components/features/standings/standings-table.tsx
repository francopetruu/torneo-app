import { useState, useCallback, useEffect } from "react";
import { useStandings } from "@/hooks/useStandings";
import { useRealtimeStandings } from "@/hooks/useRealtimeStandings";
import type { Standing } from "@/types/database.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StandingsCard from "./standings-card";

/**
 * StandingsTable component displays tournament standings
 * - Desktop: Table view
 * - Mobile: Card view
 * - Real-time updates via Supabase Realtime
 */
export default function StandingsTable() {
  const { standings: initialStandings, loading, error } = useStandings();
  const [standings, setStandings] = useState<Standing[]>(initialStandings);

  // Update standings when real-time changes occur
  const handleStandingsUpdate = useCallback((updatedStandings: Standing[]) => {
    setStandings(updatedStandings);
  }, []);

  // Sync initial standings when they load
  useEffect(() => {
    if (initialStandings.length > 0) {
      setStandings(initialStandings);
    }
  }, [initialStandings]);

  // Subscribe to real-time updates
  useRealtimeStandings({
    standings,
    onUpdate: handleStandingsUpdate,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="text-muted-foreground">Loading standings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-destructive bg-destructive/10 rounded-lg border p-4">
        <p className="text-destructive text-sm font-medium">
          Error loading standings: {error.message}
        </p>
      </div>
    );
  }

  if (standings.length === 0) {
    return (
      <div className="border-border bg-muted/50 rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">No standings data available</p>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop Table View */}
      <div className="hidden overflow-x-auto md:block">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">Pos</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-center">MP</TableHead>
                <TableHead className="text-center">W</TableHead>
                <TableHead className="text-center">D</TableHead>
                <TableHead className="text-center">L</TableHead>
                <TableHead className="text-center">GF</TableHead>
                <TableHead className="text-center">GA</TableHead>
                <TableHead className="text-center">GD</TableHead>
                <TableHead className="text-center font-semibold">Pts</TableHead>
                <TableHead className="text-center">YC</TableHead>
                <TableHead className="text-center">RC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.map((standing) => (
                <TableRow key={standing.team_id}>
                  <TableCell className="text-center font-medium">
                    {standing.position ?? "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {standing.logo_url && (
                        <img
                          src={standing.logo_url}
                          alt={standing.team_name ?? "Team"}
                          className="h-6 w-6 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      )}
                      <span className="font-medium">{standing.team_name ?? "-"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{standing.matches_played ?? 0}</TableCell>
                  <TableCell className="text-center">{standing.wins ?? 0}</TableCell>
                  <TableCell className="text-center">{standing.draws ?? 0}</TableCell>
                  <TableCell className="text-center">{standing.losses ?? 0}</TableCell>
                  <TableCell className="text-center">{standing.goals_for ?? 0}</TableCell>
                  <TableCell className="text-center">{standing.goals_against ?? 0}</TableCell>
                  <TableCell className="text-center">
                    {standing.goal_difference !== null
                      ? standing.goal_difference > 0
                        ? `+${standing.goal_difference}`
                        : standing.goal_difference
                      : 0}
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    {standing.points ?? 0}
                  </TableCell>
                  <TableCell className="text-center">{standing.yellow_cards ?? 0}</TableCell>
                  <TableCell className="text-center">{standing.red_cards ?? 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-4 md:hidden">
        {standings.map((standing) => (
          <StandingsCard key={standing.team_id} standing={standing} />
        ))}
      </div>
    </div>
  );
}
