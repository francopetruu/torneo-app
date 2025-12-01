# CI/CD Quick Reference

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>: <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding/updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes
- `revert`: Revert a previous commit

### Examples

```bash
git commit -m "feat: add match management page"
git commit -m "fix: resolve score update issue"
git commit -m "docs: update setup guide"
git commit -m "chore: update dependencies"
```

## Pre-commit Hooks

Automatically runs before each commit:

- ESLint (auto-fix)
- Prettier (formatting)
- Type checking

To skip hooks (use with caution):

```bash
git commit --no-verify -m "message"
```

## Workflow Triggers

### Test Workflow

- **Triggers**: Push to `main`/`develop`, PRs to `main`/`develop`
- **Runs**: Tests, linting, type checking, builds

### Client Deploy

- **Triggers**: Push to `main` (client changes), manual
- **Runs**: Build → Lighthouse CI → Deploy to Vercel

### Admin Deploy

- **Triggers**: Push to `main` (admin changes), manual
- **Runs**: Build → Deploy to Vercel

### Supabase Migrations

- **Triggers**: Push to `main` (migration changes), manual
- **Runs**: Apply migrations → Generate types → Commit types

### Dependency Updates

- **Triggers**: Weekly (Monday 9 AM UTC), manual
- **Runs**: Update packages → Create PR

### Release

- **Triggers**: Tag push (`v*.*.*`), manual
- **Runs**: Generate changelog → Create GitHub release → Notify team

## Manual Workflow Execution

Go to **Actions** tab → Select workflow → **Run workflow**

## Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch (optional)
- `feature/*`: Feature branches
- `fix/*`: Bug fix branches
- `chore/*`: Maintenance branches

## PR Checklist

Before creating a PR:

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] Linting passes
- [ ] Type checking passes
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow convention

## Troubleshooting

### Pre-commit hook fails

```bash
# Fix linting issues
npm run lint -- --fix

# Format code
npm run format

# Re-run commit
git commit -m "feat: your message"
```

### Commit message rejected

```bash
# Use conventional commit format
git commit -m "feat: add new feature"
```

### Workflow fails

1. Check Actions tab for error details
2. Verify secrets are set correctly
3. Check workflow YAML syntax
4. Review logs for specific errors

### Deployment fails

1. Verify Vercel project IDs in secrets
2. Check environment variables
3. Review build logs in Vercel dashboard
4. Verify Supabase credentials

## Useful Commands

```bash
# Run all checks locally
npm run lint
npm run format:check
npm run type-check
npm run build

# Test pre-commit hook
git add .
git commit -m "test: verify hooks"

# Skip hooks (emergency only)
git commit --no-verify -m "message"

# Create release tag
git tag v1.0.0
git push origin v1.0.0
```
