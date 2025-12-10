-- Enable Row Level Security on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspended_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Teams: Public read, authenticated write
CREATE POLICY "Teams are viewable by everyone"
  ON teams FOR SELECT
  USING (true);

CREATE POLICY "Teams are insertable by authenticated users"
  ON teams FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Teams are updatable by authenticated users"
  ON teams FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Teams are deletable by authenticated users"
  ON teams FOR DELETE
  USING (auth.role() = 'authenticated');

-- Players: Public read, authenticated write
CREATE POLICY "Players are viewable by everyone"
  ON players FOR SELECT
  USING (true);

CREATE POLICY "Players are insertable by authenticated users"
  ON players FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Players are updatable by authenticated users"
  ON players FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Players are deletable by authenticated users"
  ON players FOR DELETE
  USING (auth.role() = 'authenticated');

-- Matches: Public read, authenticated write
CREATE POLICY "Matches are viewable by everyone"
  ON matches FOR SELECT
  USING (true);

CREATE POLICY "Matches are insertable by authenticated users"
  ON matches FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Matches are updatable by authenticated users"
  ON matches FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Matches are deletable by authenticated users"
  ON matches FOR DELETE
  USING (auth.role() = 'authenticated');

-- Match Events: Public read, authenticated write
CREATE POLICY "Match events are viewable by everyone"
  ON match_events FOR SELECT
  USING (true);

CREATE POLICY "Match events are insertable by authenticated users"
  ON match_events FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Match events are updatable by authenticated users"
  ON match_events FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Match events are deletable by authenticated users"
  ON match_events FOR DELETE
  USING (auth.role() = 'authenticated');

-- Team Statistics: Public read, system write only (via triggers)
CREATE POLICY "Team statistics are viewable by everyone"
  ON team_statistics FOR SELECT
  USING (true);

-- Note: Team statistics should only be updated by triggers/functions, not directly by users
-- We allow authenticated users to insert/update for initialization purposes
CREATE POLICY "Team statistics are insertable by authenticated users"
  ON team_statistics FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Team statistics are updatable by authenticated users"
  ON team_statistics FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Suspended Players: Public read, authenticated write
CREATE POLICY "Suspended players are viewable by everyone"
  ON suspended_players FOR SELECT
  USING (true);

CREATE POLICY "Suspended players are insertable by authenticated users"
  ON suspended_players FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Suspended players are updatable by authenticated users"
  ON suspended_players FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Suspended players are deletable by authenticated users"
  ON suspended_players FOR DELETE
  USING (auth.role() = 'authenticated');

-- Banners: Public read, authenticated write
CREATE POLICY "Banners are viewable by everyone"
  ON banners FOR SELECT
  USING (true);

CREATE POLICY "Banners are insertable by authenticated users"
  ON banners FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Banners are updatable by authenticated users"
  ON banners FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Banners are deletable by authenticated users"
  ON banners FOR DELETE
  USING (auth.role() = 'authenticated');

-- Views: Public read access (views inherit RLS from underlying tables)
-- No additional policies needed for views as they use underlying table policies





