import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMatches, type MatchWithTeams } from "@/hooks/useMatches";
import { useRealtimeMatches } from "@/hooks/useRealtimeMatches";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type MatchStatus = "scheduled" | "in_progress" | "finished" | "all";

interface GroupedMatches {
  [date: string]: MatchWithTeams[];
}

/**
 * MatchesList component displays matches with filtering and real-time updates
 * - Groups matches by date
 * - Filters by status (scheduled, in_progress, finished)
 * - Real-time updates when scores change
 * - Click on match to navigate to detail page
 * - Responsive design
 */
export default function MatchesList() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<MatchStatus>("all");
  const {
    matches: initialMatches,
    loading,
    error,
  } = useMatches(statusFilter === "all" ? undefined : statusFilter);
  const [matches, setMatches] = useState<MatchWithTeams[]>(initialMatches);

  // Update matches when real-time changes occur
  const handleMatchesUpdate = useCallback((updatedMatches: MatchWithTeams[]) => {
    setMatches(updatedMatches);
  }, []);

  // Sync initial matches when they load
  useEffect(() => {
    if (initialMatches.length > 0) {
      setMatches(initialMatches);
    }
  }, [initialMatches]);

  // Subscribe to real-time updates
  useRealtimeMatches({
    matches,
    onUpdate: handleMatchesUpdate,
    statusFilter: statusFilter === "all" ? undefined : statusFilter,
  });

  // Group matches by date
  const groupedMatches = useMemo<GroupedMatches>(() => {
    const grouped: GroupedMatches = {};

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

    return grouped;
  }, [matches]);

  // Format time from date string
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge variant
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

  // Get status label
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
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="text-muted-foreground">Loading matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-destructive bg-destructive/10 rounded-lg border p-4">
        <p className="text-destructive text-sm font-medium">
          Error loading matches: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter("all")}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            statusFilter === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-background hover:bg-muted"
          )}
        >
          All Matches
        </button>
        <button
          onClick={() => setStatusFilter("scheduled")}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            statusFilter === "scheduled"
              ? "bg-primary text-primary-foreground"
              : "bg-background hover:bg-muted"
          )}
        >
          Scheduled
        </button>
        <button
          onClick={() => setStatusFilter("in_progress")}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            statusFilter === "in_progress"
              ? "bg-primary text-primary-foreground"
              : "bg-background hover:bg-muted"
          )}
        >
          Live
        </button>
        <button
          onClick={() => setStatusFilter("finished")}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            statusFilter === "finished"
              ? "bg-primary text-primary-foreground"
              : "bg-background hover:bg-muted"
          )}
        >
          Finished
        </button>
      </div>

      {/* Matches List */}
      {matches.length === 0 ? (
        <div className="border-border bg-muted/50 rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">No matches found</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedMatches).map(([date, dateMatches]) => (
            <div key={date} className="space-y-4">
              <h3 className="text-foreground text-lg font-semibold">{date}</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dateMatches.map((match) => (
                  <Card
                    key={match.id}
                    className="cursor-pointer transition-shadow hover:shadow-md"
                    onClick={() => navigate(`/match/${match.id}`)}
                  >
                    <CardContent className="p-4">
                      {/* Match Status Badge */}
                      <div className="mb-3 flex items-center justify-between">
                        <Badge variant={getStatusBadgeVariant(match.status)}>
                          {getStatusLabel(match.status)}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          {formatTime(match.match_date)}
                        </span>
                      </div>

                      {/* Teams and Score */}
                      <div className="space-y-3">
                        {/* Home Team */}
                        <div className="flex items-center justify-between">
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            {match.home_team.logo_url && (
                              <img
                                src={match.home_team.logo_url}
                                alt={match.home_team.name}
                                className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            )}
                            <span className="truncate font-medium">{match.home_team.name}</span>
                          </div>
                          <span
                            className={cn(
                              "ml-2 text-lg font-bold",
                              match.status === "finished" && "text-foreground"
                            )}
                          >
                            {match.status === "finished" || match.status === "in_progress"
                              ? match.home_score
                              : "-"}
                          </span>
                        </div>

                        {/* Away Team */}
                        <div className="flex items-center justify-between">
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            {match.away_team.logo_url && (
                              <img
                                src={match.away_team.logo_url}
                                alt={match.away_team.name}
                                className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            )}
                            <span className="truncate font-medium">{match.away_team.name}</span>
                          </div>
                          <span
                            className={cn(
                              "ml-2 text-lg font-bold",
                              match.status === "finished" && "text-foreground"
                            )}
                          >
                            {match.status === "finished" || match.status === "in_progress"
                              ? match.away_score
                              : "-"}
                          </span>
                        </div>
                      </div>

                      {/* Venue */}
                      {match.venue && (
                        <div className="mt-3 border-t pt-3">
                          <p className="text-muted-foreground text-xs">
                            <span className="font-medium">Venue:</span> {match.venue}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
