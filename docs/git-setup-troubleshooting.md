# Git Setup Troubleshooting

## Issue: "remote origin already exists"

This is normal if you've already added the remote. You can either:

**Option 1: Update existing remote**

```bash
git remote set-url origin https://github.com/francopetruu/torneo-app.git
```

**Option 2: Remove and re-add**

```bash
git remote remove origin
git remote add origin https://github.com/francopetruu/torneo-app.git
```

## Issue: "src refspec main does not match any"

This happens when you try to push before making your first commit. Solution:

### Step 1: Configure Git User (if not already done)

For this repository only:

```bash
git config user.email "your-email@example.com"
git config user.name "Your Name"
```

Or globally (for all repositories):

```bash
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"
```

### Step 2: Stage All Files

```bash
git add .
```

### Step 3: Make Initial Commit

```bash
git commit -m "chore: initial commit with CI/CD pipeline setup"
```

### Step 4: Push to GitHub

```bash
git push -u origin main
```

## Complete Setup Sequence

If starting fresh, here's the complete sequence:

```bash
# 1. Configure Git user (if needed)
git config user.email "your-email@example.com"
git config user.name "Your Name"

# 2. Check remote (should already be set)
git remote -v

# 3. Stage all files
git add .

# 4. Make initial commit
git commit -m "chore: initial commit with CI/CD pipeline setup"

# 5. Push to GitHub
git push -u origin main
```

## Verify Success

After pushing, verify:

```bash
# Check commit history
git log --oneline -1

# Check branch tracking
git branch -vv

# Check status
git status
```

You should see:

- ✅ One commit in history
- ✅ `main` branch tracking `origin/main`
- ✅ "Your branch is up to date with 'origin/main'"

## Next Steps

After successful push:

1. Go to https://github.com/francopetruu/torneo-app
2. Verify all files are visible
3. Check that GitHub Actions workflows are present in `.github/workflows/`
4. Follow [CI/CD Setup Guide](cicd-setup-guide.md) to configure secrets
