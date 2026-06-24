import { spawnSync } from "node:child_process";
import { platform } from "node:os";

const osName = getOsName();
const npmCommand = platform() === "win32" ? "npm.cmd" : "npm";

main();

function main() {
  printHeader();
  printOsGuidance();

  const nodeVersion = process.version;
  console.log(`Node.js: ${nodeVersion}`);

  const npmVersion = readCommand(npmCommand, ["--version"]);

  if (!npmVersion.ok) {
    console.error("\nCould not find npm. Install Node.js 18+ from https://nodejs.org/");
    process.exit(1);
  }

  console.log(`npm: ${npmVersion.output}`);

  const cargoVersion = readCommand("cargo", ["--version"]);

  if (!cargoVersion.ok) {
    console.warn("\nRust/Cargo was not found.");
    console.warn("Install Rust with rustup: https://www.rust-lang.org/tools/install");
    console.warn("After installing Rust, restart your terminal and run this setup again.");
  } else {
    console.log(`Cargo: ${cargoVersion.output}`);
  }

  runStep("Installing JavaScript dependencies", npmCommand, ["install"]);
  runStep("Running frontend tests", npmCommand, ["test"]);

  console.log("\nSetup complete.");
  console.log("\nNext command:");
  console.log("  npm run tauri dev");
}

function printHeader() {
  console.log("\nLearning Debt setup");
  console.log("===================");
  console.log(`Detected OS: ${osName}\n`);
}

function printOsGuidance() {
  if (platform() === "darwin") {
    console.log("macOS note: if the Tauri build fails, install or update Xcode Command Line Tools:");
    console.log("  xcode-select --install\n");
    return;
  }

  if (platform() === "win32") {
    console.log("Windows note: Tauri may require Microsoft C++ Build Tools and WebView2.");
    console.log("Install Rust with rustup if Cargo is missing.\n");
    return;
  }

  if (platform() === "linux") {
    console.log("Linux note: Tauri may require WebKitGTK and other system packages.");
    console.log("Debian/Ubuntu example only:");
    console.log(
      "  sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev",
    );
    console.log("Other distributions use different package names.\n");
  }
}

function getOsName() {
  switch (platform()) {
    case "darwin":
      return "macOS";
    case "win32":
      return "Windows";
    case "linux":
      return "Linux";
    default:
      return platform();
  }
}

function readCommand(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    shell: false,
  });

  return {
    ok: result.status === 0,
    output: result.stdout.trim(),
  };
}

function runStep(label, command, args) {
  console.log(`\n${label}...`);

  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    console.error(`\nFailed while ${label.toLowerCase()}.`);
    process.exit(result.status ?? 1);
  }
}
