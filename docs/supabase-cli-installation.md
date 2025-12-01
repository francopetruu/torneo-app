# Supabase CLI Installation Guide

## Windows Installation

### Option 1: Using Scoop (Recommended)

1. **Install Scoop** (if not already installed):

   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   irm get.scoop.sh | iex
   ```

2. **Install Supabase CLI**:
   ```powershell
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```

### Option 2: Using npm/npx (Alternative)

You can use Supabase CLI via npx without installing globally:

```powershell
npx supabase@latest start
npx supabase@latest db reset
```

### Option 3: Manual Installation

1. **Download the latest release** from [Supabase CLI Releases](https://github.com/supabase/cli/releases)
2. **Extract the executable** and add it to your PATH
3. **Or use Chocolatey** (if you have it):
   ```powershell
   choco install supabase
   ```

## Verify Installation

After installation, verify it works:

```powershell
supabase --version
```

You should see the version number (e.g., `v1.x.x`).

## Prerequisites for Supabase CLI

Before running `supabase start`, ensure you have:

1. **Docker Desktop** installed and running
   - Download from: https://www.docker.com/products/docker-desktop/
   - Make sure Docker is running before executing `supabase start`

2. **Git** installed (usually comes with development tools)

## First Time Setup

1. **Start Docker Desktop** (make sure it's running)

2. **Initialize Supabase** (if not already done):

   ```powershell
   supabase init
   ```

   Note: This is already done in this project, so you can skip this step.

3. **Start Supabase**:

   ```powershell
   supabase start
   ```

   This will download Docker images and start all services (first time may take a few minutes).

4. **Run migrations**:
   ```powershell
   supabase db reset
   ```
   This will apply all migrations and seed data.

## Troubleshooting

### Docker Not Running

If you get Docker-related errors:

- Make sure Docker Desktop is installed and running
- Check Docker status: `docker ps`

### Port Already in Use

If ports are already in use:

- Check `supabase/config.toml` for port configuration
- Stop any services using ports 54321-54329
- Or modify ports in `config.toml`

### Permission Errors

If you get permission errors:

- Run PowerShell as Administrator
- Or check Docker Desktop permissions

## Using npx (No Installation Required)

If you prefer not to install Supabase CLI globally, you can use npx:

```powershell
# Start Supabase
npx supabase@latest start

# Reset database
npx supabase@latest db reset

# Generate types
npx supabase@latest gen types typescript --local > apps/client/src/types/database.types.ts
```

## Next Steps

After successful installation and startup:

1. Access Supabase Studio at: http://localhost:54323
2. View API docs at: http://localhost:54321/rest/v1/
3. Check database connection string in the output of `supabase start`
