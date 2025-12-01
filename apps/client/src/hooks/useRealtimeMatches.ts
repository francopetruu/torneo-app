import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

type Match = Database["public"]["Tables"]["matches"]["Row"];
type Team = Database["public"]["Tables"]["teams"]["Row"];

export interface MatchWithTeams extends Match {
  home_team: Team;
  away_team: Team;
}

interface UseRealtimeMatchesProps {
  matches: MatchWithTeams[];
  onUpdate: (updatedMatches: MatchWithTeams[]) => void;
  statusFilter?: "scheduled" | "in_progress" | "finished";
}

/**
 * Hook to subscribe to real-time updates for matches
 * Listens to changes in matches table
 * @param matches - Current matches data
 * @param onUpdate - Callback when matches are updated
 * @param statusFilter - Optional filter by match status
 */
export function useRealtimeMatches({ matches, onUpdate, statusFilter }: UseRealtimeMatchesProps) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel("matches-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
        },
        async () => {
          // Refetch matches when matches table changes
          let query = supabase
            .from("matches")
            .select(
              `
              *,
              home_team:teams!matches_home_team_id_fkey(*),
              away_team:teams!matches_away_team_id_fkey(*)
            `
            )
            .order("match_date", { ascending: true });

          if (statusFilter) {
            query = query.eq("status", statusFilter);
          }

          const { data, error } = await query;

          if (!error && data) {
            // Transform the data to match our interface
            const matchesWithTeams: MatchWithTeams[] = data.map((match: any) => ({
              ...match,
              home_team: match.home_team as Team,
              away_team: match.away_team as Team,
            }));
            onUpdate(matchesWithTeams);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [onUpdate, statusFilter]);
}
