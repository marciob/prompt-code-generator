#!/usr/bin/env node

const readline = require("readline");
const appState = require("./core/state");
const { handleNavigation } = require("./core/menu");
const { validatePath } = require("./utils/fileUtils");

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to initialize the application with a path
function initializeApp(path) {
  const rootPath = validatePath(path);
  if (!rootPath) {
    console.error(`Path does not exist: ${path}`);
    promptForPath();
    return;
  }

  // Set initial state
  appState.setRootPath(rootPath);

  // Start the main application loop
  startApp();
}

// Function to prompt for a path if not provided
function promptForPath() {
  rl.question("Please enter a valid path: ", (inputPath) => {
    if (!inputPath.trim()) {
      console.log("Path cannot be empty.");
      promptForPath();
      return;
    }

    initializeApp(inputPath);
  });
}

// Main application loop
async function startApp() {
  let nextCommand = ["main"];

  while (true) {
    try {
      nextCommand = await handleNavigation(nextCommand, rl);
    } catch (error) {
      console.error("An error occurred:", error);
      nextCommand = ["main"];
    }
  }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("No path provided as an argument.");
  promptForPath();
} else {
  initializeApp(args[0]);
}

// Handle application errors
process.on("uncaughtException", (error) => {
  console.error("Fatal error:", error);
  rl.close();
  process.exit(1);
});
