import { useState, useCallback, useEffect } from "react";
import { useTopScorers, type TopScorerWithRank } from "@/hooks/useTopScorers";
import { useRealtimeTopScorers } from "@/hooks/useRealtimeTopScorers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TopScorersCard from "./top-scorers-card";

/**
 * PlayerPhoto component handles player photo display with fallback
 */
function PlayerPhoto({
  photoUrl,
  playerName,
  size = "md",
}: {
  photoUrl: string | null;
  playerName: string | null;
  size?: "sm" | "md";
}) {
  const [imageError, setImageError] = useState(false);
  const sizeClasses = size === "sm" ? "h-10 w-10" : "h-12 w-12";
  const textSizeClasses = size === "sm" ? "text-sm" : "text-lg";

  if (!photoUrl || imageError) {
    return (
      <div className={`flex ${sizeClasses} bg-muted items-center justify-center rounded-full`}>
        <span className={`${textSizeClasses} font-semibold`}>
          {(playerName ?? "P")[0].toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <img
      src={photoUrl}
      alt={playerName ?? "Player"}
      className={`${sizeClasses} rounded-full object-cover`}
      onError={() => setImageError(true)}
    />
  );
}

/**
 * TopScorers component displays top scorers leaderboard
 * - Desktop: Table view
 * - Mobile: Card view
 * - Real-time updates via Supabase Realtime
 * - Handles ties (same goals, same rank)
 * - Limits to top 20 scorers
 */
export default function TopScorers() {
  const { topScorers: initialTopScorers, loading, error } = useTopScorers();
  const [topScorers, setTopScorers] = useState<TopScorerWithRank[]>(initialTopScorers);

  // Update top scorers when real-time changes occur
  const handleTopScorersUpdate = useCallback((updatedTopScorers: TopScorerWithRank[]) => {
    setTopScorers(updatedTopScorers);
  }, []);

  // Sync initial top scorers when they load
  useEffect(() => {
    if (initialTopScorers.length > 0) {
      setTopScorers(initialTopScorers);
    }
  }, [initialTopScorers]);

  // Subscribe to real-time updates
  useRealtimeTopScorers({
    topScorers,
    onUpdate: handleTopScorersUpdate,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="text-muted-foreground">Loading top scorers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-destructive bg-destructive/10 rounded-lg border p-4">
        <p className="text-destructive text-sm font-medium">
          Error loading top scorers: {error.message}
        </p>
      </div>
    );
  }

  if (topScorers.length === 0) {
    return (
      <div className="border-border bg-muted/50 rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">No top scorers data available</p>
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
                <TableHead className="w-12 text-center">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-center">Jersey #</TableHead>
                <TableHead className="text-center font-semibold">Goals</TableHead>
                <TableHead className="text-center">Matches</TableHead>
                <TableHead className="text-center">YC</TableHead>
                <TableHead className="text-center">RC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topScorers.map((scorer) => (
                <TableRow key={scorer.player_id}>
                  <TableCell className="text-center font-medium">{scorer.rank}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <PlayerPhoto
                        photoUrl={scorer.photo_url}
                        playerName={scorer.player_name}
                        size="sm"
                      />
                      <span className="font-medium">{scorer.player_name ?? "-"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {scorer.team_logo_url && (
                        <img
                          src={scorer.team_logo_url}
                          alt={scorer.team_name ?? "Team"}
                          className="h-6 w-6 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      )}
                      <span>{scorer.team_name ?? "-"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{scorer.jersey_number ?? "-"}</TableCell>
                  <TableCell className="text-center text-lg font-semibold">
                    {scorer.goals ?? 0}
                  </TableCell>
                  <TableCell className="text-center">{scorer.matches_with_goals ?? 0}</TableCell>
                  <TableCell className="text-center text-yellow-600">
                    {scorer.yellow_cards ?? 0}
                  </TableCell>
                  <TableCell className="text-center text-red-600">
                    {scorer.red_cards ?? 0}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-4 md:hidden">
        {topScorers.map((scorer) => (
          <TopScorersCard key={scorer.player_id} scorer={scorer} />
        ))}
      </div>
    </div>
  );
}
