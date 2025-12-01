import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

type Match = Database["public"]["Tables"]["matches"]["Row"];
type Team = Database["public"]["Tables"]["teams"]["Row"];

export interface MatchWithTeams extends Match {
  home_team: Team;
  away_team: Team;
}

interface UseMatchesReturn {
  matches: MatchWithTeams[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch matches data with team information
 * @param statusFilter - Optional filter by match status
 * @returns Matches data with teams, loading state, error, and refetch function
 */
export function useMatches(
  statusFilter?: "scheduled" | "in_progress" | "finished"
): UseMatchesReturn {
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

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

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      // Transform the data to match our interface
      const matchesWithTeams: MatchWithTeams[] = (data || []).map((match: any) => ({
        ...match,
        home_team: match.home_team as Team,
        away_team: match.away_team as Team,
      }));

      setMatches(matchesWithTeams);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch matches"));
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return {
    matches,
    loading,
    error,
    refetch: fetchMatches,
  };
}
