# Quick Setup Guide

## Step-by-Step Setup Instructions

### 1. Install Prerequisites

#### Node.js and npm

- Download and install Node.js >= 18.0.0 from [nodejs.org](https://nodejs.org/)
- Verify installation:
  ```powershell
  node --version
  npm --version
  ```

#### Docker Desktop (REQUIRED)

- **Download and install Docker Desktop** from [docker.com](https://www.docker.com/products/docker-desktop/)
- **Important:** Docker Desktop MUST be installed and running before using Supabase CLI
- After installation, start Docker Desktop and wait for it to fully start
- Verify Docker is running:
  ```powershell
  docker ps
  ```
- If you see an error, Docker is not installed or not running

### 2. Install Project Dependencies

```powershell
npm install
```

### 3. Set Up Supabase (Choose One Option)

#### Option A: Using npx (No Installation Required) - Recommended

```powershell
# Start Supabase (first time may take a few minutes)
npm run db:start

# Reset database and run migrations
npm run db:reset
```

#### Option B: Install Supabase CLI Globally

**Windows (PowerShell):**

```powershell
# Using Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or using Chocolatey
choco install supabase
```

Then run:

```powershell
npm run supabase:start
npm run supabase:reset
```

### 4. Set Up Environment Variables

Create `.env` files for both apps:

```powershell
# Client app
Copy-Item apps\client\env.example apps\client\.env

# Admin app
Copy-Item apps\admin\env.example apps\admin\.env
```

**For local development**, after running `supabase start`, you'll see connection strings in the output. Update the `.env` files:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<your-anon-key-from-supabase-start-output>
```

### 5. Generate TypeScript Types (Optional)

If you want to regenerate types from the database schema:

```powershell
# Using npx
npm run db:types

# Or if Supabase CLI is installed
npm run supabase:types
```

### 6. Start Development Servers

```powershell
# Start client app
npm run dev:client

# Start admin app (in another terminal)
npm run dev:admin

# Or start both
npm run dev:all
```

## Verify Everything Works

1. **Supabase Studio**: http://localhost:54323
   - You should see all tables, views, and data

2. **Client App**: http://localhost:5173
   - Should load without errors

3. **Admin App**: http://localhost:5174
   - Should load without errors

4. **Check Database**:
   ```sql
   -- In Supabase Studio SQL Editor
   SELECT * FROM standings;
   SELECT * FROM top_scorers;
   SELECT * FROM teams;
   ```

## Troubleshooting

### "supabase command not found"

- Use `npm run db:start` instead (uses npx)
- Or install Supabase CLI (see Option B above)

### Docker errors

- Make sure Docker Desktop is running
- Check Docker status: `docker ps`
- Restart Docker Desktop if needed

### Port already in use

- Check if ports 54321-54329 are in use
- Stop other services using those ports
- Or modify ports in `supabase/config.toml`

### Migration errors

- Make sure Supabase is running: `npm run db:start`
- Check migration files in `supabase/migrations/`
- Try resetting: `npm run db:reset`

## Next Steps

- Read [docs/database-setup-guide.md](docs/database-setup-guide.md) for database details
- Read [docs/supabase-cli-installation.md](docs/supabase-cli-installation.md) for CLI installation help
- Check [README.md](README.md) for full documentation
