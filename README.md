# Prompt Code Generator

A powerful CLI tool that helps developers create context-rich prompts for AI assistants by selecting and organizing code files from your projects.

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D12.0.0-brightgreen" alt="Node.js Version">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
</p>

## 🚀 Features

- **Interactive file browser** with intuitive directory navigation
- **Smart file selection** with range support (`1-5`, `s1-3`, `1-5 r3`)
- **Content preview** with print functionality
- **Customizable excluded directories** to skip irrelevant files
- **Problem statement integration** for context-rich prompts
- **Project tree visualization** for better code structure understanding
- **Flexible output options** (view in terminal or save to file)

## 🔧 Installation

```bash
# Clone the repository
git clone <repository-url>
cd prompt-code

# Install dependencies
npm install

# Make the script executable
chmod +x src/index.js

# Optional: Install globally
npm install -g .
```

## 📋 Usage

```bash
# Run directly
node src/index.js [path-to-project]

# If installed globally
prompt-code [path-to-project]

# If no path is provided, you'll be prompted to enter one
```

## 🎮 Commands

| Command                 | Description                                                | Example  |
| ----------------------- | ---------------------------------------------------------- | -------- |
| `NUMBER`                | Select/deselect a single file                              | `3`      |
| `dNUMBER`               | Navigate into a directory                                  | `d1`     |
| `sNUMBER`               | Select a directory and ALL files in ALL its subfolders     | `s2`     |
| `NUMBER-NUMBER`         | Select a range of items (files or dirs as single items)    | `1-5`    |
| `sNUMBER-NUMBER`        | Select multiple directories with ALL their subfolder files | `s1-3`   |
| `rNUMBER`               | Exclude an item from selection                             | `r4`     |
| `NUMBER-NUMBER rNUMBER` | Select range with exclusions                               | `1-5 r3` |
| `c`                     | Clear all selections                                       |          |
| `v`                     | View current selections                                    |          |
| `pr`                    | Print selected files to console                            |          |
| `m`                     | Return to main menu                                        |          |
| `n` / `p`               | Navigate between pages                                     |          |

**Note on directory selection:**

- Commands without `s` prefix (like `3` or `1-5`) select items as individual entries. If a directory is selected this way, it's treated as a single item without including its contents.
- Commands with `s` prefix (like `s2` or `s1-3`) recursively select all files within directories and their subfolders.

## 🧩 Project Structure

```
src/
├── commands/     # Command implementations
├── core/         # Core application logic
├── utils/        # Utility functions
└── index.js      # Main entry point
```

## 📄 License

MIT
