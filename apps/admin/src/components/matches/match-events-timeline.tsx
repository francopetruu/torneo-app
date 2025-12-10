import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Database } from "@/types/database.types";

type MatchEvent = Database["public"]["Tables"]["match_events"]["Row"];
type Match = Database["public"]["Tables"]["matches"]["Row"];
type Player = Database["public"]["Tables"]["players"]["Row"];

interface MatchEventWithPlayer extends MatchEvent {
  player: Player;
}

interface MatchEventsTimelineProps {
  match: Match;
  refreshTrigger?: number;
  onEventChange?: () => void;
}

/**
 * MatchEventsTimeline component displays match events chronologically
 * Allows adding, editing, and deleting events
 */
export default function MatchEventsTimeline({
  match,
  refreshTrigger,
  onEventChange,
}: MatchEventsTimelineProps) {
  const { toast } = useToast();
  const [events, setEvents] = useState<MatchEventWithPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [editEventOpen, setEditEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<MatchEventWithPlayer | null>(null);
  const [homePlayers, setHomePlayers] = useState<Player[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<Player[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<"home" | "away">("home");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [eventType, setEventType] = useState<"goal" | "yellow_card" | "red_card">("goal");
  const [minute, setMinute] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("match_events")
        .select(
          `
          *,
          player:players(*)
        `
        )
        .eq("match_id", match.id)
        .order("minute", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true });

      if (error) throw error;

      setEvents(
        (data || []).map((event) => ({
          ...event,
          player: event.player as Player,
        }))
      );
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: "Failed to load match events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch players for both teams
  const fetchPlayers = async () => {
    try {
      const [homeData, awayData] = await Promise.all([
        supabase.from("players").select("*").eq("team_id", match.home_team_id),
        supabase.from("players").select("*").eq("team_id", match.away_team_id),
      ]);

      if (homeData.error) throw homeData.error;
      if (awayData.error) throw awayData.error;

      setHomePlayers(homeData.data || []);
      setAwayPlayers(awayData.data || []);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.id, refreshTrigger]);

  // Reset form
  const resetForm = () => {
    setSelectedTeam("home");
    setSelectedPlayerId("");
    setEventType("goal");
    setMinute("");
    setSelectedEvent(null);
  };

  // Validate player belongs to team
  const validatePlayer = (playerId: string, team: "home" | "away"): boolean => {
    const players = team === "home" ? homePlayers : awayPlayers;
    return players.some((p) => p.id === playerId);
  };

  // Check for duplicate simultaneous goals
  const checkDuplicateGoal = async (
    playerId: string,
    minute: number | null,
    excludeEventId?: string
  ): Promise<boolean> => {
    const duplicateEvents = events.filter(
      (e) =>
        e.id !== excludeEventId &&
        e.event_type === "goal" &&
        e.player_id === playerId &&
        e.minute === minute
    );
    return duplicateEvents.length > 0;
  };

  const handleAddEvent = async () => {
    if (!selectedPlayerId) {
      toast({
        title: "Validation Error",
        description: "Please select a player",
        variant: "destructive",
      });
      return;
    }

    // Validate player belongs to selected team
    if (!validatePlayer(selectedPlayerId, selectedTeam)) {
      toast({
        title: "Validation Error",
        description: "Selected player does not belong to the selected team",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate goals
    const minuteNum = minute ? parseInt(minute) : null;
    if (eventType === "goal" && (await checkDuplicateGoal(selectedPlayerId, minuteNum))) {
      toast({
        title: "Duplicate Goal",
        description: "This player already has a goal at this minute",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase.from("match_events").insert({
        match_id: match.id,
        player_id: selectedPlayerId,
        event_type: eventType,
        minute: minuteNum,
      });

      if (error) throw error;

      toast({
        title: "Event added",
        description: "Match event has been added successfully.",
      });

      setAddEventOpen(false);
      resetForm();
      fetchEvents();
      onEventChange?.();
    } catch (error) {
      console.error("Error adding event:", error);
      toast({
        title: "Error",
        description: "Failed to add event",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditEvent = async () => {
    if (!selectedEvent || !selectedPlayerId) return;

    const minuteNum = minute ? parseInt(minute) : null;

    // Check for duplicate goals (excluding current event)
    if (eventType === "goal") {
      const isDuplicate = await checkDuplicateGoal(selectedPlayerId, minuteNum, selectedEvent.id);
      if (isDuplicate) {
        toast({
          title: "Duplicate Goal",
          description: "This player already has a goal at this minute",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from("match_events")
        .update({
          player_id: selectedPlayerId,
          event_type: eventType,
          minute: minuteNum,
        })
        .eq("id", selectedEvent.id);

      if (error) throw error;

      toast({
        title: "Event updated",
        description: "Match event has been updated successfully.",
      });

      setEditEventOpen(false);
      resetForm();
      fetchEvents();
      onEventChange?.();
    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const { error } = await supabase.from("match_events").delete().eq("id", eventId);

      if (error) throw error;

      toast({
        title: "Event deleted",
        description: "Match event has been deleted successfully.",
      });

      fetchEvents();
      onEventChange?.();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (event: MatchEventWithPlayer) => {
    setSelectedEvent(event);
    // Determine which team the player belongs to
    const isHomePlayer = homePlayers.some((p) => p.id === event.player_id);
    setSelectedTeam(isHomePlayer ? "home" : "away");
    setSelectedPlayerId(event.player_id);
    setEventType(event.event_type as "goal" | "yellow_card" | "red_card");
    setMinute(event.minute?.toString() || "");
    setEditEventOpen(true);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "goal":
        return "⚽";
      case "yellow_card":
        return "🟨";
      case "red_card":
        return "🟥";
      default:
        return "•";
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case "goal":
        return "Goal";
      case "yellow_card":
        return "Yellow Card";
      case "red_card":
        return "Red Card";
      default:
        return type;
    }
  };

  const currentPlayers = selectedTeam === "home" ? homePlayers : awayPlayers;

  if (loading) {
    return <div className="text-muted-foreground text-center">Loading events...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Match Events</h3>
        <Button onClick={() => setAddEventOpen(true)} size="sm">
          Add Event
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center">
          No events yet. Add events to track goals and cards.
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div key={event.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getEventIcon(event.event_type)}</span>
                <div>
                  <div className="font-medium">
                    {getEventLabel(event.event_type)} - {event.player.name}
                  </div>
                  {event.minute !== null && (
                    <div className="text-muted-foreground text-sm">{event.minute}&apos;</div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(event)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Event Dialog */}
      <Dialog open={addEventOpen} onOpenChange={setAddEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Match Event</DialogTitle>
            <DialogDescription>Add a goal, yellow card, or red card</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Team</Label>
              <Select
                value={selectedTeam}
                onValueChange={(value) => setSelectedTeam(value as "home" | "away")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home Team</SelectItem>
                  <SelectItem value="away">Away Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Player</Label>
              <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select player" />
                </SelectTrigger>
                <SelectContent>
                  {currentPlayers.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      #{player.jersey_number} - {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Event Type</Label>
              <Select
                value={eventType}
                onValueChange={(value) =>
                  setEventType(value as "goal" | "yellow_card" | "red_card")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="goal">Goal</SelectItem>
                  <SelectItem value="yellow_card">Yellow Card</SelectItem>
                  <SelectItem value="red_card">Red Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Minute (optional)</Label>
              <Input
                type="number"
                min="0"
                max="90"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                placeholder="e.g., 45"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddEventOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent} disabled={saving}>
              {saving ? "Adding..." : "Add Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={editEventOpen} onOpenChange={setEditEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Match Event</DialogTitle>
            <DialogDescription>Update event details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Team</Label>
              <Select
                value={selectedTeam}
                onValueChange={(value) => setSelectedTeam(value as "home" | "away")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home Team</SelectItem>
                  <SelectItem value="away">Away Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Player</Label>
              <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select player" />
                </SelectTrigger>
                <SelectContent>
                  {currentPlayers.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      #{player.jersey_number} - {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Event Type</Label>
              <Select
                value={eventType}
                onValueChange={(value) =>
                  setEventType(value as "goal" | "yellow_card" | "red_card")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="goal">Goal</SelectItem>
                  <SelectItem value="yellow_card">Yellow Card</SelectItem>
                  <SelectItem value="red_card">Red Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Minute (optional)</Label>
              <Input
                type="number"
                min="0"
                max="90"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                placeholder="e.g., 45"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEventOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditEvent} disabled={saving}>
              {saving ? "Updating..." : "Update Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
