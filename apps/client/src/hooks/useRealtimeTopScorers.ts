import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { TopScorer } from "@/types/database.types";

export interface TopScorerWithRank extends TopScorer {
  rank: number;
}

interface UseRealtimeTopScorersProps {
  topScorers: TopScorerWithRank[];
  onUpdate: (updatedTopScorers: TopScorerWithRank[]) => void;
}

const TOP_SCORERS_LIMIT = 20;

/**
 * Hook to subscribe to real-time updates for top scorers
 * Listens to changes in match_events table (goals scored)
 * @param topScorers - Current top scorers data
 * @param onUpdate - Callback when top scorers are updated
 */
export function useRealtimeTopScorers({ topScorers, onUpdate }: UseRealtimeTopScorersProps) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel("top-scorers-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_events",
        },
        async () => {
          // Refetch top scorers when match_events change (goals scored)
          const { data, error } = await supabase
            .from("top_scorers")
            .select("*")
            .order("goals", { ascending: false })
            .order("matches_with_goals", { ascending: false })
            .order("player_name", { ascending: true })
            .limit(TOP_SCORERS_LIMIT);

          if (!error && data) {
            // Calculate ranks with tie handling
            const scorersWithRanks: TopScorerWithRank[] = data.map((scorer, index) => {
              let rank = index + 1;

              if (index > 0 && data[index - 1]?.goals === scorer.goals) {
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
            onUpdate(scorersWithRanks);
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
  }, [onUpdate]);
}
