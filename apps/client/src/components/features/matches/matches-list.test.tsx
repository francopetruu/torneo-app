import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../../../test/utils";
import MatchesList from "./matches-list";
import { useMatches } from "@/hooks/useMatches";
import { useRealtimeMatches } from "@/hooks/useRealtimeMatches";
import type { Database } from "@/types/database.types";

type Match = Database["public"]["Tables"]["matches"]["Row"];
type Team = Database["public"]["Tables"]["teams"]["Row"];

// Mock hooks
vi.mock("@/hooks/useMatches");
vi.mock("@/hooks/useRealtimeMatches");
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

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

describe("MatchesList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display loading state", () => {
    (useMatches as any).mockReturnValue({
      matches: [],
      loading: true,
      error: null,
    });

    (useRealtimeMatches as any).mockImplementation(() => {});

    render(<MatchesList />);

    expect(screen.getByText("Loading matches...")).toBeInTheDocument();
  });

  it("should display error state", () => {
    (useMatches as any).mockReturnValue({
      matches: [],
      loading: false,
      error: new Error("Failed to load"),
    });

    (useRealtimeMatches as any).mockImplementation(() => {});

    render(<MatchesList />);

    expect(screen.getByText(/Error loading matches/i)).toBeInTheDocument();
  });

  it("should display empty state", () => {
    (useMatches as any).mockReturnValue({
      matches: [],
      loading: false,
      error: null,
    });

    (useRealtimeMatches as any).mockImplementation(() => {});

    render(<MatchesList />);

    expect(screen.getByText(/No matches found/i)).toBeInTheDocument();
  });

  it("should render matches grouped by date", async () => {
    const mockMatches = [
      {
        ...mockMatch,
        home_team: mockHomeTeam,
        away_team: mockAwayTeam,
      },
    ];

    (useMatches as any).mockReturnValue({
      matches: mockMatches,
      loading: false,
      error: null,
    });

    (useRealtimeMatches as any).mockImplementation(() => {});

    render(<MatchesList />);

    await waitFor(() => {
      expect(screen.getByText("Home Team")).toBeInTheDocument();
      expect(screen.getByText("Away Team")).toBeInTheDocument();
    });
  });

  it("should display filter buttons", () => {
    (useMatches as any).mockReturnValue({
      matches: [],
      loading: false,
      error: null,
    });

    (useRealtimeMatches as any).mockImplementation(() => {});

    render(<MatchesList />);

    expect(screen.getByText("All Matches")).toBeInTheDocument();
    expect(screen.getByText("Scheduled")).toBeInTheDocument();
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.getByText("Finished")).toBeInTheDocument();
  });
});
