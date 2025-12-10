import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useStandings } from "./useStandings";
import { supabase } from "@/lib/supabase";
import type { Standing } from "@/types/database.types";

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("useStandings", () => {
  const mockStandings: Standing[] = [
    {
      team_id: "1",
      team_name: "Team A",
      position: 1,
      points: 10,
      matches_played: 5,
      wins: 3,
      draws: 1,
      losses: 1,
      goals_for: 15,
      goals_against: 8,
      goal_difference: 7,
      logo_url: null,
      yellow_cards: 5,
      red_cards: 0,
    },
    {
      team_id: "2",
      team_name: "Team B",
      position: 2,
      points: 8,
      matches_played: 5,
      wins: 2,
      draws: 2,
      losses: 1,
      goals_for: 12,
      goals_against: 10,
      goal_difference: 2,
      logo_url: null,
      yellow_cards: 3,
      red_cards: 1,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch standings successfully", async () => {
    const mockSelect = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({
        data: mockStandings,
        error: null,
      }),
    });

    (supabase.from as unknown as { mockReturnValue: (value: unknown) => unknown }).mockReturnValue({
      select: mockSelect,
    });

    const { result } = renderHook(() => useStandings());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.standings).toEqual(mockStandings);
    expect(result.current.error).toBeNull();
  });

  it("should handle fetch error", async () => {
    const mockError = new Error("Failed to fetch");
    const mockSelect = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      }),
    });

    (supabase.from as unknown as { mockReturnValue: (value: unknown) => unknown }).mockReturnValue({
      select: mockSelect,
    });

    const { result } = renderHook(() => useStandings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.standings).toEqual([]);
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("should provide refetch function", async () => {
    const mockSelect = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({
        data: mockStandings,
        error: null,
      }),
    });

    (supabase.from as unknown as { mockReturnValue: (value: unknown) => unknown }).mockReturnValue({
      select: mockSelect,
    });

    const { result } = renderHook(() => useStandings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe("function");

    // Test refetch
    await result.current.refetch();
    expect(mockSelect).toHaveBeenCalledTimes(2);
  });
});
