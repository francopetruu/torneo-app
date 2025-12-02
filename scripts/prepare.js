#!/usr/bin/env node

/**
 * Prepare script that only runs Husky in local development
 * Skips Husky setup in CI/CD environments (Vercel, GitHub Actions, etc.)
 */

const isCI = process.env.CI || process.env.VERCEL || process.env.GITHUB_ACTIONS;

if (isCI) {
  console.log("Skipping Husky installation in CI/CD environment");
  process.exit(0);
}

try {
  const fs = require("fs");
  const path = require("path");
  const huskyPath = path.join(__dirname, "..", "node_modules", "husky");

  if (fs.existsSync(huskyPath)) {
    const { execSync } = require("child_process");
    execSync("npx husky install", { stdio: "inherit" });
  } else {
    console.log("Husky not found, skipping installation");
  }
} catch (error) {
  // Fail silently - Husky is optional for CI/CD
  console.log("Husky installation skipped:", error.message);
  process.exit(0);
}
