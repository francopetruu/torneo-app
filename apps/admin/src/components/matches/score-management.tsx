import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Database } from "@/types/database.types";

type Match = Database["public"]["Tables"]["matches"]["Row"];

interface ScoreManagementProps {
  match: Match;
  onUpdate: () => void;
}

/**
 * ScoreManagement component for updating match scores
 * Used during live matches to update scores manually
 */
export default function ScoreManagement({ match, onUpdate }: ScoreManagementProps) {
  const { toast } = useToast();
  const [homeScore, setHomeScore] = useState(match.home_score.toString());
  const [awayScore, setAwayScore] = useState(match.away_score.toString());
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setHomeScore(match.home_score.toString());
    setAwayScore(match.away_score.toString());
  }, [match]);

  const handleUpdateScore = async () => {
    const homeScoreNum = parseInt(homeScore) || 0;
    const awayScoreNum = parseInt(awayScore) || 0;

    if (homeScoreNum < 0 || awayScoreNum < 0) {
      toast({
        title: "Invalid Score",
        description: "Scores cannot be negative",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdating(true);
      const { error } = await supabase
        .from("matches")
        .update({
          home_score: homeScoreNum,
          away_score: awayScoreNum,
          updated_at: new Date().toISOString(),
        })
        .eq("id", match.id);

      if (error) throw error;

      toast({
        title: "Score updated",
        description: "Match score has been updated successfully.",
      });

      onUpdate();
    } catch (error) {
      console.error("Error updating score:", error);
      toast({
        title: "Error",
        description: "Failed to update score",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-4 text-lg font-semibold">Score Management</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="home-score">Home Score</Label>
          <Input
            id="home-score"
            type="number"
            min="0"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            disabled={updating || match.status === "finished"}
          />
        </div>
        <div>
          <Label htmlFor="away-score">Away Score</Label>
          <Input
            id="away-score"
            type="number"
            min="0"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            disabled={updating || match.status === "finished"}
          />
        </div>
      </div>
      <Button
        onClick={handleUpdateScore}
        disabled={updating || match.status === "finished"}
        className="mt-4 w-full"
      >
        {updating ? "Updating..." : "Update Score"}
      </Button>
      {match.status === "finished" && (
        <p className="text-muted-foreground mt-2 text-sm">
          Score cannot be updated for finished matches
        </p>
      )}
    </div>
  );
}
