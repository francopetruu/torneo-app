import { describe, it, expect } from "vitest";
import { z } from "zod";

/**
 * Test form validation schemas
 */
describe("Form Validation", () => {
  describe("Team Form Schema", () => {
    const teamSchema = z.object({
      name: z.string().min(1, "Team name is required").max(100, "Team name is too long"),
      logo: z
        .instanceof(File)
        .optional()
        .refine((file) => !file || file.size <= 200 * 1024, "File size must be less than 200KB")
        .refine(
          (file) =>
            !file || ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type),
          "Only JPEG, PNG, and WebP images are allowed"
        ),
    });

    it("should validate team name", () => {
      const result = teamSchema.safeParse({ name: "Valid Team Name" });
      expect(result.success).toBe(true);
    });

    it("should reject empty team name", () => {
      const result = teamSchema.safeParse({ name: "" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("required");
      }
    });

    it("should reject team name that is too long", () => {
      const longName = "a".repeat(101);
      const result = teamSchema.safeParse({ name: longName });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("too long");
      }
    });

    it("should validate file size", () => {
      const smallFile = new File(["test"], "test.png", { type: "image/png" });
      Object.defineProperty(smallFile, "size", { value: 100 * 1024 }); // 100KB

      const result = teamSchema.safeParse({ name: "Team", logo: smallFile });
      expect(result.success).toBe(true);
    });

    it("should reject file that is too large", () => {
      const largeFile = new File(["test"], "test.png", { type: "image/png" });
      Object.defineProperty(largeFile, "size", { value: 300 * 1024 }); // 300KB

      const result = teamSchema.safeParse({ name: "Team", logo: largeFile });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("200KB");
      }
    });

    it("should reject invalid file type", () => {
      const invalidFile = new File(["test"], "test.txt", { type: "text/plain" });
      Object.defineProperty(invalidFile, "size", { value: 100 * 1024 });

      const result = teamSchema.safeParse({ name: "Team", logo: invalidFile });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("JPEG, PNG");
      }
    });
  });

  describe("Match Form Schema", () => {
    const matchSchema = z
      .object({
        home_team_id: z.string().min(1, "Home team is required"),
        away_team_id: z.string().min(1, "Away team is required"),
        match_date: z.string().min(1, "Match date is required"),
        match_time: z.string().min(1, "Match time is required"),
        venue: z.string().optional(),
        status: z.enum(["scheduled", "in_progress", "finished"]),
      })
      .refine((data) => data.home_team_id !== data.away_team_id, {
        message: "Home and away teams must be different",
        path: ["away_team_id"],
      });

    it("should validate match form", () => {
      const result = matchSchema.safeParse({
        home_team_id: "team1",
        away_team_id: "team2",
        match_date: "2024-01-15",
        match_time: "10:00",
        status: "scheduled",
      });

      expect(result.success).toBe(true);
    });

    it("should reject same team for home and away", () => {
      const result = matchSchema.safeParse({
        home_team_id: "team1",
        away_team_id: "team1",
        match_date: "2024-01-15",
        match_time: "10:00",
        status: "scheduled",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("different");
      }
    });

    it("should reject missing required fields", () => {
      const result = matchSchema.safeParse({
        home_team_id: "team1",
        away_team_id: "team2",
        match_date: "",
        match_time: "10:00",
        status: "scheduled",
      });

      expect(result.success).toBe(false);
    });
  });
});
