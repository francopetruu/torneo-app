#!/bin/bash

# Test CI/CD Setup Script
# This script verifies that all CI/CD components are properly configured

echo "🔍 Testing CI/CD Setup..."
echo ""

# Check if Git is initialized
if [ -d .git ]; then
    echo "✅ Git repository initialized"
else
    echo "❌ Git repository not initialized"
    exit 1
fi

# Check GitHub workflows
if [ -d .github/workflows ]; then
    WORKFLOW_COUNT=$(ls -1 .github/workflows/*.yml 2>/dev/null | wc -l)
    if [ "$WORKFLOW_COUNT" -ge 6 ]; then
        echo "✅ GitHub workflows configured ($WORKFLOW_COUNT workflows)"
    else
        echo "⚠️  Expected 6 workflows, found $WORKFLOW_COUNT"
    fi
else
    echo "❌ .github/workflows directory not found"
    exit 1
fi

# Check Husky hooks
if [ -d .husky ]; then
    if [ -f .husky/pre-commit ] && [ -f .husky/commit-msg ]; then
        echo "✅ Husky hooks configured"
    else
        echo "❌ Husky hooks missing"
        exit 1
    fi
else
    echo "❌ .husky directory not found"
    exit 1
fi

# Check commitlint config
if [ -f commitlint.config.js ]; then
    echo "✅ Commitlint configured"
else
    echo "❌ commitlint.config.js not found"
    exit 1
fi

# Check lint-staged config
if [ -f .lintstagedrc.js ]; then
    echo "✅ Lint-staged configured"
else
    echo "❌ .lintstagedrc.js not found"
    exit 1
fi

# Check PR templates
if [ -f .github/PULL_REQUEST_TEMPLATE.md ]; then
    echo "✅ PR templates configured"
else
    echo "⚠️  PR templates not found"
fi

# Check package.json scripts
if grep -q '"prepare": "husky"' package.json; then
    echo "✅ Husky prepare script configured"
else
    echo "⚠️  Husky prepare script not found in package.json"
fi

# Check if dependencies are installed
if [ -d node_modules/husky ] && [ -d node_modules/@commitlint ]; then
    echo "✅ Required dependencies installed"
else
    echo "⚠️  Run 'npm install' to install dependencies"
fi

echo ""
echo "🎉 CI/CD setup verification complete!"
echo ""
echo "Next steps:"
echo "1. Create GitHub repository and connect remote"
echo "2. Configure GitHub secrets (see docs/cicd-setup-guide.md)"
echo "3. Set up Vercel projects"
echo "4. Test with a feature branch"

