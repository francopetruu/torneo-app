module.exports = {
  // Run Prettier for all files
  // ESLint will run in CI/CD pipeline to catch issues
  "*.{ts,tsx,js,jsx,json,css,md,mdx}": ["prettier --write"],
};
