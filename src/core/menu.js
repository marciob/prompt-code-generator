const appState = require("./state");
const {
  listDirectory,
  viewSelected,
  printSelectedFiles,
} = require("../commands/browse");
const { generateOutput } = require("../commands/generate");
const { addProblemStatement } = require("../commands/problemStatement");
const { manageExcludedDirectories } = require("../commands/excludedDirs");
const { validatePath } = require("../utils/fileUtils");

function displayMainMenu() {
  console.clear();
  console.log("Prompt Code Generator");
  console.log("=====================");
  console.log(`Project: ${appState.rootPath}`);
  console.log(`Selected Files: ${appState.getSelectedPathsCount()}`);
  console.log(
    `Problem Statement: ${appState.problemStatement ? "Set" : "Not set"}`
  );
  console.log(`\nExcluded directories: ${appState.excludedDirs.join(", ")}`);
  console.log("\nOptions:");
  console.log("1. Browse and select files");
  console.log("2. View selected files");
  console.log("3. Clear all selections");
  console.log("4. Set/edit problem statement");
  console.log("5. Manage excluded directories");
  console.log("6. Change project path");
  console.log("7. Print selected files");
  console.log("8. Generate output");
  console.log("9. Exit");
}

function changeProjectPath(rl) {
  console.clear();
  console.log("Change Project Path");
  console.log("==================");
  console.log(`Current path: ${appState.rootPath}`);

  return new Promise((resolve) => {
    rl.question("\nEnter new project path: ", (newPath) => {
      newPath = newPath.trim();
      const validatedPath = validatePath(newPath);

      if (validatedPath) {
        appState.clearSelectedPaths();
        appState.setRootPath(validatedPath);
        console.log(`Project path changed to: ${validatedPath}`);
      } else {
        console.log("Error: Path does not exist or is not a directory.");
      }

      setTimeout(() => resolve(["main"]), 1500);
    });
  });
}

function handleMainMenu(rl) {
  displayMainMenu();

  return new Promise((resolve) => {
    rl.question("\nChoose an option (1-9): ", (answer) => {
      switch (answer) {
        case "1":
          resolve(["browse", "", 0]);
          break;
        case "2":
          viewSelected(rl, () => resolve(["main"]));
          break;
        case "3":
          appState.clearSelectedPaths();
          console.log("All selections cleared.");
          setTimeout(() => resolve(["main"]), 1000);
          break;
        case "4":
          resolve(["problemStatement"]);
          break;
        case "5":
          resolve(["excludedDirs"]);
          break;
        case "6":
          resolve(["changePath"]);
          break;
        case "7":
          printSelectedFiles(rl, () => resolve(["main"]));
          break;
        case "8":
          resolve(["generate"]);
          break;
        case "9":
          console.log("Goodbye!");
          rl.close();
          process.exit(0);
          break;
        default:
          console.log("Invalid option");
          setTimeout(() => resolve(["main"]), 1000);
      }
    });
  });
}

async function handleNavigation(command, rl) {
  switch (command[0]) {
    case "main":
      return handleMainMenu(rl);
    case "browse":
      return listDirectory(rl, command[1], command[2]);
    case "problemStatement":
      return addProblemStatement(rl);
    case "excludedDirs":
      return manageExcludedDirectories(rl);
    case "changePath":
      return changeProjectPath(rl);
    case "generate":
      return generateOutput(rl);
    default:
      console.log("Invalid navigation command");
      return ["main"];
  }
}

module.exports = {
  handleNavigation,
  handleMainMenu,
};
