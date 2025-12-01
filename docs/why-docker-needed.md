# Why Docker Desktop is Needed

## Understanding Supabase Local Development

Supabase CLI uses **Docker** to run a complete local Supabase stack on your machine. This includes:

1. **PostgreSQL Database** - The main database server
2. **PostgREST API** - RESTful API layer over PostgreSQL
3. **GoTrue** - Authentication service
4. **Storage** - File storage service
5. **Realtime** - Real-time subscriptions
6. **PostgreSQL Meta** - Database management
7. **Studio** - Web UI for database management
8. **Inbucket** - Email testing server

All these services run as **Docker containers** on your local machine, giving you a complete Supabase environment without:

- Installing PostgreSQL separately
- Configuring multiple services
- Managing ports and connections manually
- Setting up authentication servers

## Why Docker?

Docker provides:

- **Isolation** - Each service runs in its own container
- **Portability** - Same setup works on Windows, Mac, Linux
- **Easy Management** - Start/stop everything with one command
- **No Conflicts** - Services don't interfere with other software
- **Reproducibility** - Same environment every time

## Alternatives: You Don't Need Docker If...

### Option 1: Use Remote Supabase Project (Recommended Alternative)

Instead of local development, you can use a **remote Supabase project**:

1. **Create a project** at [supabase.com](https://supabase.com) (free tier available)
2. **Get your project URL and API key** from project settings
3. **Push migrations** to remote database:

   ```powershell
   # Link to remote project
   npx supabase@latest link --project-ref <your-project-ref>

   # Push migrations
   npx supabase@latest db push
   ```

4. **Use remote connection** in your `.env` files:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

**Advantages:**

- ✅ No Docker needed
- ✅ Access from anywhere
- ✅ Real production-like environment
- ✅ Free tier available

**Disadvantages:**

- ❌ Requires internet connection
- ❌ Slower than local (network latency)
- ❌ Uses your Supabase project quota

### Option 2: Manual PostgreSQL Setup (Advanced)

You could set up PostgreSQL manually, but you'd need to:

- Install PostgreSQL
- Configure PostgREST API
- Set up GoTrue for auth
- Configure Storage service
- Set up Realtime
- Manage all connections and ports
- This is **much more complex** than using Docker

## Recommendation

### For Local Development:

**Use Docker Desktop** - It's the easiest way to run Supabase locally

### If You Can't Use Docker:

**Use Remote Supabase Project** - Create a free project and push migrations there

## Docker Desktop Requirements

- **Windows:** Docker Desktop for Windows (requires WSL2)
- **Mac:** Docker Desktop for Mac
- **Linux:** Docker Engine

**System Requirements:**

- 4GB RAM minimum (8GB recommended)
- Virtualization enabled in BIOS (for Windows)
- WSL2 installed (for Windows)

## Summary

| Approach              | Docker Needed? | Complexity | Best For                        |
| --------------------- | -------------- | ---------- | ------------------------------- |
| **Local with Docker** | ✅ Yes         | Low        | Local development, offline work |
| **Remote Supabase**   | ❌ No          | Very Low   | Quick setup, production-like    |
| **Manual Setup**      | ❌ No          | Very High  | Advanced users only             |

**Bottom Line:** Docker Desktop is needed for **local Supabase development** because Supabase CLI uses Docker containers to run all services. If you can't or don't want to use Docker, use a **remote Supabase project** instead - it's actually simpler and doesn't require Docker!
