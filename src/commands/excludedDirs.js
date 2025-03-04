const appState = require("../core/state");

function manageExcludedDirectories(rl) {
  console.clear();
  console.log("Manage Excluded Directories");
  console.log("===========================");
  console.log("Current excluded directories:");

  appState.excludedDirs.forEach((dir, idx) => {
    console.log(`${idx + 1}. ${dir}`);
  });

  console.log("\nOptions:");
  console.log("1. Add a directory to exclude");
  console.log("2. Remove a directory from exclusions");
  console.log("3. Restore default exclusions");
  console.log("4. Return to main menu");

  return new Promise((resolve) => {
    rl.question("\nChoose an option (1-4): ", (answer) => {
      switch (answer) {
        case "1":
          rl.question("Enter directory name to exclude: ", (dirName) => {
            dirName = dirName.trim();
            if (dirName && !appState.excludedDirs.includes(dirName)) {
              appState.addExcludedDir(dirName);
              console.log(`Added "${dirName}" to excluded directories.`);
            } else if (appState.excludedDirs.includes(dirName)) {
              console.log(`"${dirName}" is already excluded.`);
            }
            setTimeout(() => resolve(["excludedDirs"]), 1000);
          });
          break;
        case "2":
          if (appState.excludedDirs.length === 0) {
            console.log("No directories are currently excluded.");
            setTimeout(() => resolve(["excludedDirs"]), 1000);
            break;
          }
          rl.question(
            "Enter number of directory to remove from exclusions: ",
            (idx) => {
              const index = parseInt(idx) - 1;
              if (appState.removeExcludedDir(index)) {
                console.log(`Removed directory from exclusions.`);
              } else {
                console.log("Invalid number.");
              }
              setTimeout(() => resolve(["excludedDirs"]), 1000);
            }
          );
          break;
        case "3":
          appState.resetExcludedDirs();
          console.log("Restored default exclusions.");
          setTimeout(() => resolve(["excludedDirs"]), 1000);
          break;
        case "4":
          resolve(["main"]);
          break;
        default:
          console.log("Invalid option");
          setTimeout(() => resolve(["excludedDirs"]), 1000);
      }
    });
  });
}

module.exports = {
  manageExcludedDirectories,
};
