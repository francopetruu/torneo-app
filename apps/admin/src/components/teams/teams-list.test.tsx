import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../../../test/utils";
import TeamsList from "./teams-list";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

type Team = Database["public"]["Tables"]["teams"]["Row"];

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("TeamsList", () => {
  const mockTeams: Team[] = [
    {
      id: "team1",
      name: "Team A",
      logo_url: null,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    },
    {
      id: "team2",
      name: "Team B",
      logo_url: "https://example.com/logo.png",
      created_at: "2024-01-02",
      updated_at: "2024-01-02",
    },
  ];

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display loading state", () => {
    const mockSelect = vi.fn().mockReturnValue({
      order: vi.fn().mockImplementation(() => {
        return new Promise(() => {}); // Never resolves
      }),
    });

    (supabase.from as any).mockReturnValue({
      select: mockSelect,
    });

    render(<TeamsList onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByText("Loading teams...")).toBeInTheDocument();
  });

  it("should display error state", async () => {
    const mockSelect = vi.fn().mockReturnValue({
      order: vi.fn().mockRejectedValue(new Error("Failed to fetch")),
    });

    (supabase.from as any).mockReturnValue({
      select: mockSelect,
    });

    render(<TeamsList onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading teams/i)).toBeInTheDocument();
    });
  });

  it("should display empty state", async () => {
    const mockSelect = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    });

    (supabase.from as any).mockReturnValue({
      select: mockSelect,
    });

    render(<TeamsList onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    await waitFor(() => {
      expect(screen.getByText(/No teams found/i)).toBeInTheDocument();
    });
  });

  it("should render teams table", async () => {
    const mockSelect = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({
        data: mockTeams,
        error: null,
      }),
    });

    (supabase.from as any).mockReturnValue({
      select: mockSelect,
    });

    render(<TeamsList onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    await waitFor(() => {
      expect(screen.getByText("Team A")).toBeInTheDocument();
      expect(screen.getByText("Team B")).toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByText("Logo")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("should call onEdit when edit button is clicked", async () => {
    const mockSelect = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({
        data: mockTeams,
        error: null,
      }),
    });

    (supabase.from as any).mockReturnValue({
      select: mockSelect,
    });

    render(<TeamsList onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    await waitFor(() => {
      expect(screen.getByText("Team A")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText("Edit");
    // Click first edit button
    editButtons[0].click();

    expect(mockOnEdit).toHaveBeenCalledWith(mockTeams[0]);
  });

  it("should call onDelete when delete button is clicked", async () => {
    const mockSelect = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({
        data: mockTeams,
        error: null,
      }),
    });

    (supabase.from as any).mockReturnValue({
      select: mockSelect,
    });

    render(<TeamsList onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    await waitFor(() => {
      expect(screen.getByText("Team A")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText("Delete");
    // Click first delete button
    deleteButtons[0].click();

    expect(mockOnDelete).toHaveBeenCalledWith(mockTeams[0]);
  });
});
