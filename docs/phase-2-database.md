# Phase 2: Database Setup

## Task

Set up Supabase project and create complete database schema.

## Steps

### 1. Supabase Configuration

- Initialize Supabase CLI in project
- Create supabase/config.toml
- Set up local development environment

### 2. Database Schema

Create migrations for:

- teams table
- players table
- matches table
- match_events table (goals, cards)
- team_statistics table
- suspended_players table
- banners table

### 3. Database Features

- UUID primary keys
- Timestamps (created_at, updated_at)
- Foreign key constraints
- Indexes for performance
- Update triggers for updated_at fields

### 4. Row Level Security

- Public read access for all tables
- Authenticated write access for admin users

### 5. Database Views

- standings view (team rankings)
- top_scorers view (player statistics)

### 6. Triggers & Functions

- Auto-update team_statistics after match events
- Auto-calculate points, goal difference
- Track yellow/red cards

### 7. TypeScript Types

- Generate database types from schema
- Place in apps/client/src/types/database.types.ts
- Copy to apps/admin/src/types/database.types.ts

## Technical Specifications

// Teams Table
interface Team {
id: string; // UUID
name: string;
logo_url: string | null;
created_at: timestamp;
updated_at: timestamp;
}

// Players Table
interface Player {
id: string; // UUID
team_id: string; // Foreign key
name: string;
jersey_number: number;
photo_url: string | null;
created_at: timestamp;
updated_at: timestamp;
}

// Matches Table
interface Match {
id: string; // UUID
home_team_id: string; // Foreign key
away_team_id: string; // Foreign key
home_score: number;
away_score: number;
match_date: timestamp;
status: 'scheduled' | 'in_progress' | 'finished';
venue: string | null;
created_at: timestamp;
updated_at: timestamp;
}

// Match Events Table (Goals, Cards)
interface MatchEvent {
id: string; // UUID
match_id: string; // Foreign key
player_id: string; // Foreign key
event_type: 'goal' | 'yellow_card' | 'red_card';
minute: number | null;
created_at: timestamp;
}

// Team Statistics (Computed/Cached)
interface TeamStatistics {
id: string; // UUID
team_id: string; // Foreign key (unique)
matches_played: number;
wins: number;
draws: number;
losses: number;
goals_for: number;
goals_against: number;
goal_difference: number;
points: number;
yellow_cards: number;
red_cards: number;
updated_at: timestamp;
}

// Suspended Players Table
interface SuspendedPlayer {
id: string; // UUID
player_id: string; // Foreign key
suspension_reason: string;
matches_remaining: number;
created_at: timestamp;
updated_at: timestamp;
}

// Banners/Announcements Table
interface Banner {
id: string; // UUID
title: string;
description: string | null;
image_url: string | null;
active: boolean;
display_order: number;
created_at: timestamp;
updated_at: timestamp;
}
