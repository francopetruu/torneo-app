import type { Standing } from "@/types/database.types";

interface StandingsCardProps {
  standing: Standing;
}

/**
 * StandingsCard component for mobile view
 * Displays team standings in a card format
 */
export default function StandingsCard({ standing }: StandingsCardProps) {
  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold">
            {standing.position ?? "-"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              {standing.logo_url && (
                <img
                  src={standing.logo_url}
                  alt={standing.team_name ?? "Team"}
                  className="h-6 w-6 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <h3 className="font-semibold">{standing.team_name ?? "-"}</h3>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{standing.points ?? 0}</div>
          <div className="text-muted-foreground text-xs">Points</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4">
        <div>
          <div className="text-muted-foreground text-xs">Matches</div>
          <div className="font-medium">{standing.matches_played ?? 0}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Record</div>
          <div className="font-medium">
            {standing.wins ?? 0}-{standing.draws ?? 0}-{standing.losses ?? 0}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Goals For</div>
          <div className="font-medium">{standing.goals_for ?? 0}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Goals Against</div>
          <div className="font-medium">{standing.goals_against ?? 0}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Goal Difference</div>
          <div className="font-medium">
            {standing.goal_difference !== null
              ? standing.goal_difference > 0
                ? `+${standing.goal_difference}`
                : standing.goal_difference
              : 0}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Cards</div>
          <div className="font-medium">
            <span className="text-yellow-600">{standing.yellow_cards ?? 0}</span>
            {" / "}
            <span className="text-red-600">{standing.red_cards ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
