# Test CI/CD Setup Script (PowerShell)
# This script verifies that all CI/CD components are properly configured

Write-Host "🔍 Testing CI/CD Setup..." -ForegroundColor Cyan
Write-Host ""

$errors = @()

# Check if Git is initialized
if (Test-Path .git) {
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "❌ Git repository not initialized" -ForegroundColor Red
    $errors += "Git not initialized"
}

# Check GitHub workflows
if (Test-Path .github/workflows) {
    $workflows = Get-ChildItem .github/workflows/*.yml -ErrorAction SilentlyContinue
    if ($workflows.Count -ge 6) {
        Write-Host "✅ GitHub workflows configured ($($workflows.Count) workflows)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Expected 6 workflows, found $($workflows.Count)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ .github/workflows directory not found" -ForegroundColor Red
    $errors += "Workflows directory missing"
}

# Check Husky hooks
if (Test-Path .husky) {
    if ((Test-Path .husky/pre-commit) -and (Test-Path .husky/commit-msg)) {
        Write-Host "✅ Husky hooks configured" -ForegroundColor Green
    } else {
        Write-Host "❌ Husky hooks missing" -ForegroundColor Red
        $errors += "Husky hooks missing"
    }
} else {
    Write-Host "❌ .husky directory not found" -ForegroundColor Red
    $errors += "Husky directory missing"
}

# Check commitlint config
if (Test-Path commitlint.config.js) {
    Write-Host "✅ Commitlint configured" -ForegroundColor Green
} else {
    Write-Host "❌ commitlint.config.js not found" -ForegroundColor Red
    $errors += "Commitlint config missing"
}

# Check lint-staged config
if (Test-Path .lintstagedrc.js) {
    Write-Host "✅ Lint-staged configured" -ForegroundColor Green
} else {
    Write-Host "❌ .lintstagedrc.js not found" -ForegroundColor Red
    $errors += "Lint-staged config missing"
}

# Check PR templates
if (Test-Path .github/PULL_REQUEST_TEMPLATE.md) {
    Write-Host "✅ PR templates configured" -ForegroundColor Green
} else {
    Write-Host "⚠️  PR templates not found" -ForegroundColor Yellow
}

# Check package.json scripts
$packageJson = Get-Content package.json -Raw
if ($packageJson -match '"prepare":\s*"husky"') {
    Write-Host "✅ Husky prepare script configured" -ForegroundColor Green
} else {
    Write-Host "⚠️  Husky prepare script not found in package.json" -ForegroundColor Yellow
}

# Check if dependencies are installed
if ((Test-Path node_modules/husky) -and (Test-Path node_modules/@commitlint)) {
    Write-Host "✅ Required dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Run 'npm install' to install dependencies" -ForegroundColor Yellow
}

Write-Host ""
if ($errors.Count -eq 0) {
    Write-Host "🎉 CI/CD setup verification complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Create GitHub repository and connect remote"
    Write-Host "2. Configure GitHub secrets (see docs/cicd-setup-guide.md)"
    Write-Host "3. Set up Vercel projects"
    Write-Host "4. Test with a feature branch"
} else {
    Write-Host "❌ Setup incomplete. Fix the following issues:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    exit 1
}

