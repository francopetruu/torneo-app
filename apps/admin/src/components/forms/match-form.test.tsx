import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../../test/utils";
import userEvent from "@testing-library/user-event";
import MatchForm from "./match-form";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/types/database.types";

type Match = Database["public"]["Tables"]["matches"]["Row"];

// Mock dependencies
vi.mock("@/lib/supabase");
vi.mock("@/hooks/use-toast");

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

describe("MatchForm", () => {
  const mockOnSuccess = vi.fn();
  const mockOnOpenChange = vi.fn();
  const mockToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue({
      toast: mockToast,
      toasts: [],
      dismiss: vi.fn(),
    });

    // Mock teams fetch
    (supabase.from as unknown as { mockReturnValue: (value: unknown) => unknown }).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [
            { id: "team1", name: "Team A" },
            { id: "team2", name: "Team B" },
          ],
          error: null,
        }),
      }),
    });
  });

  it("should render create form when no match provided", async () => {
    render(
      <MatchForm
        match={null}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Create New Match")).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/home team/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/away team/i)).toBeInTheDocument();
  });

  it("should render edit form when match provided", async () => {
    render(
      <MatchForm
        match={mockMatch}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Edit Match")).toBeInTheDocument();
    });
  });

  it("should validate that home and away teams are different", async () => {
    const user = userEvent.setup();

    // Test validation by rendering a match with same teams for home and away
    // This directly tests the validation without complex dropdown interactions
    const matchWithSameTeams: Match = {
      ...mockMatch,
      home_team_id: "team1",
      away_team_id: "team1", // Same team - should trigger validation
    };

    render(
      <MatchForm
        match={matchWithSameTeams}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Edit Match")).toBeInTheDocument();
    });

    // Try to submit the form - validation should catch same teams
    const submitButton = screen.getByRole("button", { name: /update match/i });
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(screen.getByText(/home and away teams must be different/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should validate required fields", async () => {
    const user = userEvent.setup();

    render(
      <MatchForm
        match={null}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/home team/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: /create match/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/home team is required/i)).toBeInTheDocument();
    });
  });
});
