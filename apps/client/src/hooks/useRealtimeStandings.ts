import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { Standing } from "@/types/database.types";

interface UseRealtimeStandingsProps {
  standings: Standing[];
  onUpdate: (updatedStandings: Standing[]) => void;
}

/**
 * Hook to subscribe to real-time updates for standings
 * Listens to changes in team_statistics table which affects standings view
 * @param standings - Current standings data
 * @param onUpdate - Callback when standings are updated
 */
export function useRealtimeStandings({ standings, onUpdate }: UseRealtimeStandingsProps) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    // Subscribe to team_statistics changes (which affect standings)
    const channel = supabase
      .channel("standings-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "team_statistics",
        },
        async () => {
          // Refetch standings when team_statistics change
          const { data, error } = await supabase
            .from("standings")
            .select("*")
            .order("position", { ascending: true });

          if (!error && data) {
            onUpdate(data);
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

  // Also listen to matches table changes (which affect standings)
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
          // Refetch standings when matches change
          const { data, error } = await supabase
            .from("standings")
            .select("*")
            .order("position", { ascending: true });

          if (!error && data) {
            onUpdate(data);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
}
