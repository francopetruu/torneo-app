# Quick Start Guide

## ⚠️ Prerequisites Check

Before starting, ensure you have:

1. ✅ **Node.js** (v18+) installed - [Download here](https://nodejs.org/)
2. ✅ **Choose one:**
   - **Option A:** Docker Desktop installed and running - [Download here](https://www.docker.com/products/docker-desktop/)
   - **Option B:** Supabase account (free) - [Sign up here](https://supabase.com) - **No Docker needed!**
3. ✅ **Git** installed (usually comes with development tools)

> **Why Docker?** See [docs/why-docker-needed.md](docs/why-docker-needed.md) - Docker is only needed for local development. You can use a remote Supabase project instead!

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies

```powershell
npm install
```

### Step 2: Choose Your Setup Method

#### Option A: Local Development (Requires Docker)

```powershell
# Make sure Docker Desktop is running first!
npm run db:start

# Set up database
npm run db:reset
```

**First time:** This will download Docker images (~5-10 minutes). Subsequent starts are much faster.

#### Option B: Remote Supabase Project (No Docker Needed!)

```powershell
# Link to your Supabase project
npx supabase@latest link --project-ref <your-project-ref>

# Push migrations to remote database
npx supabase@latest db push
```

Get your project ref from Supabase Dashboard → Project Settings → General.

**Advantages:**

- ✅ No Docker installation needed
- ✅ Works immediately
- ✅ Production-like environment

### Step 4: Configure Environment Variables

After `npm run db:start`, copy the connection strings from the output and create `.env` files:

```powershell
# Create .env files
Copy-Item apps\client\env.example apps\client\.env
Copy-Item apps\admin\env.example apps\admin\.env
```

Edit `apps/client/.env` and `apps/admin/.env` with values from the `supabase start` output:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<copy-from-supabase-start-output>
```

### Step 5: Start Development

```powershell
# Terminal 1: Start client app
npm run dev:client

# Terminal 2: Start admin app (optional)
npm run dev:admin
```

## ✅ Verify Everything Works

1. **Supabase Studio**: http://localhost:54323
   - Login with the password shown in `supabase start` output
   - You should see all tables and seed data

2. **Client App**: http://localhost:5173
   - Should load without errors

3. **Database Query** (in Supabase Studio SQL Editor):
   ```sql
   SELECT * FROM standings;
   SELECT * FROM top_scorers;
   ```

## 🛠️ Common Commands

```powershell
# Start Supabase
npm run db:start

# Stop Supabase
npx supabase@latest stop

# Reset database (run migrations + seed)
npm run db:reset

# Generate TypeScript types
npm run db:types

# Start client app
npm run dev:client

# Start admin app
npm run dev:admin
```

## ❌ Troubleshooting

### "supabase command not found"

✅ **Solution:** Use `npm run db:start` (uses npx, no installation needed)

### "docker command not found"

✅ **Solution:**

1. Install Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
2. Start Docker Desktop
3. Wait for it to fully start (whale icon in system tray)
4. Try again

### "Port already in use"

✅ **Solution:**

- Check if ports 54321-54329 are in use
- Stop other services or modify `supabase/config.toml`

### "Cannot connect to Docker"

✅ **Solution:**

- Make sure Docker Desktop is running
- Restart Docker Desktop
- Check Docker status: `docker ps` (if Docker is installed)

## 📚 More Information

- Full setup guide: [SETUP.md](SETUP.md)
- Database documentation: [docs/database-setup-guide.md](docs/database-setup-guide.md)
- Supabase CLI installation: [docs/supabase-cli-installation.md](docs/supabase-cli-installation.md)
