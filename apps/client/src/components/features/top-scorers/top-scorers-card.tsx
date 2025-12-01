import { useState } from "react";
import type { TopScorerWithRank } from "@/hooks/useTopScorers";

interface TopScorersCardProps {
  scorer: TopScorerWithRank;
}

/**
 * PlayerPhoto component handles player photo display with fallback
 */
function PlayerPhoto({
  photoUrl,
  playerName,
}: {
  photoUrl: string | null;
  playerName: string | null;
}) {
  const [imageError, setImageError] = useState(false);

  if (!photoUrl || imageError) {
    return (
      <div className="bg-muted flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full">
        <span className="text-lg font-semibold">{(playerName ?? "P")[0].toUpperCase()}</span>
      </div>
    );
  }

  return (
    <img
      src={photoUrl}
      alt={playerName ?? "Player"}
      className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
      onError={() => setImageError(true)}
    />
  );
}

/**
 * TopScorersCard component for mobile view
 * Displays player top scorer information in a card format
 */
export default function TopScorersCard({ scorer }: TopScorersCardProps) {
  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold">
            {scorer.rank}
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <PlayerPhoto photoUrl={scorer.photo_url} playerName={scorer.player_name} />
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold">{scorer.player_name ?? "-"}</h3>
              <div className="mt-1 flex items-center gap-2">
                {scorer.team_logo_url && (
                  <img
                    src={scorer.team_logo_url}
                    alt={scorer.team_name ?? "Team"}
                    className="h-4 w-4 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <span className="text-muted-foreground truncate text-sm">
                  {scorer.team_name ?? "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="ml-4 text-right">
          <div className="text-2xl font-bold">{scorer.goals ?? 0}</div>
          <div className="text-muted-foreground text-xs">Goals</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4">
        <div>
          <div className="text-muted-foreground text-xs">Jersey #</div>
          <div className="font-medium">{scorer.jersey_number ?? "-"}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Matches</div>
          <div className="font-medium">{scorer.matches_with_goals ?? 0}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Yellow Cards</div>
          <div className="font-medium text-yellow-600">{scorer.yellow_cards ?? 0}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Red Cards</div>
          <div className="font-medium text-red-600">{scorer.red_cards ?? 0}</div>
        </div>
      </div>
    </div>
  );
}
