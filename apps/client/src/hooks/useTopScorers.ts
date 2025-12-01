import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { TopScorer } from "@/types/database.types";

export interface TopScorerWithRank extends TopScorer {
  rank: number;
}

interface UseTopScorersReturn {
  topScorers: TopScorerWithRank[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const TOP_SCORERS_LIMIT = 20;

/**
 * Hook to fetch top scorers data from the database view
 * Limits to top 20 scorers and calculates ranks with tie handling
 * @returns Top scorers data with ranks, loading state, error, and refetch function
 */
export function useTopScorers(): UseTopScorersReturn {
  const [topScorers, setTopScorers] = useState<TopScorerWithRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTopScorers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("top_scorers")
        .select("*")
        .order("goals", { ascending: false })
        .order("matches_with_goals", { ascending: false })
        .order("player_name", { ascending: true })
        .limit(TOP_SCORERS_LIMIT);

      if (fetchError) {
        throw fetchError;
      }

      // Calculate ranks with tie handling
      // Players with the same goals get the same rank
      const scorersWithRanks: TopScorerWithRank[] = (data || []).map((scorer, index) => {
        // Find the rank by checking previous scorers
        let rank = index + 1;

        // If this scorer has the same goals as the previous one, use the same rank
        if (index > 0 && data[index - 1]?.goals === scorer.goals) {
          // Find the first scorer with this goal count
          for (let i = index - 1; i >= 0; i--) {
            if (data[i]?.goals === scorer.goals) {
              rank = i + 1;
            } else {
              break;
            }
          }
        }

        return {
          ...scorer,
          rank,
        };
      });

      setTopScorers(scorersWithRanks);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch top scorers"));
      setTopScorers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopScorers();
  }, [fetchTopScorers]);

  return {
    topScorers,
    loading,
    error,
    refetch: fetchTopScorers,
  };
}
