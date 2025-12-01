# Beach Football Tournament Management System

A Progressive Web Application for managing beach football tournaments, built with React, TypeScript, and Supabase.

## Project Structure

This is a monorepo containing two applications:

- **apps/client** - Public-facing PWA for tournament viewing and interaction
- **apps/admin** - Admin panel for tournament management

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Realtime + Auth + Storage)
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker Desktop (required for local Supabase development)
- Supabase account and project (for remote deployment)
- Supabase CLI (optional - can use npx instead)

### Installing Supabase CLI (Optional)

**Windows (PowerShell):**

```powershell
# Using Scoop (recommended)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or using Chocolatey
choco install supabase

# Or use npx (no installation needed)
# Just use: npx supabase@latest [command]
```

See [docs/supabase-cli-installation.md](docs/supabase-cli-installation.md) for detailed installation instructions.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

You have two options:

#### Option A: Local Development (Requires Docker Desktop)

**Why Docker?** Supabase CLI uses Docker to run PostgreSQL, API, Auth, Storage, and other services locally. See [docs/why-docker-needed.md](docs/why-docker-needed.md) for details.

**If you don't want to use Docker**, see Option B below (Remote Supabase Project).

**Steps:**

1. Install Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
2. Start Docker Desktop
3. Run migrations:

```bash
# Using npx (no CLI installation needed):
npm run db:start
npm run db:reset

# Or if Supabase CLI is installed globally:
npm run supabase:start
npm run supabase:reset
```

This will:

- Start local Supabase instance (PostgreSQL, API, Auth, Storage, etc.)
- Run all migrations to create tables, triggers, views, and RLS policies
- Load seed data for testing

**Access Supabase Studio:** http://localhost:54323

#### Option B: Remote Supabase Project (No Docker Needed!)

**This is the easiest option if you don't want to install Docker!**

1. **Create a free project** at [supabase.com](https://supabase.com)
2. **Get your project credentials:**
   - Go to Project Settings → API
   - Copy your Project URL and `anon` public key
3. **Link your project:**
   ```bash
   npx supabase@latest link --project-ref <your-project-ref>
   ```
   Find your project ref in Project Settings → General
4. **Push migrations to remote:**
   ```bash
   npx supabase@latest db push
   ```
   This will create all tables, triggers, views, and RLS policies on your remote database
5. **Set up environment variables** (see Step 3 below)
6. **Load seed data** (optional):
   - Use Supabase Studio SQL Editor to run `supabase/migrations/20240101000005_seed_data.sql`

**Advantages:**

- ✅ No Docker needed
- ✅ Access from anywhere
- ✅ Production-like environment
- ✅ Free tier available

### 3. Set Up Environment Variables

Copy the example environment files and fill in your Supabase credentials:

```bash
# For client app
cp apps/client/env.example apps/client/.env

# For admin app
cp apps/admin/env.example apps/admin/.env
```

Update the `.env` files with your Supabase project URL and anon key:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Servers

```bash
# Run client app (default)
npm run dev

# Run client app specifically
npm run dev:client

# Run admin app
npm run dev:admin

# Run both apps simultaneously
npm run dev:all
```

The client app will be available at `http://localhost:5173` and the admin app at `http://localhost:5174` (or next available port).

## Database Schema

The database includes the following tables:

- **teams** - Tournament teams
- **players** - Players belonging to teams
- **matches** - Match fixtures and results
- **match_events** - Goals, yellow cards, red cards
- **team_statistics** - Auto-calculated team statistics
- **suspended_players** - Player suspensions
- **banners** - Announcements and banners

### Views

- **standings** - Team rankings ordered by points, goal difference, goals for
- **top_scorers** - Player goal statistics

### Features

- **Auto-calculated statistics**: Team statistics are automatically updated when matches are finished or match events are added
- **Row Level Security**: Public read access, authenticated write access
- **Triggers**: Automatic `updated_at` timestamp updates
- **Indexes**: Optimized for common queries

## Available Scripts

### Root Level

- `npm run dev` - Start client app development server
- `npm run dev:client` - Start client app development server
- `npm run dev:admin` - Start admin app development server
- `npm run dev:all` - Start both apps simultaneously
- `npm run build` - Build all apps
- `npm run build:client` - Build client app
- `npm run build:admin` - Build admin app
- `npm run lint` - Lint all apps
- `npm run format` - Format code with Prettier
- `npm run type-check` - Type check all apps

### App Level

Each app has its own scripts:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Supabase CLI Commands

**If Supabase CLI is installed:**

- `npm run supabase:start` - Start local Supabase instance
- `npm run supabase:stop` - Stop local Supabase instance
- `npm run supabase:reset` - Reset database and run all migrations
- `npm run supabase:types` - Generate TypeScript types from schema

**Or using npx (no installation needed):**

- `npm run db:start` - Start local Supabase instance
- `npm run db:reset` - Reset database and run all migrations
- `npm run db:types` - Generate TypeScript types from schema

**Manual commands:**

- `supabase start` - Start local Supabase instance
- `supabase stop` - Stop local Supabase instance
- `supabase db reset` - Reset database and run all migrations
- `supabase db push` - Push migrations to remote database
- `supabase gen types typescript --local` - Generate TypeScript types

## Project Structure

```
torneo-app/
├── apps/
│   ├── client/          # Public PWA
│   │   ├── src/
│   │   │   ├── components/  # React components
│   │   │   ├── hooks/        # Custom React hooks
│   │   │   ├── lib/          # Utilities and Supabase client
│   │   │   ├── pages/        # Page components
│   │   │   └── types/        # TypeScript types (including database.types.ts)
│   │   └── ...
│   └── admin/           # Admin panel
│       └── src/
│           └── ...      # Same structure as client
├── supabase/
│   ├── migrations/      # Database migrations
│   └── config.toml      # Supabase configuration
├── package.json         # Root workspace configuration
└── README.md
```

## Database Migrations

Migrations are located in `supabase/migrations/`:

1. `20240101000000_initial_schema.sql` - Creates all tables and indexes
2. `20240101000001_updated_at_trigger.sql` - Creates updated_at triggers
3. `20240101000002_team_statistics_functions.sql` - Auto-calculation functions
4. `20240101000003_views.sql` - Standings and top_scorers views
5. `20240101000004_rls_policies.sql` - Row Level Security policies
6. `20240101000005_seed_data.sql` - Seed data for testing

## Code Standards

- TypeScript strict mode enabled
- Functional React components with hooks
- Tailwind CSS for styling (no CSS modules)
- ESLint + Prettier for code quality
- Conventional commits format

## Development Guidelines

### File Organization

- Components: `/components` with subfolders by feature
- Custom hooks: `/hooks`
- Types: `/types`
- Utils: `/lib`
- Pages: `/pages`

### Naming Conventions

- Components: PascalCase (e.g., `StandingsTable`)
- Files: kebab-case (e.g., `standings-table.tsx`)
- Functions: camelCase (e.g., `fetchStandings`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)

## Adding shadcn/ui Components

To add shadcn/ui components to either app:

```bash
cd apps/client  # or apps/admin
npx shadcn-ui@latest add [component-name]
```

## Database

The project uses Supabase for backend services:

- PostgreSQL database
- Row Level Security (RLS) policies
- Realtime subscriptions
- Authentication
- Storage for media files

Always use the Supabase client from `@/lib/supabase` and implement proper RLS policies.

## Testing

- Unit tests: Vitest for utilities
- Integration tests: API calls
- Target: >80% code coverage for critical paths

## CI/CD Pipeline

The project includes a complete CI/CD pipeline using GitHub Actions:

### Features

- ✅ **Automated Testing**: Runs tests, linting, and type checking on every PR
- ✅ **Automated Deployment**: Deploys to Vercel production on merge to main
- ✅ **Database Migrations**: Automatically runs Supabase migrations
- ✅ **Pre-commit Hooks**: Husky runs lint-staged and commitlint before commits
- ✅ **Dependency Updates**: Weekly automated dependency update PRs
- ✅ **Release Management**: Automated GitHub releases with changelog

### Setup

See [docs/cicd-setup-guide.md](docs/cicd-setup-guide.md) for complete setup instructions.

### Quick Reference

- [CI/CD Setup Guide](docs/cicd-setup-guide.md) - Complete setup walkthrough
- [CI/CD Quick Reference](docs/cicd-quick-reference.md) - Quick commands and workflows
- [CI/CD Implementation Summary](docs/cicd-implementation-summary.md) - What's been implemented

### Workflows

- **test.yml** - Tests, linting, and builds
- **client-deploy.yml** - Client app deployment
- **admin-deploy.yml** - Admin app deployment
- **supabase-migrations.yml** - Database migrations
- **dependency-update.yml** - Weekly dependency updates
- **release.yml** - GitHub release creation

### Commit Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update documentation"
```

## Deployment

The project is configured for deployment on Vercel. Each app can be deployed independently or together.

The CI/CD pipeline automatically deploys:

- **Client app** → Production on merge to main
- **Admin app** → Production on merge to main
- **Database migrations** → Applied automatically

## License

Private project - All rights reserved
