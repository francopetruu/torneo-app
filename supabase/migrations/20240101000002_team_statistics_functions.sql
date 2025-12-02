-- Function to initialize team statistics for a team
CREATE OR REPLACE FUNCTION initialize_team_statistics(team_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO team_statistics (team_id)
  VALUES (team_uuid)
  ON CONFLICT (team_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate team statistics for a team
CREATE OR REPLACE FUNCTION recalculate_team_statistics(team_uuid UUID)
RETURNS VOID AS $$
DECLARE
  v_matches_played INTEGER;
  v_wins INTEGER;
  v_draws INTEGER;
  v_losses INTEGER;
  v_goals_for INTEGER;
  v_goals_against INTEGER;
  v_goal_difference INTEGER;
  v_points INTEGER;
  v_yellow_cards INTEGER;
  v_red_cards INTEGER;
BEGIN
  -- Calculate matches played, wins, draws, losses
  SELECT 
    COUNT(*) FILTER (WHERE status = 'finished'),
    COUNT(*) FILTER (WHERE status = 'finished' AND (
      (home_team_id = team_uuid AND home_score > away_score) OR
      (away_team_id = team_uuid AND away_score > home_score)
    )),
    COUNT(*) FILTER (WHERE status = 'finished' AND home_score = away_score),
    COUNT(*) FILTER (WHERE status = 'finished' AND (
      (home_team_id = team_uuid AND home_score < away_score) OR
      (away_team_id = team_uuid AND away_score < home_score)
    ))
  INTO v_matches_played, v_wins, v_draws, v_losses
  FROM matches
  WHERE (home_team_id = team_uuid OR away_team_id = team_uuid)
    AND status = 'finished';

  -- Calculate goals for and against
  SELECT 
    COALESCE(SUM(CASE WHEN home_team_id = team_uuid THEN home_score ELSE away_score END), 0),
    COALESCE(SUM(CASE WHEN home_team_id = team_uuid THEN away_score ELSE home_score END), 0)
  INTO v_goals_for, v_goals_against
  FROM matches
  WHERE (home_team_id = team_uuid OR away_team_id = team_uuid)
    AND status = 'finished';

  -- Calculate goal difference
  v_goal_difference := v_goals_for - v_goals_against;

  -- Calculate points (3 for win, 1 for draw)
  v_points := (v_wins * 3) + (v_draws * 1);

  -- Calculate yellow and red cards for team players
  SELECT 
    COUNT(*) FILTER (WHERE event_type = 'yellow_card'),
    COUNT(*) FILTER (WHERE event_type = 'red_card')
  INTO v_yellow_cards, v_red_cards
  FROM match_events me
  JOIN players p ON me.player_id = p.id
  WHERE p.team_id = team_uuid;

  -- Update or insert team statistics
  INSERT INTO team_statistics (
    team_id,
    matches_played,
    wins,
    draws,
    losses,
    goals_for,
    goals_against,
    goal_difference,
    points,
    yellow_cards,
    red_cards
  )
  VALUES (
    team_uuid,
    COALESCE(v_matches_played, 0),
    COALESCE(v_wins, 0),
    COALESCE(v_draws, 0),
    COALESCE(v_losses, 0),
    COALESCE(v_goals_for, 0),
    COALESCE(v_goals_against, 0),
    COALESCE(v_goal_difference, 0),
    COALESCE(v_points, 0),
    COALESCE(v_yellow_cards, 0),
    COALESCE(v_red_cards, 0)
  )
  ON CONFLICT (team_id) DO UPDATE SET
    matches_played = EXCLUDED.matches_played,
    wins = EXCLUDED.wins,
    draws = EXCLUDED.draws,
    losses = EXCLUDED.losses,
    goals_for = EXCLUDED.goals_for,
    goals_against = EXCLUDED.goals_against,
    goal_difference = EXCLUDED.goal_difference,
    points = EXCLUDED.points,
    yellow_cards = EXCLUDED.yellow_cards,
    red_cards = EXCLUDED.red_cards,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate statistics for both teams in a match
CREATE OR REPLACE FUNCTION recalculate_match_team_statistics(match_uuid UUID)
RETURNS VOID AS $$
DECLARE
  v_home_team_id UUID;
  v_away_team_id UUID;
BEGIN
  SELECT home_team_id, away_team_id
  INTO v_home_team_id, v_away_team_id
  FROM matches
  WHERE id = match_uuid;

  IF v_home_team_id IS NOT NULL THEN
    PERFORM recalculate_team_statistics(v_home_team_id);
  END IF;

  IF v_away_team_id IS NOT NULL THEN
    PERFORM recalculate_team_statistics(v_away_team_id);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to recalculate statistics when a match is finished or updated
CREATE OR REPLACE FUNCTION trigger_recalculate_team_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Only recalculate if match status changed to finished or match scores changed
  IF (TG_OP = 'UPDATE' AND (
    OLD.status != NEW.status OR
    OLD.home_score != NEW.home_score OR
    OLD.away_score != NEW.away_score
  )) OR (TG_OP = 'INSERT' AND NEW.status = 'finished') THEN
    PERFORM recalculate_match_team_statistics(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER match_statistics_trigger
  AFTER INSERT OR UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_team_statistics();

-- Trigger to recalculate statistics when match events are added/updated/deleted
CREATE OR REPLACE FUNCTION trigger_recalculate_statistics_on_event()
RETURNS TRIGGER AS $$
DECLARE
  v_match_id UUID;
  v_player_team_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_match_id := OLD.match_id;
    -- Get team_id from player
    SELECT team_id INTO v_player_team_id
    FROM players
    WHERE id = OLD.player_id;
  ELSE
    v_match_id := NEW.match_id;
    -- Get team_id from player
    SELECT team_id INTO v_player_team_id
    FROM players
    WHERE id = NEW.player_id;
  END IF;

  -- Recalculate statistics for the player's team
  IF v_player_team_id IS NOT NULL THEN
    PERFORM recalculate_team_statistics(v_player_team_id);
  END IF;

  -- Recalculate statistics for both teams in the match (for goals)
  IF TG_OP != 'DELETE' AND NEW.event_type = 'goal' THEN
    PERFORM recalculate_match_team_statistics(v_match_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER match_event_statistics_trigger
  AFTER INSERT OR UPDATE OR DELETE ON match_events
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_statistics_on_event();




