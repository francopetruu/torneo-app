import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../../../test/utils";
import StandingsTable from "./standings-table";
import { useStandings } from "@/hooks/useStandings";
import { useRealtimeStandings } from "@/hooks/useRealtimeStandings";
import type { Standing } from "@/types/database.types";

// Mock hooks
vi.mock("@/hooks/useStandings");
vi.mock("@/hooks/useRealtimeStandings");

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

describe("StandingsTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display loading state", () => {
    (useStandings as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue({
      standings: [],
      loading: true,
      error: null,
    });

    render(<StandingsTable />);

    expect(screen.getByText("Loading standings...")).toBeInTheDocument();
  });

  it("should display error state", () => {
    (useStandings as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue({
      standings: [],
      loading: false,
      error: new Error("Failed to load"),
    });

    (
      useRealtimeStandings as unknown as { mockImplementation: (fn: () => void) => void }
    ).mockImplementation(() => {});

    render(<StandingsTable />);

    expect(screen.getByText(/Error loading standings/i)).toBeInTheDocument();
  });

  it("should display empty state", () => {
    (useStandings as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue({
      standings: [],
      loading: false,
      error: null,
    });

    (
      useRealtimeStandings as unknown as { mockImplementation: (fn: () => void) => void }
    ).mockImplementation(() => {});

    render(<StandingsTable />);

    expect(screen.getByText(/No standings data available/i)).toBeInTheDocument();
  });

  it("should render standings table", async () => {
    (useStandings as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue({
      standings: mockStandings,
      loading: false,
      error: null,
    });

    (
      useRealtimeStandings as unknown as { mockImplementation: (fn: () => void) => void }
    ).mockImplementation(() => {});

    render(<StandingsTable />);

    await waitFor(() => {
      // Both desktop table and mobile cards render, so use getAllByText
      const teamA = screen.getAllByText("Team A");
      expect(teamA.length).toBeGreaterThan(0);
      const teamB = screen.getAllByText("Team B");
      expect(teamB.length).toBeGreaterThan(0);
    });

    // Check table headers (desktop view)
    expect(screen.getByText("Pos")).toBeInTheDocument();
    expect(screen.getByText("Team")).toBeInTheDocument();
    expect(screen.getByText("Pts")).toBeInTheDocument();
  });

  it("should display team statistics", async () => {
    (useStandings as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue({
      standings: mockStandings,
      loading: false,
      error: null,
    });

    (
      useRealtimeStandings as unknown as { mockImplementation: (fn: () => void) => void }
    ).mockImplementation(() => {});

    render(<StandingsTable />);

    await waitFor(() => {
      // Both desktop table and mobile cards render, so use getAllByText
      const points = screen.getAllByText("10");
      expect(points.length).toBeGreaterThan(0); // Points appear in both views
      const matches = screen.getAllByText("5");
      expect(matches.length).toBeGreaterThan(0); // Matches played appear in both views
    });
  });
});
