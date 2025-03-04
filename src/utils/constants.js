// Default excluded directories
const DEFAULT_EXCLUDED_DIRS = [
  "node_modules",
  "dist",
  ".git",
  ".idea",
  ".vscode",
  "build",
  "coverage",
  "__pycache__",
  "venv",
  "env",
  ".next",
];

// Page size for directory listing
const PAGE_SIZE = 15;

module.exports = {
  DEFAULT_EXCLUDED_DIRS,
  PAGE_SIZE,
};
