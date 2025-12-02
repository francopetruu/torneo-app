-- Standings view: Team rankings ordered by points, goal difference, goals for
CREATE OR REPLACE VIEW standings AS
SELECT 
  t.id AS team_id,
  t.name AS team_name,
  t.logo_url,
  ts.matches_played,
  ts.wins,
  ts.draws,
  ts.losses,
  ts.goals_for,
  ts.goals_against,
  ts.goal_difference,
  ts.points,
  ts.yellow_cards,
  ts.red_cards,
  ROW_NUMBER() OVER (
    ORDER BY 
      ts.points DESC,
      ts.goal_difference DESC,
      ts.goals_for DESC,
      t.name ASC
  ) AS position
FROM teams t
LEFT JOIN team_statistics ts ON t.id = ts.team_id
ORDER BY 
  ts.points DESC NULLS LAST,
  ts.goal_difference DESC NULLS LAST,
  ts.goals_for DESC NULLS LAST,
  t.name ASC;

-- Top scorers view: Player goal statistics
CREATE OR REPLACE VIEW top_scorers AS
SELECT 
  p.id AS player_id,
  p.name AS player_name,
  p.jersey_number,
  p.photo_url,
  t.id AS team_id,
  t.name AS team_name,
  t.logo_url AS team_logo_url,
  COUNT(*) FILTER (WHERE me.event_type = 'goal') AS goals,
  COUNT(*) FILTER (WHERE me.event_type = 'yellow_card') AS yellow_cards,
  COUNT(*) FILTER (WHERE me.event_type = 'red_card') AS red_cards,
  COUNT(DISTINCT me.match_id) FILTER (WHERE me.event_type = 'goal') AS matches_with_goals
FROM players p
JOIN teams t ON p.team_id = t.id
LEFT JOIN match_events me ON p.id = me.player_id
GROUP BY p.id, p.name, p.jersey_number, p.photo_url, t.id, t.name, t.logo_url
HAVING COUNT(*) FILTER (WHERE me.event_type = 'goal') > 0
ORDER BY 
  goals DESC,
  matches_with_goals DESC,
  player_name ASC;




