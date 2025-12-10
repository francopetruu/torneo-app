import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useMatches } from "./useMatches";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

type Match = Database["public"]["Tables"]["matches"]["Row"];
type Team = Database["public"]["Tables"]["teams"]["Row"];

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("useMatches", () => {
  const mockHomeTeam: Team = {
    id: "team1",
    name: "Home Team",
    logo_url: null,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  };

  const mockAwayTeam: Team = {
    id: "team2",
    name: "Away Team",
    logo_url: null,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  };

  const mockMatch: Match = {
    id: "match1",
    home_team_id: "team1",
    away_team_id: "team2",
    home_score: 2,
    away_score: 1,
    match_date: "2024-01-15T10:00:00Z",
    status: "finished",
    venue: "Stadium A",
    created_at: "2024-01-01",
    updated_at: "2024-01-15",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch matches successfully", async () => {
    const mockData = [
      {
        ...mockMatch,
        home_team: mockHomeTeam,
        away_team: mockAwayTeam,
      },
    ];

    const mockOrder = vi.fn().mockResolvedValue({
      data: mockData,
      error: null,
    });

    const mockSelect = vi.fn().mockReturnValue({
      order: mockOrder,
    });

    const mockEq = vi.fn().mockReturnValue({
      order: mockOrder,
    });

    (supabase.from as unknown as { mockReturnValue: (value: unknown) => unknown }).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
    });

    const { result } = renderHook(() => useMatches());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.matches).toHaveLength(1);
    expect(result.current.matches[0].home_team.name).toBe("Home Team");
    expect(result.current.matches[0].away_team.name).toBe("Away Team");
    expect(result.current.error).toBeNull();
  });

  it("should filter by status when provided", async () => {
    const mockEq = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    const mockOrder = vi.fn().mockReturnValue({
      eq: mockEq,
    });

    const mockSelect = vi.fn().mockReturnValue({
      order: mockOrder,
    });

    (supabase.from as unknown as { mockReturnValue: (value: unknown) => unknown }).mockReturnValue({
      select: mockSelect,
    });

    renderHook(() => useMatches("finished"));

    await waitFor(() => {
      expect(mockEq).toHaveBeenCalledWith("status", "finished");
    });
  });

  it("should handle fetch error", async () => {
    const mockError = new Error("Failed to fetch");
    const mockOrder = vi.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    const mockSelect = vi.fn().mockReturnValue({
      order: mockOrder,
    });

    (supabase.from as unknown as { mockReturnValue: (value: unknown) => unknown }).mockReturnValue({
      select: mockSelect,
    });

    const { result } = renderHook(() => useMatches());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.matches).toEqual([]);
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
