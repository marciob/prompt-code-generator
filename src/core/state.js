const { DEFAULT_EXCLUDED_DIRS } = require("../utils/constants");

class AppState {
  constructor() {
    this.rootPath = "";
    this.problemStatement = "";
    this.selectedPaths = new Set();
    this.excludedDirs = [...DEFAULT_EXCLUDED_DIRS];
  }

  setRootPath(path) {
    this.rootPath = path;
  }

  setProblemStatement(statement) {
    this.problemStatement = statement;
  }

  addSelectedPath(path) {
    this.selectedPaths.add(path);
  }

  removeSelectedPath(path) {
    this.selectedPaths.delete(path);
  }

  clearSelectedPaths() {
    this.selectedPaths.clear();
  }

  addExcludedDir(dir) {
    if (!this.excludedDirs.includes(dir)) {
      this.excludedDirs.push(dir);
    }
  }

  removeExcludedDir(index) {
    if (index >= 0 && index < this.excludedDirs.length) {
      this.excludedDirs.splice(index, 1);
      return true;
    }
    return false;
  }

  resetExcludedDirs() {
    this.excludedDirs = [...DEFAULT_EXCLUDED_DIRS];
  }

  isPathSelected(path) {
    return this.selectedPaths.has(path);
  }

  getSelectedPathsCount() {
    return this.selectedPaths.size;
  }

  getSelectedPaths() {
    return Array.from(this.selectedPaths);
  }
}

// Create and export a singleton instance
const appState = new AppState();
module.exports = appState;
