# Vercel Environment Variables Configuration

This document lists all required environment variables that need to be configured in Vercel for both the client and admin applications.

## Required Environment Variables

Both applications require the same environment variables since they connect to the same Supabase project.

### For Both Client and Admin Apps

| Variable Name            | Description                        | Where to Find                                                            | Example Value                             |
| ------------------------ | ---------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------- |
| `VITE_SUPABASE_URL`      | Your Supabase project URL          | Supabase Dashboard → Settings → API → Project URL                        | `https://xxxxx.supabase.co`               |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key | Supabase Dashboard → Settings → API → Project API keys → `anon` `public` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

## How to Configure in Vercel

### Step 1: Access Project Settings

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`torneo-app-client` or `torneo-app-admin`)
3. Click **Settings** → **Environment Variables**

### Step 2: Add Environment Variables

For each environment variable:

1. Click **Add New**
2. Enter the **Key** (e.g., `VITE_SUPABASE_URL`)
3. Enter the **Value** (your actual value)
4. Select environments:
   - ✅ **Production**
   - ✅ **Preview** (optional, for PR previews)
   - ✅ **Development** (optional, if using Vercel CLI)
5. Click **Save**

### Step 3: Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Select **Redeploy**
4. Or push a new commit to trigger automatic deployment

## Configuration by Project

### Client App (`torneo-app-client`)

**Project Settings:**

- Root Directory: `apps/client`
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

**Required Environment Variables:**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Admin App (`torneo-app-admin`)

**Project Settings:**

- Root Directory: `apps/admin`
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

**Required Environment Variables:**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Getting Your Supabase Credentials

### Step 1: Access Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project

### Step 2: Get Project URL

1. Navigate to **Settings** → **API**
2. Find **Project URL** under **Project Settings**
3. Copy the URL (e.g., `https://xxxxx.supabase.co`)

### Step 3: Get Anonymous Key

1. In the same **Settings** → **API** page
2. Scroll to **Project API keys** section
3. Find the **`anon`** `public` key
4. Click **Reveal** and copy the key

⚠️ **Important:** Use the `anon` `public` key, NOT the `service_role` key (which has admin privileges and should never be exposed in client-side code).

## Environment Variable Details

### VITE_SUPABASE_URL

- **Type:** String (URL)
- **Required:** Yes
- **Format:** `https://[project-ref].supabase.co`
- **Example:** `https://abcdefghijklmnop.supabase.co`
- **Usage:** Used to initialize the Supabase client connection

### VITE_SUPABASE_ANON_KEY

- **Type:** String (JWT token)
- **Required:** Yes
- **Format:** JWT token string
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ...`
- **Usage:** Used for authenticating API requests (read-only for client app, authenticated for admin app)
- **Security:** This is a public key safe to expose in client-side code. Row Level Security (RLS) policies protect your data.

## Verification

After configuring environment variables:

1. **Check Build Logs:**
   - Go to **Deployments** → Select deployment → **Build Logs**
   - Verify no errors about missing environment variables

2. **Test Application:**
   - Visit your deployed application URL
   - Check browser console for any Supabase connection errors
   - Verify data loads correctly

3. **Check Runtime:**
   - Open browser DevTools → Console
   - Should see no errors about `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY`

## Troubleshooting

### Build Fails with "Missing Supabase environment variables"

**Solution:**

1. Verify environment variables are set in Vercel project settings
2. Ensure variables are enabled for the correct environment (Production/Preview)
3. Redeploy after adding variables

### Application Shows "Missing Supabase environment variables" Error

**Solution:**

1. Check that environment variables are set in Vercel
2. Verify variable names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Ensure variables are enabled for Production environment
4. Redeploy the application

### Data Not Loading

**Solution:**

1. Verify Supabase URL is correct (no trailing slash)
2. Check that anonymous key is correct (not service_role key)
3. Verify Row Level Security (RLS) policies allow public read access
4. Check Supabase project is active and not paused

### Different Values for Different Environments

If you need different Supabase projects for production vs preview:

1. Set different values for **Production** and **Preview** environments
2. Production: Use your production Supabase project
3. Preview: Use a staging/test Supabase project (optional)

## Security Notes

- ✅ **Safe to expose:** `VITE_SUPABASE_ANON_KEY` is designed to be public
- ✅ **Protected by RLS:** Row Level Security policies protect your data
- ❌ **Never expose:** `service_role` key (has admin privileges)
- ❌ **Never commit:** `.env` files to version control
- ✅ **Use Vercel:** Environment variables are encrypted and secure

## Quick Reference

```bash
# Required for both apps:
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Where to find:
# Supabase Dashboard → Settings → API
```

## Related Documentation

- [CI/CD Setup Guide](./cicd-setup-guide.md) - Complete CI/CD setup including Vercel
- [Supabase Setup](./database-setup-guide.md) - Setting up Supabase project
- [Authentication Setup](./authentication-setup.md) - Auth configuration
