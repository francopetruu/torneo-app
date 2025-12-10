import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getCache, setCache, CACHE_KEYS } from "@/lib/offline-cache";
import { useOnlineStatus } from "./useOnlineStatus";
import type { Standing } from "@/types/database.types";

interface UseStandingsReturn {
  standings: Standing[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch standings data from the database view
 * Falls back to cached data when offline
 * @returns Standings data, loading state, error, and refetch function
 */
export function useStandings(): UseStandingsReturn {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isOnline = useOnlineStatus();

  const fetchStandings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from network
      const { data, error: fetchError } = await supabase
        .from("standings")
        .select("*")
        .order("position", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      const standingsData = data || [];
      setStandings(standingsData);

      // Cache the data for offline use (24 hour TTL)
      setCache(CACHE_KEYS.STANDINGS, standingsData, 60 * 60 * 24);
    } catch (err) {
      // If offline or network error, try to use cached data
      if (!isOnline) {
        const cachedStandings = getCache<Standing[]>(CACHE_KEYS.STANDINGS);
        if (cachedStandings) {
          setStandings(cachedStandings);
          setError(null);
          setLoading(false);
          return;
        }
      }

      setError(err instanceof Error ? err : new Error("Failed to fetch standings"));
      setStandings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // On mount, try to load from cache first for instant display
    const cachedStandings = getCache<Standing[]>(CACHE_KEYS.STANDINGS);
    if (cachedStandings) {
      setStandings(cachedStandings);
      setLoading(false);
    }

    // Then fetch fresh data
    fetchStandings();
  }, []);

  return {
    standings,
    loading,
    error,
    refetch: fetchStandings,
  };
}
