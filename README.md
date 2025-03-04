# Prompt Code Generator

A powerful CLI tool that helps developers create context-rich prompts for AI assistants by selecting and organizing code files from your projects.

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D12.0.0-brightgreen" alt="Node.js Version">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
</p>

## 🚀 Features

- **Interactive file browser** with intuitive directory navigation
- **Smart file selection** with range support (`1-5`, `s 1-3`, `1-5 r 2`)
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

| Command                  | Description                     | Example   |
| ------------------------ | ------------------------------- | --------- |
| `NUMBER`                 | Select/deselect a file          | `3`       |
| `d NUMBER`               | Navigate into a directory       | `d 1`     |
| `s NUMBER`               | Select all files in a directory | `s 2`     |
| `NUMBER-NUMBER`          | Select a range of items         | `1-5`     |
| `s NUMBER-NUMBER`        | Select multiple directories     | `s 1-3`   |
| `r NUMBER`               | Exclude an item from selection  | `r 4`     |
| `NUMBER-NUMBER r NUMBER` | Select range with exclusions    | `1-5 r 3` |
| `c`                      | Clear all selections            |           |
| `v`                      | View current selections         |           |
| `pr`                     | Print selected files to console |           |
| `m`                      | Return to main menu             |           |
| `n` / `p`                | Navigate between pages          |           |

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
