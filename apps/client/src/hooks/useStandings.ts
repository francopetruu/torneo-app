import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Standing } from "@/types/database.types";

interface UseStandingsReturn {
  standings: Standing[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch standings data from the database view
 * @returns Standings data, loading state, error, and refetch function
 */
export function useStandings(): UseStandingsReturn {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStandings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("standings")
        .select("*")
        .order("position", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setStandings(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch standings"));
      setStandings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandings();
  }, []);

  return {
    standings,
    loading,
    error,
    refetch: fetchStandings,
  };
}
