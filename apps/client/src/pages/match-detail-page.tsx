import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Match = Database["public"]["Tables"]["matches"]["Row"];
type Team = Database["public"]["Tables"]["teams"]["Row"];

interface MatchWithTeams extends Match {
  home_team: Team;
  away_team: Team;
}

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [match, setMatch] = useState<MatchWithTeams | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setError(new Error("Match ID is required"));
      setLoading(false);
      return;
    }

    const fetchMatch = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("matches")
          .select(
            `
            *,
            home_team:teams!matches_home_team_id_fkey(*),
            away_team:teams!matches_away_team_id_fkey(*)
          `
          )
          .eq("id", id)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          setMatch({
            ...data,
            home_team: data.home_team as Team,
            away_team: data.away_team as Team,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch match"));
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`match-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
          filter: `id=eq.${id}`,
        },
        async () => {
          const { data } = await supabase
            .from("matches")
            .select(
              `
              *,
              home_team:teams!matches_home_team_id_fkey(*),
              away_team:teams!matches_away_team_id_fkey(*)
            `
            )
            .eq("id", id)
            .single();

          if (data) {
            setMatch({
              ...data,
              home_team: data.home_team as Team,
              away_team: data.away_team as Team,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "scheduled":
        return "secondary";
      case "in_progress":
        return "default";
      case "finished":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Scheduled";
      case "in_progress":
        return "Live";
      case "finished":
        return "Finished";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
            <p className="text-muted-foreground">Loading match details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="border-destructive bg-destructive/10 rounded-lg border p-4">
          <p className="text-destructive text-sm font-medium">
            {error?.message || "Match not found"}
          </p>
          <button
            onClick={() => navigate("/matches")}
            className="text-primary mt-4 text-sm hover:underline"
          >
            Back to Matches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/matches")}
        className="text-muted-foreground hover:text-foreground mb-6 text-sm"
      >
        ← Back to Matches
      </button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Match Details</CardTitle>
            <Badge variant={getStatusBadgeVariant(match.status)}>
              {getStatusLabel(match.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date and Time */}
          <div>
            <p className="text-muted-foreground text-sm">Date & Time</p>
            <p className="text-lg font-medium">{formatDate(match.match_date)}</p>
            <p className="text-muted-foreground text-sm">{formatTime(match.match_date)}</p>
          </div>

          {/* Venue */}
          {match.venue && (
            <div>
              <p className="text-muted-foreground text-sm">Venue</p>
              <p className="text-lg font-medium">{match.venue}</p>
            </div>
          )}

          {/* Teams and Score */}
          <div className="space-y-4">
            {/* Home Team */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-4">
                {match.home_team.logo_url && (
                  <img
                    src={match.home_team.logo_url}
                    alt={match.home_team.name}
                    className="h-12 w-12 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <div>
                  <p className="font-semibold">{match.home_team.name}</p>
                  <p className="text-muted-foreground text-sm">Home</p>
                </div>
              </div>
              <span
                className={cn(
                  "text-3xl font-bold",
                  match.status === "finished" && "text-foreground"
                )}
              >
                {match.status === "finished" || match.status === "in_progress"
                  ? match.home_score
                  : "-"}
              </span>
            </div>

            {/* Away Team */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-4">
                {match.away_team.logo_url && (
                  <img
                    src={match.away_team.logo_url}
                    alt={match.away_team.name}
                    className="h-12 w-12 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <div>
                  <p className="font-semibold">{match.away_team.name}</p>
                  <p className="text-muted-foreground text-sm">Away</p>
                </div>
              </div>
              <span
                className={cn(
                  "text-3xl font-bold",
                  match.status === "finished" && "text-foreground"
                )}
              >
                {match.status === "finished" || match.status === "in_progress"
                  ? match.away_score
                  : "-"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
