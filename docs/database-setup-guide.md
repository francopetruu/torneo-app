# Database Setup Guide

This guide explains the database schema, migrations, and how to set up the database for the Beach Football Tournament application.

## Overview

The database consists of 7 main tables, 2 views, and various triggers and functions for automatic calculations.

## Tables

### 1. `teams`

Stores tournament teams.

**Columns:**

- `id` (UUID, Primary Key)
- `name` (TEXT, Required)
- `logo_url` (TEXT, Nullable)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### 2. `players`

Stores players belonging to teams.

**Columns:**

- `id` (UUID, Primary Key)
- `team_id` (UUID, Foreign Key → teams.id)
- `name` (TEXT, Required)
- `jersey_number` (INTEGER, Required)
- `photo_url` (TEXT, Nullable)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Constraints:**

- Unique constraint on `(team_id, jersey_number)` - each team can only have one player per jersey number

### 3. `matches`

Stores match fixtures and results.

**Columns:**

- `id` (UUID, Primary Key)
- `home_team_id` (UUID, Foreign Key → teams.id)
- `away_team_id` (UUID, Foreign Key → teams.id)
- `home_score` (INTEGER, Default: 0)
- `away_score` (INTEGER, Default: 0)
- `match_date` (TIMESTAMPTZ, Required)
- `status` (TEXT, Default: 'scheduled')
  - Values: 'scheduled', 'in_progress', 'finished'
- `venue` (TEXT, Nullable)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Constraints:**

- `home_team_id` must be different from `away_team_id`

### 4. `match_events`

Stores goals, yellow cards, and red cards.

**Columns:**

- `id` (UUID, Primary Key)
- `match_id` (UUID, Foreign Key → matches.id)
- `player_id` (UUID, Foreign Key → players.id)
- `event_type` (TEXT, Required)
  - Values: 'goal', 'yellow_card', 'red_card'
- `minute` (INTEGER, Nullable)
- `created_at` (TIMESTAMPTZ)

### 5. `team_statistics`

Auto-calculated team statistics (updated by triggers).

**Columns:**

- `id` (UUID, Primary Key)
- `team_id` (UUID, Foreign Key → teams.id, Unique)
- `matches_played` (INTEGER, Default: 0)
- `wins` (INTEGER, Default: 0)
- `draws` (INTEGER, Default: 0)
- `losses` (INTEGER, Default: 0)
- `goals_for` (INTEGER, Default: 0)
- `goals_against` (INTEGER, Default: 0)
- `goal_difference` (INTEGER, Default: 0)
- `points` (INTEGER, Default: 0)
- `yellow_cards` (INTEGER, Default: 0)
- `red_cards` (INTEGER, Default: 0)
- `updated_at` (TIMESTAMPTZ)

**Note:** This table is automatically updated by triggers when matches are finished or match events are added/updated/deleted.

### 6. `suspended_players`

Stores player suspensions.

**Columns:**

- `id` (UUID, Primary Key)
- `player_id` (UUID, Foreign Key → players.id)
- `suspension_reason` (TEXT, Required)
- `matches_remaining` (INTEGER, Default: 0, Must be >= 0)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### 7. `banners`

Stores announcements and banners.

**Columns:**

- `id` (UUID, Primary Key)
- `title` (TEXT, Required)
- `description` (TEXT, Nullable)
- `image_url` (TEXT, Nullable)
- `active` (BOOLEAN, Default: true)
- `display_order` (INTEGER, Default: 0)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

## Views

### 1. `standings`

Team rankings ordered by points, goal difference, goals for.

**Columns:**

- `team_id`
- `team_name`
- `logo_url`
- `matches_played`
- `wins`
- `draws`
- `losses`
- `goals_for`
- `goals_against`
- `goal_difference`
- `points`
- `yellow_cards`
- `red_cards`
- `position` (calculated row number)

**Ordering:**

1. Points (DESC)
2. Goal difference (DESC)
3. Goals for (DESC)
4. Team name (ASC)

### 2. `top_scorers`

Player goal statistics.

**Columns:**

- `player_id`
- `player_name`
- `jersey_number`
- `photo_url`
- `team_id`
- `team_name`
- `team_logo_url`
- `goals`
- `yellow_cards`
- `red_cards`
- `matches_with_goals`

**Filtering:** Only includes players who have scored at least one goal.

**Ordering:**

1. Goals (DESC)
2. Matches with goals (DESC)
3. Player name (ASC)

## Functions and Triggers

### Updated At Trigger

- **Function:** `update_updated_at_column()`
- **Purpose:** Automatically updates `updated_at` timestamp when a row is updated
- **Applied to:** All tables with `updated_at` column

### Team Statistics Functions

#### `initialize_team_statistics(team_uuid UUID)`

Initializes team statistics for a team if they don't exist.

#### `recalculate_team_statistics(team_uuid UUID)`

Recalculates all statistics for a specific team based on:

- Finished matches (wins, draws, losses, goals)
- Match events (yellow cards, red cards)

#### `recalculate_match_team_statistics(match_uuid UUID)`

Recalculates statistics for both teams in a match.

#### Triggers

1. **`match_statistics_trigger`**
   - Fires: After INSERT or UPDATE on `matches`
   - Action: Recalculates statistics for both teams when match status changes to 'finished' or scores change

2. **`match_event_statistics_trigger`**
   - Fires: After INSERT, UPDATE, or DELETE on `match_events`
   - Action:
     - Recalculates statistics for the player's team (for cards)
     - Recalculates statistics for both teams in the match (for goals)

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

- **SELECT:** Public access (everyone can read)
- **INSERT:** Authenticated users only
- **UPDATE:** Authenticated users only
- **DELETE:** Authenticated users only

## Migrations

Migrations are located in `supabase/migrations/` and should be run in order:

1. **`20240101000000_initial_schema.sql`**
   - Creates all tables
   - Creates indexes for performance
   - Sets up foreign key constraints

2. **`20240101000001_updated_at_trigger.sql`**
   - Creates `update_updated_at_column()` function
   - Applies triggers to all tables with `updated_at`

3. **`20240101000002_team_statistics_functions.sql`**
   - Creates functions for calculating team statistics
   - Creates triggers to auto-update statistics

4. **`20240101000003_views.sql`**
   - Creates `standings` view
   - Creates `top_scorers` view

5. **`20240101000004_rls_policies.sql`**
   - Enables RLS on all tables
   - Creates policies for public read, authenticated write

6. **`20240101000005_seed_data.sql`**
   - Inserts sample teams, players, matches, and events
   - Useful for testing and development

## Setup Instructions

### Local Development

1. **Start Supabase locally:**

   ```bash
   supabase start
   ```

2. **Run migrations:**

   ```bash
   supabase db reset
   ```

   This will run all migrations and seed data.

3. **Generate TypeScript types:**

   ```bash
   # On Windows (PowerShell)
   .\scripts\generate-types.ps1 local

   # On Unix/Mac
   ./scripts/generate-types.sh local
   ```

### Remote Setup

1. **Link to your Supabase project:**

   ```bash
   supabase link --project-ref <your-project-ref>
   ```

2. **Push migrations:**

   ```bash
   supabase db push
   ```

3. **Generate TypeScript types:**

   ```bash
   # On Windows (PowerShell)
   .\scripts\generate-types.ps1 remote

   # On Unix/Mac
   ./scripts/generate-types.sh remote
   ```

## Seed Data

The seed data migration includes:

- **4 teams:** Beach FC, Sand Sharks, Wave Riders, Tide Breakers
- **20 players:** 5 players per team
- **6 matches:** 4 finished, 2 scheduled
- **20 match events:** Goals, yellow cards, red cards
- **3 banners:** 2 active, 1 inactive

After running migrations, you can query the database to see the sample data:

```sql
-- View standings
SELECT * FROM standings;

-- View top scorers
SELECT * FROM top_scorers;

-- View teams
SELECT * FROM teams;

-- View matches
SELECT * FROM matches WHERE status = 'finished';
```

## TypeScript Types

TypeScript types are generated from the database schema and located in:

- `apps/client/src/types/database.types.ts`
- `apps/admin/src/types/database.types.ts`

These types include:

- Table row types (e.g., `Team`, `Player`, `Match`)
- Insert types (e.g., `TeamInsert`, `PlayerInsert`)
- Update types (e.g., `TeamUpdate`, `PlayerUpdate`)
- View types (e.g., `Standing`, `TopScorer`)
- Full `Database` interface for type-safe Supabase client

## Usage Examples

### Querying Standings

```typescript
import { supabase } from "@/lib/supabase";
import type { Standing } from "@/types/database.types";

const { data: standings, error } = await supabase
  .from("standings")
  .select("*")
  .order("position", { ascending: true });
```

### Querying Top Scorers

```typescript
import { supabase } from "@/lib/supabase";
import type { TopScorer } from "@/types/database.types";

const { data: topScorers, error } = await supabase
  .from("top_scorers")
  .select("*")
  .order("goals", { ascending: false })
  .limit(10);
```

### Creating a Match

```typescript
import { supabase } from "@/lib/supabase";
import type { MatchInsert } from "@/types/database.types";

const newMatch: MatchInsert = {
  home_team_id: "team-uuid-1",
  away_team_id: "team-uuid-2",
  match_date: new Date().toISOString(),
  status: "scheduled",
  venue: "Beach Stadium 1",
};

const { data, error } = await supabase.from("matches").insert(newMatch).select().single();
```

### Adding a Goal Event

```typescript
import { supabase } from "@/lib/supabase";
import type { MatchEventInsert } from "@/types/database.types";

const goal: MatchEventInsert = {
  match_id: "match-uuid",
  player_id: "player-uuid",
  event_type: "goal",
  minute: 45,
};

const { data, error } = await supabase.from("match_events").insert(goal).select().single();

// Team statistics will be automatically recalculated!
```

## Notes

- Team statistics are automatically calculated - you should not manually update `team_statistics` table
- When a match status changes to 'finished', statistics for both teams are recalculated
- When match events are added/updated/deleted, statistics are recalculated for the affected teams
- The `standings` view uses `LEFT JOIN` so teams without statistics will still appear (with NULL values)
- The `top_scorers` view only includes players who have scored at least one goal
