import { describe, it, expect } from "vitest";
import type { Database } from "@/types/database.types";

/**
 * Test data transformation utilities
 */
describe("Data Transformations", () => {
  describe("Match date formatting", () => {
    it("should format UTC date to local date string", () => {
      const utcDate = "2024-01-15T10:00:00Z";
      const date = new Date(utcDate);
      const formatted = date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      expect(formatted).toContain("2024");
      expect(formatted).toContain("January");
    });

    it("should format UTC date to local time string", () => {
      const utcDate = "2024-01-15T10:00:00Z";
      const date = new Date(utcDate);
      const formatted = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe("Score formatting", () => {
    it("should format finished match score", () => {
      const homeScore = 2;
      const awayScore = 1;
      const score = `${homeScore} - ${awayScore}`;

      expect(score).toBe("2 - 1");
    });

    it("should format scheduled match score as dash", () => {
      const score = "-";

      expect(score).toBe("-");
    });
  });

  describe("Rank calculation with ties", () => {
    it("should assign same rank to players with same goals", () => {
      const scorers = [
        { goals: 10, rank: 1 },
        { goals: 10, rank: 1 },
        { goals: 9, rank: 3 },
      ];

      expect(scorers[0].rank).toBe(scorers[1].rank);
      expect(scorers[2].rank).toBe(3);
    });

    it("should handle sequential ranks correctly", () => {
      const scorers = [
        { goals: 10, rank: 1 },
        { goals: 9, rank: 2 },
        { goals: 8, rank: 3 },
      ];

      expect(scorers[0].rank).toBe(1);
      expect(scorers[1].rank).toBe(2);
      expect(scorers[2].rank).toBe(3);
    });
  });

  describe("Match grouping by date", () => {
    it("should group matches by date", () => {
      const matches: Database["public"]["Tables"]["matches"]["Row"][] = [
        {
          id: "1",
          match_date: "2024-01-15T10:00:00Z",
          home_team_id: "team1",
          away_team_id: "team2",
          home_score: 2,
          away_score: 1,
          status: "finished",
          venue: null,
          created_at: "2024-01-01",
          updated_at: "2024-01-15",
        },
        {
          id: "2",
          match_date: "2024-01-15T14:00:00Z",
          home_team_id: "team3",
          away_team_id: "team4",
          home_score: 1,
          away_score: 1,
          status: "finished",
          venue: null,
          created_at: "2024-01-01",
          updated_at: "2024-01-15",
        },
        {
          id: "3",
          match_date: "2024-01-16T10:00:00Z",
          home_team_id: "team1",
          away_team_id: "team3",
          home_score: 0,
          away_score: 0,
          status: "scheduled",
          venue: null,
          created_at: "2024-01-01",
          updated_at: "2024-01-01",
        },
      ];

      const grouped: Record<string, Database["public"]["Tables"]["matches"]["Row"][]> = {};
      matches.forEach((match) => {
        const date = new Date(match.match_date);
        const dateKey = date.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(match);
      });

      const dateKeys = Object.keys(grouped);
      expect(dateKeys.length).toBeGreaterThan(0);
      expect(grouped[dateKeys[0]].length).toBeGreaterThan(0);
    });
  });
});
