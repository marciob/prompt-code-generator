const fs = require("fs");
const path = require("path");
const { PAGE_SIZE } = require("../utils/constants");
const { getAllFilesInDir } = require("../utils/fileUtils");
const appState = require("../core/state");

function listDirectory(rl, currentDir = "", page = 0) {
  console.clear();

  const fullPath = path.join(appState.rootPath, currentDir);
  console.log(`Current directory: ${currentDir || "/"}`);
  console.log(`Selected items: ${appState.getSelectedPathsCount()}`);
  console.log("---------------------------------------------");

  try {
    let entries = [];

    // Add parent directory option if not at root
    if (currentDir) {
      entries.push({
        name: "..",
        path: path.dirname(currentDir) === "." ? "" : path.dirname(currentDir),
        isDir: true,
        isParent: true,
      });
    }

    // Read directory contents
    const dirEntries = fs
      .readdirSync(fullPath)
      .filter((entry) => !entry.startsWith("."))
      .filter((entry) => {
        const baseName = path.basename(entry);
        return !appState.excludedDirs.includes(baseName);
      })
      .map((entry) => {
        const entryPath = path.join(fullPath, entry);
        const relPath = path.join(currentDir, entry);
        const isDir = fs.statSync(entryPath).isDirectory();

        return {
          name: entry,
          path: relPath,
          isDir: isDir,
          isParent: false,
        };
      })
      .sort((a, b) => {
        if (a.isDir && !b.isDir) return -1;
        if (!a.isDir && b.isDir) return 1;
        return a.name.localeCompare(b.name);
      });

    entries = entries.concat(dirEntries);

    // Calculate pagination
    const totalPages = Math.ceil(entries.length / PAGE_SIZE);
    const startIdx = page * PAGE_SIZE;
    const endIdx = Math.min(startIdx + PAGE_SIZE, entries.length);
    const currentPageEntries = entries.slice(startIdx, endIdx);

    // Display entries with selection status
    currentPageEntries.forEach((entry, idx) => {
      const displayNum = startIdx + idx + 1;
      const icon = entry.isDir ? "📁" : "📄";

      let status = " ";
      if (entry.isDir && !entry.isParent) {
        const dirFiles = getAllFilesInDir(
          path.join(appState.rootPath, entry.path),
          entry.path
        );
        const allSelected =
          dirFiles.length > 0 &&
          dirFiles.every((file) => appState.isPathSelected(file));
        const someSelected = dirFiles.some((file) =>
          appState.isPathSelected(file)
        );

        if (allSelected) status = "✓";
        else if (someSelected) status = "◐";
      } else if (!entry.isParent && appState.isPathSelected(entry.path)) {
        status = "✓";
      }

      let displayLine = `${displayNum}. [${status}] ${icon} `;
      if (entry.isParent) {
        displayLine += "[Parent Directory]";
      } else {
        displayLine += entry.name;
      }

      console.log(displayLine);
    });

    console.log("---------------------------------------------");
    if (totalPages > 1) {
      console.log(
        `Page ${
          page + 1
        }/${totalPages} - Use 'n' for next page, 'p' for previous`
      );
    }

    displayBrowseCommands();

    return handleBrowseInput(rl, currentDir, page, currentPageEntries);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return new Promise((resolve) => {
      rl.question("Press Enter to return to main menu...", () =>
        resolve("main")
      );
    });
  }
}

function displayBrowseCommands() {
  console.log("\nCommands:");
  console.log("- Enter NUMBER to select/deselect a file (Example: 3)");
  console.log("- Enter dNUMBER to navigate into a directory (Example: d1)");
  console.log("- Enter sNUMBER to select a whole directory (Example: s2)");
  console.log("- Enter NUMBER-NUMBER to select a range (Example: 1-5)");
  console.log(
    "- Enter sNUMBER-NUMBER to select multiple directories (Example: s1-3)"
  );
  console.log(
    "- Enter rNUMBER to exclude an item from selection (Example: r4)"
  );
  console.log(
    "- Enter NUMBER-NUMBER rNUMBER to select a range with exclusions (Example: 1-5 r3)"
  );
  console.log("- Enter c to clear all selections");
  console.log("- Enter v to view current selections");
  console.log("- Enter pr to print selected files to console");
  console.log("- Enter m to return to main menu");
  console.log("- Use 'n' for next page, 'p' for previous page");
}

function handleBrowseInput(rl, currentDir, page, currentPageEntries) {
  return new Promise((resolve) => {
    rl.question("\nEnter command: ", (answer) => {
      const cmd = answer.toLowerCase();

      if (cmd === "n" || cmd === "p") {
        const newPage = cmd === "n" ? page + 1 : page - 1;
        resolve(["browse", currentDir, newPage]);
        return;
      }

      if (cmd === "c") {
        appState.clearSelectedPaths();
        resolve(["browse", currentDir, page]);
        return;
      }

      if (cmd === "v") {
        viewSelected(rl, () => resolve(["browse", currentDir, page]));
        return;
      }

      if (cmd === "pr") {
        printSelectedFiles(rl, () => resolve(["browse", currentDir, page]));
        return;
      }

      if (cmd === "m") {
        resolve(["main"]);
        return;
      }

      handleNumberCommands(
        answer,
        currentDir,
        page,
        currentPageEntries,
        rl,
        resolve
      );
    });
  });
}

function handleNumberCommands(
  answer,
  currentDir,
  page,
  currentPageEntries,
  rl,
  resolve
) {
  // Single number selection
  const numMatch = answer.match(/^(\d+)$/);
  // Directory navigation
  const dirMatch = answer.match(/^d\s*(\d+)$/);
  const dirMatchNoSpace = answer.match(/^d(\d+)$/);
  // Single directory selection
  const selectDirMatch = answer.match(/^s\s*(\d+)$/);
  const selectDirMatchNoSpace = answer.match(/^s(\d+)$/);
  // Range selection (e.g., 1-5)
  const rangeMatch = answer.match(/^(\d+)-(\d+)$/);
  // Directory range selection (e.g., s1-5)
  const selectDirRangeMatch = answer.match(/^s\s*(\d+)-(\d+)$/);
  const selectDirRangeMatchNoSpace = answer.match(/^s(\d+)-(\d+)$/);
  // Exclusion (e.g., r3)
  const excludeMatch = answer.match(/^r\s*(\d+)$/);
  const excludeMatchNoSpace = answer.match(/^r(\d+)$/);
  // Range with exclusion (e.g., 1-5 r3)
  const rangeWithExcludeMatch = answer.match(/^(\d+)-(\d+)\s+r\s*(\d+)$/);
  const rangeWithExcludeMatchNoSpace = answer.match(/^(\d+)-(\d+)\s*r(\d+)$/);
  // Directory range with exclusion (e.g., s1-5 r3)
  const selectDirRangeWithExcludeMatch = answer.match(
    /^s\s*(\d+)-(\d+)\s+r\s*(\d+)$/
  );
  const selectDirRangeWithExcludeMatchNoSpace = answer.match(
    /^s(\d+)-(\d+)\s*r(\d+)$/
  );

  if (numMatch) {
    handleFileSelection(
      parseInt(numMatch[1]) - 1,
      currentPageEntries,
      currentDir,
      page,
      rl,
      resolve
    );
  } else if (dirMatch || dirMatchNoSpace) {
    const match = dirMatch || dirMatchNoSpace;
    handleDirectoryNavigation(
      parseInt(match[1]) - 1,
      currentPageEntries,
      resolve
    );
  } else if (selectDirMatch || selectDirMatchNoSpace) {
    const match = selectDirMatch || selectDirMatchNoSpace;
    handleDirectorySelection(
      parseInt(match[1]) - 1,
      currentPageEntries,
      currentDir,
      page,
      rl,
      resolve
    );
  } else if (rangeMatch) {
    handleRangeSelection(
      parseInt(rangeMatch[1]) - 1,
      parseInt(rangeMatch[2]) - 1,
      null,
      currentPageEntries,
      currentDir,
      page,
      rl,
      resolve,
      false
    );
  } else if (selectDirRangeMatch || selectDirRangeMatchNoSpace) {
    const match = selectDirRangeMatch || selectDirRangeMatchNoSpace;
    handleRangeSelection(
      parseInt(match[1]) - 1,
      parseInt(match[2]) - 1,
      null,
      currentPageEntries,
      currentDir,
      page,
      rl,
      resolve,
      true
    );
  } else if (excludeMatch || excludeMatchNoSpace) {
    const match = excludeMatch || excludeMatchNoSpace;
    handleExclusion(
      parseInt(match[1]) - 1,
      currentPageEntries,
      currentDir,
      page,
      rl,
      resolve
    );
  } else if (rangeWithExcludeMatch || rangeWithExcludeMatchNoSpace) {
    const match = rangeWithExcludeMatch || rangeWithExcludeMatchNoSpace;
    handleRangeSelection(
      parseInt(match[1]) - 1,
      parseInt(match[2]) - 1,
      parseInt(match[3]) - 1,
      currentPageEntries,
      currentDir,
      page,
      rl,
      resolve,
      false
    );
  } else if (
    selectDirRangeWithExcludeMatch ||
    selectDirRangeWithExcludeMatchNoSpace
  ) {
    const match =
      selectDirRangeWithExcludeMatch || selectDirRangeWithExcludeMatchNoSpace;
    handleRangeSelection(
      parseInt(match[1]) - 1,
      parseInt(match[2]) - 1,
      parseInt(match[3]) - 1,
      currentPageEntries,
      currentDir,
      page,
      rl,
      resolve,
      true
    );
  } else {
    console.log("Invalid command.");
    setTimeout(() => resolve(["browse", currentDir, page]), 1000);
  }
}

function handleFileSelection(idx, entries, currentDir, page, rl, resolve) {
  if (idx >= 0 && idx < entries.length) {
    const entry = entries[idx];
    if (!entry.isParent) {
      if (entry.isDir) {
        rl.question(
          "Select all files in this directory? (y/n): ",
          (response) => {
            if (response.toLowerCase() === "y") {
              const dirFiles = getAllFilesInDir(
                path.join(appState.rootPath, entry.path),
                entry.path
              );
              const allSelected =
                dirFiles.length > 0 &&
                dirFiles.every((file) => appState.isPathSelected(file));

              if (allSelected) {
                dirFiles.forEach((file) => appState.removeSelectedPath(file));
              } else {
                dirFiles.forEach((file) => appState.addSelectedPath(file));
              }
            } else {
              resolve(["browse", entry.path, 0]);
              return;
            }
            resolve(["browse", currentDir, page]);
          }
        );
        return;
      } else {
        if (appState.isPathSelected(entry.path)) {
          appState.removeSelectedPath(entry.path);
        } else {
          appState.addSelectedPath(entry.path);
        }
      }
    } else {
      resolve(["browse", entry.path, 0]);
      return;
    }
  }
  resolve(["browse", currentDir, page]);
}

function handleDirectoryNavigation(idx, entries, resolve) {
  if (idx >= 0 && idx < entries.length) {
    const entry = entries[idx];
    if (entry.isDir) {
      resolve(["browse", entry.path, 0]);
      return;
    }
  }
  resolve(["browse", currentDir, page]);
}

function handleDirectorySelection(idx, entries, currentDir, page, rl, resolve) {
  if (idx >= 0 && idx < entries.length) {
    const entry = entries[idx];
    if (entry.isDir && !entry.isParent) {
      const dirFiles = getAllFilesInDir(
        path.join(appState.rootPath, entry.path),
        entry.path
      );
      const allSelected =
        dirFiles.length > 0 &&
        dirFiles.every((file) => appState.isPathSelected(file));

      if (allSelected) {
        dirFiles.forEach((file) => appState.removeSelectedPath(file));
        console.log(`Deselected all files in ${entry.name}/`);
      } else {
        dirFiles.forEach((file) => appState.addSelectedPath(file));
        console.log(`Selected all ${dirFiles.length} files in ${entry.name}/`);
      }

      rl.question("Press Enter to continue...", () => {
        resolve(["browse", currentDir, page]);
      });
      return;
    }
  }
  resolve(["browse", currentDir, page]);
}

function viewSelected(rl, callback) {
  console.clear();
  console.log("Currently Selected Items:");
  console.log("---------------------------------------------");

  const selectedPaths = appState.getSelectedPaths();
  if (selectedPaths.length === 0) {
    console.log("No items selected");
  } else {
    const grouped = {};
    selectedPaths.forEach((filePath) => {
      const dir = path.dirname(filePath);
      if (!grouped[dir]) grouped[dir] = [];
      grouped[dir].push(path.basename(filePath));
    });

    Object.keys(grouped)
      .sort()
      .forEach((dir) => {
        console.log(`${dir === "." ? "Root" : dir}/:`);
        grouped[dir].sort().forEach((file) => {
          console.log(`  - ${file}`);
        });
      });
  }

  console.log("---------------------------------------------");
  console.log(`Total: ${selectedPaths.length} file(s)`);

  rl.question("Press Enter to continue...", callback);
}

function printSelectedFiles(rl, callback) {
  console.clear();
  console.log("Printing Selected Files:");
  console.log("---------------------------------------------");

  const selectedPaths = appState.getSelectedPaths();
  if (selectedPaths.length === 0) {
    console.log("No items selected to print");
    rl.question("Press Enter to continue...", callback);
    return;
  }

  let output = "";
  output += "Selected Files Output\n";
  output += "===================\n\n";

  const grouped = {};
  selectedPaths.forEach((filePath) => {
    const dir = path.dirname(filePath);
    if (!grouped[dir]) grouped[dir] = [];
    grouped[dir].push(path.basename(filePath));
  });

  Object.keys(grouped)
    .sort()
    .forEach((dir) => {
      const dirHeader = `${dir === "." ? "Root" : dir}/:\n`;
      console.log(dirHeader);
      output += dirHeader;

      grouped[dir].sort().forEach((file) => {
        try {
          const fullPath = path.join(appState.rootPath, dir, file);
          const content = fs.readFileSync(fullPath, "utf8");
          const fileContent = `\n----- ${file} -----\n${content}\n----- End of ${file} -----\n\n`;
          console.log(fileContent);
          output += fileContent;
        } catch (error) {
          const errorMsg = `  Error reading ${file}: ${error.message}\n`;
          console.log(errorMsg);
          output += errorMsg;
        }
      });
    });

  console.log("---------------------------------------------");
  console.log(`Total: ${selectedPaths.length} file(s) printed`);
  output += "\n---------------------------------------------\n";
  output += `Total: ${selectedPaths.length} file(s) printed\n`;

  rl.question("Do you want to save the output to a file? (y/n): ", (answer) => {
    if (answer.toLowerCase() === "y") {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const outputFileName = `printed_files_${timestamp}.txt`;
      try {
        fs.writeFileSync(outputFileName, output);
        console.log(`\nOutput saved to: ${outputFileName}`);
      } catch (error) {
        console.error(`Error saving file: ${error.message}`);
      }
    }
    rl.question("\nPress Enter to continue...", callback);
  });
}

// Function to handle range selection with optional exclusion
function handleRangeSelection(
  startIdx,
  endIdx,
  excludeIdx,
  entries,
  currentDir,
  page,
  rl,
  resolve,
  isDirectorySelection
) {
  // Ensure start is less than end
  if (startIdx > endIdx) {
    [startIdx, endIdx] = [endIdx, startIdx];
  }

  // Validate range
  if (startIdx < 0 || endIdx >= entries.length) {
    console.log("Invalid range selection.");
    setTimeout(() => resolve(["browse", currentDir, page]), 1000);
    return;
  }

  // Process each item in the range
  for (let i = startIdx; i <= endIdx; i++) {
    // Skip the excluded index if specified
    if (excludeIdx !== null && i === excludeIdx) {
      continue;
    }

    const entry = entries[i];
    if (!entry.isParent) {
      if (isDirectorySelection) {
        // Handle directory selection
        if (entry.isDir) {
          const dirFiles = getAllFilesInDir(
            path.join(appState.rootPath, entry.path),
            entry.path
          );
          dirFiles.forEach((file) => appState.addSelectedPath(file));
          console.log(`Selected all files in ${entry.name}/`);
        }
      } else {
        // Handle file selection
        if (entry.isDir) {
          // For directories in file selection mode, ask if user wants to select all files
          const dirFiles = getAllFilesInDir(
            path.join(appState.rootPath, entry.path),
            entry.path
          );
          dirFiles.forEach((file) => appState.addSelectedPath(file));
        } else {
          appState.addSelectedPath(entry.path);
        }
      }
    }
  }

  console.log(
    `Selected ${isDirectorySelection ? "directories" : "items"} from ${
      startIdx + 1
    } to ${endIdx + 1}${
      excludeIdx !== null ? ` (excluding ${excludeIdx + 1})` : ""
    }`
  );
  setTimeout(() => resolve(["browse", currentDir, page]), 1000);
}

// Function to handle exclusion
function handleExclusion(idx, entries, currentDir, page, rl, resolve) {
  if (idx >= 0 && idx < entries.length) {
    const entry = entries[idx];
    if (!entry.isParent) {
      if (entry.isDir) {
        const dirFiles = getAllFilesInDir(
          path.join(appState.rootPath, entry.path),
          entry.path
        );
        dirFiles.forEach((file) => appState.removeSelectedPath(file));
        console.log(`Removed all files in ${entry.name}/ from selection`);
      } else {
        appState.removeSelectedPath(entry.path);
        console.log(`Removed ${entry.name} from selection`);
      }
    }
  } else {
    console.log("Invalid item number for exclusion.");
  }

  setTimeout(() => resolve(["browse", currentDir, page]), 1000);
}

module.exports = {
  listDirectory,
  viewSelected,
  printSelectedFiles,
};
