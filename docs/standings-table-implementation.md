# Standings Table Implementation

## Overview

A real-time standings table component that displays tournament team rankings with automatic updates via Supabase Realtime.

## Features

- ✅ **Real-time Updates** - Automatically updates when matches or team statistics change
- ✅ **Responsive Design** - Table view on desktop, card view on mobile
- ✅ **Loading States** - Shows loading spinner while fetching data
- ✅ **Error Handling** - Displays error messages if data fetch fails
- ✅ **Empty State** - Shows message when no data is available
- ✅ **Sorted Data** - Automatically sorted by position (points, goal difference, goals for)

## File Structure

```
apps/client/src/
├── components/
│   └── features/
│       └── standings/
│           ├── standings-table.tsx    # Main component
│           └── standings-card.tsx     # Mobile card view
├── hooks/
│   ├── useStandings.ts                # Initial data fetching
│   └── useRealtimeStandings.ts       # Real-time subscription
└── types/
    └── database.types.ts              # TypeScript types (includes Standing type)
```

## Components

### StandingsTable (`standings-table.tsx`)

Main component that displays standings in two formats:

**Desktop View (md and up):**

- Full table with all columns
- Position, Team (with logo), MP, W-D-L, GF, GA, GD, Points, YC, RC

**Mobile View (below md):**

- Card-based layout
- Shows key information in a compact format
- Position badge, team name, points, and statistics grid

### StandingsCard (`standings-card.tsx`)

Mobile-optimized card component displaying:

- Position badge
- Team name and logo
- Points (prominent)
- Statistics grid (Matches, Record, Goals, Cards)

## Hooks

### useStandings()

Fetches initial standings data from the `standings` view.

**Returns:**

- `standings` - Array of Standing objects
- `loading` - Boolean loading state
- `error` - Error object or null
- `refetch` - Function to manually refetch data

**Usage:**

```typescript
const { standings, loading, error } = useStandings();
```

### useRealtimeStandings()

Subscribes to real-time updates for standings.

**Parameters:**

- `standings` - Current standings array
- `onUpdate` - Callback function when standings update

**Subscriptions:**

- Listens to `team_statistics` table changes
- Listens to `matches` table changes
- Automatically refetches standings when changes occur

**Usage:**

```typescript
useRealtimeStandings({
  standings,
  onUpdate: (updatedStandings) => {
    setStandings(updatedStandings);
  },
});
```

## Data Structure

The `Standing` type includes:

```typescript
type Standing = {
  team_id: string | null;
  team_name: string | null;
  logo_url: string | null;
  matches_played: number | null;
  wins: number | null;
  draws: number | null;
  losses: number | null;
  goals_for: number | null;
  goals_against: number | null;
  goal_difference: number | null;
  points: number | null;
  yellow_cards: number | null;
  red_cards: number | null;
  position: number | null;
};
```

## Real-time Updates

The component automatically updates when:

1. **Match results change** - When a match is finished or scores are updated
2. **Team statistics update** - When team_statistics table is modified
3. **Match events added** - When goals or cards are recorded (triggers statistics recalculation)

The real-time subscription:

- Uses Supabase Realtime channels
- Listens to PostgreSQL changes
- Automatically refetches standings view when changes detected
- Cleans up subscriptions on unmount

## Usage

### Basic Usage

```typescript
import StandingsTable from "@/components/features/standings/standings-table";

function MyPage() {
  return (
    <div>
      <h1>Tournament Standings</h1>
      <StandingsTable />
    </div>
  );
}
```

### With Custom Styling

```typescript
<div className="my-custom-container">
  <StandingsTable />
</div>
```

## Responsive Breakpoints

- **Mobile (< 768px)**: Card view
- **Desktop (≥ 768px)**: Table view

Breakpoint uses Tailwind's `md:` prefix.

## Styling

Uses Tailwind CSS classes and shadcn/ui components:

- `Table` components for desktop view
- Custom card styling for mobile
- Responsive utilities (`hidden md:block`, `md:hidden`)
- Color utilities for cards (yellow/red)

## Performance Considerations

- Real-time subscriptions are cleaned up on unmount
- Uses `useCallback` to prevent unnecessary re-renders
- Efficiently updates only when data changes
- Loading states prevent layout shift

## Testing

To test the component:

1. **Start the client app:**

   ```bash
   npm run dev:client
   ```

2. **View standings:**
   - Navigate to home page
   - Standings table should display

3. **Test real-time updates:**
   - Open Supabase Studio
   - Update a match score or team statistics
   - Standings should update automatically

4. **Test responsive design:**
   - Resize browser window
   - Table switches to cards below 768px width

## Future Enhancements

Potential improvements:

- Add sorting by column headers
- Add filtering options
- Add team detail modal/page
- Add animation for position changes
- Add export functionality
- Add print styles
