import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useTopScorers } from "./useTopScorers";
import { supabase } from "@/lib/supabase";
import type { TopScorer } from "@/types/database.types";

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("useTopScorers", () => {
  const mockTopScorers: TopScorer[] = [
    {
      player_id: "player1",
      player_name: "Player One",
      jersey_number: 10,
      photo_url: null,
      team_id: "team1",
      team_name: "Team A",
      team_logo_url: null,
      goals: 15,
      matches_with_goals: 8,
      yellow_cards: 2,
      red_cards: 0,
    },
    {
      player_id: "player2",
      player_name: "Player Two",
      jersey_number: 7,
      photo_url: null,
      team_id: "team2",
      team_name: "Team B",
      team_logo_url: null,
      goals: 12,
      matches_with_goals: 7,
      yellow_cards: 1,
      red_cards: 0,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch top scorers successfully", async () => {
    const mockLimit = vi.fn().mockResolvedValue({
      data: mockTopScorers,
      error: null,
    });

    const mockOrder3 = vi.fn().mockReturnValue({
      limit: mockLimit,
    });

    const mockOrder2 = vi.fn().mockReturnValue({
      order: mockOrder3,
    });

    const mockOrder1 = vi.fn().mockReturnValue({
      order: mockOrder2,
    });

    (supabase.from as unknown as { mockReturnValue: (value: unknown) => unknown }).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: mockOrder1,
      }),
    });

    const { result } = renderHook(() => useTopScorers());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.topScorers).toHaveLength(2);
    expect(result.current.topScorers[0].rank).toBe(1);
    expect(result.current.topScorers[1].rank).toBe(2);
    expect(result.current.topScorers[0].goals).toBe(15);
    expect(result.current.error).toBeNull();
  });

  it("should handle ties correctly (same goals, same rank)", async () => {
    const tiedScorers: TopScorer[] = [
      {
        ...mockTopScorers[0],
        goals: 10,
      },
      {
        ...mockTopScorers[1],
        goals: 10,
      },
    ];

    const mockLimit = vi.fn().mockResolvedValue({
      data: tiedScorers,
      error: null,
    });

    const mockOrder3 = vi.fn().mockReturnValue({
      limit: mockLimit,
    });

    const mockOrder2 = vi.fn().mockReturnValue({
      order: mockOrder3,
    });

    const mockOrder1 = vi.fn().mockReturnValue({
      order: mockOrder2,
    });

    (supabase.from as unknown as { mockReturnValue: (value: unknown) => unknown }).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: mockOrder1,
      }),
    });

    const { result } = renderHook(() => useTopScorers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Both should have rank 1 (tied)
    expect(result.current.topScorers[0].rank).toBe(1);
    expect(result.current.topScorers[1].rank).toBe(1);
  });

  it("should handle fetch error", async () => {
    const mockError = new Error("Failed to fetch");
    const mockLimit = vi.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    const mockOrder3 = vi.fn().mockReturnValue({
      limit: mockLimit,
    });

    const mockOrder2 = vi.fn().mockReturnValue({
      order: mockOrder3,
    });

    const mockOrder1 = vi.fn().mockReturnValue({
      order: mockOrder2,
    });

    (supabase.from as unknown as { mockReturnValue: (value: unknown) => unknown }).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: mockOrder1,
      }),
    });

    const { result } = renderHook(() => useTopScorers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.topScorers).toEqual([]);
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("should limit to top 20 scorers", async () => {
    const manyScorers = Array.from({ length: 25 }, (_, i) => ({
      ...mockTopScorers[0],
      player_id: `player${i}`,
      player_name: `Player ${i}`,
      goals: 20 - i,
    }));

    const mockLimit = vi.fn().mockResolvedValue({
      data: manyScorers.slice(0, 20),
      error: null,
    });

    const mockOrder3 = vi.fn().mockReturnValue({
      limit: mockLimit,
    });

    const mockOrder2 = vi.fn().mockReturnValue({
      order: mockOrder3,
    });

    const mockOrder1 = vi.fn().mockReturnValue({
      order: mockOrder2,
    });

    (supabase.from as unknown as { mockReturnValue: (value: unknown) => unknown }).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: mockOrder1,
      }),
    });

    const { result } = renderHook(() => useTopScorers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.topScorers).toHaveLength(20);
  });
});
