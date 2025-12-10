import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../../../test/utils";
import userEvent from "@testing-library/user-event";
import TeamForm from "./team-form";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/types/database.types";

type Team = Database["public"]["Tables"]["teams"]["Row"];

// Mock dependencies
vi.mock("@/lib/supabase");
vi.mock("@/hooks/use-toast");

const mockTeam: Team = {
  id: "team1",
  name: "Test Team",
  logo_url: null,
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
};

describe("TeamForm", () => {
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
  });

  it("should render create form when no team provided", () => {
    render(
      <TeamForm team={null} open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
    );

    expect(screen.getByText("Create New Team")).toBeInTheDocument();
    expect(screen.getByLabelText(/team name/i)).toBeInTheDocument();
  });

  it("should render edit form when team provided", () => {
    render(
      <TeamForm
        team={mockTeam}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText("Edit Team")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Team")).toBeInTheDocument();
  });

  it("should validate required fields", async () => {
    const user = userEvent.setup();

    render(
      <TeamForm team={null} open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
    );

    const submitButton = screen.getByRole("button", { name: /create team/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/team name is required/i)).toBeInTheDocument();
    });
  });

  it("should validate team name length", async () => {
    const user = userEvent.setup();

    render(
      <TeamForm team={null} open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
    );

    const nameInput = screen.getByLabelText(/team name/i);
    const longName = "a".repeat(101);

    await user.type(nameInput, longName);

    const submitButton = screen.getByRole("button", { name: /create team/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/team name is too long/i)).toBeInTheDocument();
    });
  });

  it("should handle file upload", async () => {
    const user = userEvent.setup();
    const file = new File(["test"], "test.png", { type: "image/png" });

    render(
      <TeamForm team={null} open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
    );

    const fileInput = screen.getByLabelText(/team logo/i);
    await user.upload(fileInput, file);

    // File should be selected
    expect(fileInput).toHaveProperty("files");
  });

  it("should validate file size", async () => {
    const user = userEvent.setup();
    // Create a file larger than 200KB
    const largeFile = new File(["x".repeat(300000)], "large.png", {
      type: "image/png",
    });

    render(
      <TeamForm team={null} open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
    );

    const fileInput = screen.getByLabelText(/team logo/i);
    await user.upload(fileInput, largeFile);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "File too large",
        })
      );
    });
  });

  it("should validate file type", async () => {
    const user = userEvent.setup();
    const invalidFile = new File(["test"], "test.txt", { type: "text/plain" });

    render(
      <TeamForm team={null} open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
    );

    const fileInput = screen.getByLabelText(/team logo/i);
    await user.upload(fileInput, invalidFile);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Invalid file type",
        })
      );
    });
  });
});
