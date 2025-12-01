# CI/CD Setup Guide

This guide walks you through setting up the complete CI/CD pipeline for the Beach Football Tournament application.

## Prerequisites

- GitHub account
- Vercel account
- Supabase account
- Node.js 18+ installed locally

## Step 1: Initialize Git Repository

If you haven't already initialized Git:

```bash
git init
git add .
git commit -m "chore: initial commit"
```

## Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `torneo-app`
3. **Do NOT** initialize with README, .gitignore, or license (we already have these)
4. Copy the repository URL

## Step 3: Connect Local Repository to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/torneo-app.git
git branch -M main
git push -u origin main
```

## Step 4: Set Up Branch Protection Rules

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Branches**
3. Click **Add rule** for `main` branch
4. Configure the following:
   - **Branch name pattern**: `main`
   - ✅ Require a pull request before merging
     - Require approvals: 1
     - Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require status checks to pass before merging
     - Require branches to be up to date before merging
     - Required status checks:
       - `test / test (18.x)`
       - `test / test (20.x)`
       - `test / lint`
       - `test / build`
   - ✅ Require conversation resolution before merging
   - ✅ Do not allow bypassing the above settings

5. Repeat for `develop` branch (optional but recommended)

## Step 5: Configure Repository Secrets

Go to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add the following secrets:

### Required Secrets

1. **VITE_SUPABASE_URL**
   - Value: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)

2. **VITE_SUPABASE_ANON_KEY**
   - Value: Your Supabase anonymous key (found in Supabase Dashboard → Settings → API)

3. **VERCEL_TOKEN**
   - Value: Generate at [Vercel Settings → Tokens](https://vercel.com/account/tokens)

4. **VERCEL_ORG_ID**
   - Value: Found in Vercel Dashboard → Settings → General → Team ID

5. **VERCEL_PROJECT_ID_CLIENT**
   - Value: Will be available after creating Vercel project for client app

6. **VERCEL_PROJECT_ID_ADMIN**
   - Value: Will be available after creating Vercel project for admin app

7. **SUPABASE_ACCESS_TOKEN**
   - Value: Generate at [Supabase Dashboard → Account → Access Tokens](https://supabase.com/dashboard/account/tokens)

8. **SUPABASE_PROJECT_REF**
   - Value: Your Supabase project reference ID (found in project URL or settings)

### Optional Secrets

9. **DISCORD_WEBHOOK** (optional)
   - Value: Discord webhook URL for deployment notifications
   - Create at: Discord Server → Server Settings → Integrations → Webhooks

## Step 6: Configure Vercel Projects

### Create Client App Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Project Name**: `torneo-app-client`
   - **Root Directory**: `apps/client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm ci`
5. Add Environment Variables:
   - `VITE_SUPABASE_URL` = Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key
6. Click **Deploy**
7. After deployment, go to **Settings** → **General**
8. Copy the **Project ID** → Add as `VERCEL_PROJECT_ID_CLIENT` secret

### Create Admin App Project

1. Repeat steps above with:
   - **Project Name**: `torneo-app-admin`
   - **Root Directory**: `apps/admin`
2. Copy the **Project ID** → Add as `VERCEL_PROJECT_ID_ADMIN` secret

## Step 7: Set Up GitHub Environments

1. Go to **Settings** → **Environments**
2. Click **New environment**
3. Name: `production`
4. Add protection rules (optional):
   - Required reviewers: Add team members
   - Wait timer: 0 minutes
5. Click **Configure environment**

## Step 8: Verify Husky Hooks

The Husky hooks are already configured. Verify they work:

```bash
# Test pre-commit hook
echo "test" > test.js
git add test.js
git commit -m "test: verify pre-commit hook"
# Should run lint-staged

# Test commit-msg hook
git commit -m "invalid commit message"
# Should fail with commitlint error

git commit -m "feat: add new feature"
# Should pass
```

## Step 9: Test CI/CD Pipeline

### Create a Test Feature Branch

```bash
git checkout -b feature/test-cicd
echo "# Test CI/CD" >> TEST.md
git add TEST.md
git commit -m "feat: test CI/CD pipeline"
git push origin feature/test-cicd
```

### Create Pull Request

1. Go to GitHub repository
2. Click **Compare & pull request**
3. Fill out the PR template
4. Submit PR
5. Verify that GitHub Actions workflows run:
   - ✅ Test and Lint workflow
   - ✅ Build workflow

### Merge PR

1. After PR is approved and checks pass
2. Click **Merge pull request**
3. Verify:
   - ✅ Deployment workflows trigger (if changes affect client/admin)
   - ✅ Migrations workflow runs (if migrations changed)

## Step 10: Test Release Workflow

```bash
# Create a release tag
git tag v1.0.0
git push origin v1.0.0
```

Verify that:

- ✅ Release workflow creates a GitHub release
- ✅ Changelog is generated
- ✅ Team is notified (if Discord webhook configured)

## Troubleshooting

### Workflows Not Running

- Check that workflows are in `.github/workflows/` directory
- Verify YAML syntax is correct
- Check GitHub Actions tab for error messages

### Deployment Failures

- Verify all secrets are set correctly
- Check Vercel project IDs match
- Verify environment variables in Vercel dashboard

### Husky Hooks Not Running

- Run `npm run prepare` to reinstall hooks
- Check `.husky` directory exists
- Verify hooks have execute permissions: `chmod +x .husky/*`

### Commitlint Errors

- Ensure commit message follows conventional format: `type: description`
- Valid types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

## Workflow Overview

### On Pull Request

1. **Test Workflow**: Runs tests, linting, type checking, and builds
2. **Status checks**: Must pass before merging

### On Merge to Main

1. **Client Deploy**: Deploys client app to Vercel production
2. **Admin Deploy**: Deploys admin app to Vercel production
3. **Migrations**: Runs Supabase migrations (if migrations changed)
4. **Notifications**: Sends deployment status to Discord (if configured)

### Scheduled

- **Dependency Updates**: Runs weekly (Monday 9 AM UTC) to update dependencies

### Manual

- **Release**: Create a release tag or use workflow_dispatch to create releases

## Next Steps

- Set up monitoring and error tracking (Sentry, etc.)
- Configure preview deployments for PRs
- Set up staging environment
- Add performance monitoring
- Configure automated security scanning
