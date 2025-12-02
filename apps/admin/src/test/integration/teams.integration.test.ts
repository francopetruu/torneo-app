import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

type Team = Database["public"]["Tables"]["teams"]["Row"];

// Mock Supabase for integration tests
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
}));

describe("Teams Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a new team", async () => {
    const newTeam = {
      name: "New Team",
      logo_url: null,
    };

    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: "new-id", ...newTeam },
          error: null,
        }),
      }),
    });

    (supabase.from as any).mockReturnValue({
      insert: mockInsert,
    });

    const { data, error } = await (supabase.from as any)("teams").insert(newTeam).select().single();

    expect(error).toBeNull();
    expect(data.name).toBe("New Team");
    expect(data.id).toBeDefined();
  });

  it("should update an existing team", async () => {
    const updatedTeam = {
      name: "Updated Team Name",
    };

    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    (supabase.from as any).mockReturnValue({
      update: mockUpdate,
    });

    const { error } = await (supabase.from as any)("teams").update(updatedTeam).eq("id", "team-id");

    expect(error).toBeNull();
  });

  it("should delete a team", async () => {
    const mockDelete = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    (supabase.from as any).mockReturnValue({
      delete: mockDelete,
    });

    const { error } = await (supabase.from as any)("teams").delete().eq("id", "team-id");

    expect(error).toBeNull();
  });

  it("should upload team logo to storage", async () => {
    const file = new File(["test"], "logo.png", { type: "image/png" });
    const filePath = "team-logos/team-id-logo.png";

    const mockUpload = vi.fn().mockResolvedValue({
      error: null,
    });

    const mockGetPublicUrl = vi.fn().mockReturnValue({
      data: {
        publicUrl: `https://storage.supabase.co/${filePath}`,
      },
    });

    (supabase.storage.from as any).mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
    });

    const { error: uploadError } = await (supabase.storage.from as any)("team-logos").upload(
      filePath,
      file
    );

    expect(uploadError).toBeNull();
    expect(mockUpload).toHaveBeenCalledWith(filePath, file, expect.any(Object));
  });
});
