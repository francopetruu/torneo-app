Step 4: CI/CD Pipeline Setup
GitHub Actions Workflows

1. Continuous Integration - Testing and Linting
   Create .github/workflows/test.yml:
   yamlname: Test and Lint

on:
push:
branches: [main, develop]
pull_request:
branches: [main, develop]

jobs:
test:
name: Run Tests
runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

lint:
name: Lint Code
runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run Prettier check
        run: npm run format:check

      - name: TypeScript type check
        run: npm run type-check

build:
name: Build Applications
runs-on: ubuntu-latest

    strategy:
      matrix:
        app: [client, admin]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build ${{ matrix.app }}
        run: npm run build --workspace=apps/${{ matrix.app }}
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.app }}-build
          path: apps/${{ matrix.app }}/dist
          retention-days: 7

2. Client App Deployment
   Create .github/workflows/client-deploy.yml:
   yamlname: Deploy Client App

on:
push:
branches: [main]
paths: - 'apps/client/**' - 'packages/**' - '.github/workflows/client-deploy.yml'
workflow_dispatch:

jobs:
deploy-production:
name: Deploy to Production
runs-on: ubuntu-latest
environment: production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build client app
        run: npm run build --workspace=apps/client
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_APP_ENV: production

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            https://tournament.yourdomain.com
          uploadArtifacts: true
          temporaryPublicStorage: true

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_CLIENT }}
          vercel-args: '--prod'
          working-directory: apps/client

      - name: Create deployment notification
        uses: rjstone/discord-webhook-notify@v1
        if: always()
        with:
          severity: ${{ job.status }}
          description: 'Client app deployed to production'
          webhookUrl: ${{ secrets.DISCORD_WEBHOOK }}

3. Admin App Deployment
   Create .github/workflows/admin-deploy.yml:
   yamlname: Deploy Admin App

on:
push:
branches: [main]
paths: - 'apps/admin/**' - 'packages/**' - '.github/workflows/admin-deploy.yml'
workflow_dispatch:

jobs:
deploy-production:
name: Deploy to Production
runs-on: ubuntu-latest
environment: production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build admin app
        run: npm run build --workspace=apps/admin
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_APP_ENV: production

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_ADMIN }}
          vercel-args: '--prod'
          working-directory: apps/admin

      - name: Create deployment notification
        uses: rjstone/discord-webhook-notify@v1
        if: always()
        with:
          severity: ${{ job.status }}
          description: 'Admin app deployed to production'
          webhookUrl: ${{ secrets.DISCORD_WEBHOOK }}

## Complete CI/CD Flow Diagram

```
Developer Machine
│
├─ Feature Development
│  ├─ git checkout -b feature/new-feature
│  ├─ Code changes
│  ├─ npm test (local)
│  ├─ git commit (husky pre-commit hook runs)
│  │  ├─ lint-staged
│  │  ├─ prettier
│  │  └─ ESLint
│  ├─ git commit (commitlint validates message)
│  └─ git push origin feature/new-feature
│
└─ Pull Request Created
   │
   GitHub Actions Triggered
   │
   ├─ Test Workflow
   │  ├─ Run unit tests
   │  ├─ Run integration tests
   │  ├─ Upload coverage
   │  └─ Build check
   │
   ├─ Lint Workflow
   │  ├─ ESLint
   │  ├─ Prettier check
   │  └─ TypeScript type check
   │
   └─ PR Checks Pass ✓
      │
      Code Review
      │
      Merge to develop
      │
      ├─ Preview Deployment (Vercel)
      │  ├─ Client preview
      │  └─ Admin preview
      │
      └─ Integration Testing
         │
         Ready for Production
         │
         Create Release PR (develop → main)
         │
         Merge to main
         │
         GitHub Actions Triggered
         │
         ├─ Build Workflow
         │  ├─ Build client app
         │  ├─ Build admin app
         │  └─ Run Lighthouse CI
         │
         ├─ Deploy Client (Vercel)
         │  └─ Production URL live
         │
         ├─ Deploy Admin (Vercel)
         │  └─ Production URL live
         │
         ├─ Database Migration
         │  └─ Supabase migrations applied
         │
         └─ Create GitHub Release
            ├─ Generate changelog
            ├─ Create release notes
            └─ Notify team (Discord/Slack)
```
