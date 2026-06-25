# Learning Debt

**Capture unanswered questions before you forget them.**

Learning Debt is a local-first desktop app for developers to capture unanswered technical questions, track open learning debt, and turn resolved questions into lessons learned.

![Local-first](https://img.shields.io/badge/Local--first-yes-202124)
![Offline](https://img.shields.io/badge/Offline-yes-202124)
![SQLite](https://img.shields.io/badge/SQLite-local-003b57)
![Tauri](https://img.shields.io/badge/Tauri-v2-24c8db)
![React](https://img.shields.io/badge/React-18-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)
![License](https://img.shields.io/badge/License-MIT-green)
![Tests](https://img.shields.io/badge/Tests-Vitest-6e9f18)

## Why I built this

While building software, I kept running into technical questions I did not have time to answer immediately.
I would open more browser tabs, save links, or tell myself I would come back later.
Most of those questions were eventually forgotten.

I built Learning Debt to capture unanswered questions without breaking my flow, revisit them later, and turn them into lessons learned.
The goal is not to remember everything. It is to make sure the important questions do not get lost.

## What is Learning Debt?

While building software we constantly postpone technical questions.
Most of them disappear forever.

Learning Debt lets you capture those questions while you're in flow, revisit them later, and convert them into lessons learned.

## Features

- Capture questions or learning topics.
- Prioritize by learning impact.
- Track open learning debt.
- Resolve questions with a lesson learned.
- Local-first SQLite storage.
- Offline by default.
- Cross-platform desktop app.

## How it works

### 1. Capture

Capture a question or topic before it disappears from working memory.

<p align="center">
  <img src="screenshots/01-capture-empty.png" alt="Empty capture screen" width="760">
</p>

### 2. Track

Keep open learning debt visible and lightweight.

<p align="center">
  <img src="screenshots/02-open-debt-created.png" alt="Open debt item created" width="760">
</p>

### 3. Resolve

Open an item and summarize the idea you learned.

<p align="center">
  <img src="screenshots/04-resolve-lesson.png" alt="Resolve debt with lesson learned" width="760">
</p>

### 4. Learn

Resolved debt becomes a small local archive of lessons learned.

<p align="center">
  <img src="screenshots/06-open-and-resolved.png" alt="Open and resolved debt example" width="760">
</p>

## Tech Stack

- Tauri v2
- React
- TypeScript
- SQLite
- Vitest
- React Testing Library

## Getting Started

### Requirements

- Node.js 18+ and npm
- Rust and Cargo
- Tauri system dependencies for your operating system

Official Tauri prerequisites:

```text
https://v2.tauri.app/start/prerequisites/
```

### Setup

Run the onboarding script:

```sh
npm run setup
```

The setup script checks your local toolchain, installs JavaScript dependencies, and runs the frontend tests.

### Run locally

Start the desktop app:

```sh
npm run tauri dev
```

Run only the web UI:

```sh
npm run dev
```

### Run tests

```sh
npm test
```

### Build

Build the frontend:

```sh
npm run build
```

Build the desktop app:

```sh
npm run tauri build
```

## Local Data

Learning Debt stores captured items locally in SQLite through the Tauri SQL plugin.

Database name:

```text
learning-debt.db
```

On macOS during development, the database is stored at:

```sh
~/Library/Application Support/com.learningdebt.app/learning-debt.db
```

Database files are intentionally ignored by Git.

## Cross-platform testing

Learning Debt is intended to work on macOS, Windows, and Linux.

macOS has been tested during development. Windows and Linux feedback is welcome. If setup fails on your platform, please open an issue or pull request with the OS version, command output, and any missing system dependencies.

### macOS

- Install Xcode Command Line Tools if the Tauri build fails:

```sh
xcode-select --install
```

### Windows

- Install Node.js 18+.
- Install Rust with rustup.
- Install Microsoft C++ Build Tools.
- Ensure WebView2 is available.
- Run commands from PowerShell, Command Prompt, or a terminal configured for Rust.

### Linux

- Install Node.js 18+.
- Install Rust with rustup.
- Install the WebKitGTK and build dependencies required by Tauri for your distribution.
- Package names vary by distro, so use the Tauri prerequisites page as the source of truth.

Debian/Ubuntu example:

```sh
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

## Current Limitations

- No sync.
- No authentication.
- No cloud backend.
- No search or filters.
- No edit flow for existing items.
- No archive or trash recovery.
- No CI or release automation yet.
- Tests currently cover core React behavior, not real SQLite or Tauri desktop integration.

## Roadmap

- [ ] Windows compatibility testing.
- [ ] Linux compatibility testing.
- [ ] Global shortcut.
- [ ] Reflection dashboard.
- [ ] GitHub Actions builds.

## Contributing

Issues and pull requests are welcome. For platform setup problems, please include your OS version, the command you ran, and the relevant terminal output.

## License

MIT License. See [LICENSE](LICENSE).
