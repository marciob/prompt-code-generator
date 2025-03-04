const fs = require("fs");
const path = require("path");
const appState = require("../core/state");

function generateProjectTree(
  startPath,
  relativePath = "",
  indent = "",
  isLast = true
) {
  const stats = fs.statSync(startPath);

  if (!stats.isDirectory()) {
    return `${indent}${isLast ? "└── " : "├── "}${path.basename(startPath)}\n`;
  }

  let output = "";
  if (relativePath !== "") {
    output += `${indent}${isLast ? "└── " : "├── "}${path.basename(
      startPath
    )}/\n`;
    indent += isLast ? "    " : "│   ";
  }

  try {
    const files = fs
      .readdirSync(startPath)
      .filter((file) => !file.startsWith("."))
      .filter((file) => {
        const baseName = path.basename(file);
        return !appState.excludedDirs.includes(baseName);
      })
      .sort((a, b) => {
        const aIsDir = fs.statSync(path.join(startPath, a)).isDirectory();
        const bIsDir = fs.statSync(path.join(startPath, b)).isDirectory();
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a.localeCompare(b);
      });

    files.forEach((file, index) => {
      const filePath = path.join(startPath, file);
      const newRelativePath = path.join(relativePath, file);
      output += generateProjectTree(
        filePath,
        newRelativePath,
        indent,
        index === files.length - 1
      );
    });

    return output;
  } catch (error) {
    return `${indent}Error reading directory: ${error.message}\n`;
  }
}

function getAllFilesInDir(dirPath, relativeDirPath = "") {
  const allFiles = [];

  try {
    const entries = fs
      .readdirSync(dirPath)
      .filter((entry) => !entry.startsWith("."));

    entries.forEach((entry) => {
      const fullPath = path.join(dirPath, entry);
      const relativePath = path.join(relativeDirPath, entry);

      if (fs.statSync(fullPath).isDirectory()) {
        const subDirFiles = getAllFilesInDir(fullPath, relativePath);
        allFiles.push(...subDirFiles);
      } else {
        allFiles.push(relativePath);
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dirPath}: ${error.message}`);
  }

  return allFiles;
}

function getFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    return `Error reading file: ${error.message}`;
  }
}

function validatePath(newPath) {
  if (newPath.startsWith("~")) {
    newPath = path.join(
      process.env.HOME || process.env.USERPROFILE,
      newPath.slice(1)
    );
  }

  if (!path.isAbsolute(newPath)) {
    newPath = path.resolve(process.cwd(), newPath);
  }

  return fs.existsSync(newPath) && fs.statSync(newPath).isDirectory()
    ? newPath
    : null;
}

module.exports = {
  generateProjectTree,
  getAllFilesInDir,
  getFileContent,
  validatePath,
};
