# Learning Debt

Learning Debt is a local-first desktop app for capturing unanswered questions and topics before they disappear from working memory.

This repository is an MVP built for local testing. It is not a polished product landing page yet.

## Current MVP Features

- Capture a learning debt item with:
  - title
  - kind: `question` or `topic`
  - learning impact: 1-5
- Persist items locally in SQLite.
- View items grouped as Open Debt and Resolved Debt.
- Open a detail modal for each item.
- Resolve an item with a required Lesson Learned.
- Delete an item after confirmation.
- Run a small frontend test suite.

## Tech Stack

- Tauri v2
- React
- TypeScript
- Vite
- SQLite through the Tauri SQL plugin
- Vitest
- React Testing Library

## Requirements

- Node.js 18+ and npm
- Rust and Cargo
- Tauri system dependencies for your operating system

Check the official Tauri prerequisites for your platform:

```text
https://v2.tauri.app/start/prerequisites/
```

## Setup

Install JavaScript dependencies:

```sh
npm install
```

Verify Rust/Cargo is available:

```sh
cargo --version
rustc --version
```

## Development Commands

Run the web UI only:

```sh
npm run dev
```

Run the desktop app:

```sh
npm run tauri dev
```

## Tests

Run the frontend test suite:

```sh
npm test
```

Run tests in watch mode:

```sh
npm run test:watch
```

The current tests mock database calls and focus on React behavior. They do not test Tauri desktop APIs directly.

## Build Commands

Build the frontend:

```sh
npm run build
```

Build the desktop app:

```sh
npm run tauri build
```

## Local Data

Learning Debt is local-first. Captured items are stored in SQLite through the Tauri SQL plugin.

The database name is:

```text
learning-debt.db
```

On macOS during development, it is stored at:

```sh
~/Library/Application Support/com.learningdebt.app/learning-debt.db
```

Database files are intentionally ignored by Git.

## Platform Notes

### macOS

- Install Xcode Command Line Tools:

```sh
xcode-select --install
```

- Install Rust with rustup if `cargo` is missing:

```sh
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
```

### Windows

- Install Node.js 18+.
- Install Rust using rustup.
- Install the Microsoft C++ Build Tools required by Tauri.
- Run commands from PowerShell, Command Prompt, or a terminal configured for Rust.

### Linux

- Install Node.js 18+.
- Install Rust using rustup.
- Install the WebKitGTK and build dependencies required by Tauri for your distribution.
- Package names vary by distro, so use the Tauri prerequisites page as the source of truth.

## Current Limitations

- No sync.
- No authentication.
- No cloud backend.
- No search or filters.
- No edit flow for existing items.
- No archive/trash recovery.
- No CI or release automation yet.
- Tests currently cover only core React behavior, not real SQLite or Tauri desktop integration.

## Roadmap

- Add broader tests for database behavior.
- Add Tauri-focused integration or smoke tests.
- Improve keyboard-first capture flow.
- Add a dedicated reflection/dashboard mode.
- Add export/import for local data.
- Prepare signed builds and release packaging.
