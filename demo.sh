#!/usr/bin/env bash
# One-command demo: checks the Mac, installs the app's packages, boots an
# iPhone 15 Pro Max simulator and opens the app in it with Expo Go.
# Usage: ./demo.sh            (run it again any time; finished steps are skipped)
#        DEMO_DEVICE="iPhone 16 Pro" ./demo.sh   to use another simulator
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
APP="$ROOT/mobile"
DEVICE_NAME="${DEMO_DEVICE:-iPhone 15 Pro Max}"
DEVICE_TYPE="com.apple.CoreSimulator.SimDeviceType.$(echo "$DEVICE_NAME" | tr ' ' '-')"
TOTAL=5
STEP=0

bold=$'\033[1m'; dim=$'\033[2m'; red=$'\033[31m'; green=$'\033[32m'; yellow=$'\033[33m'; reset=$'\033[0m'

step() {
  STEP=$((STEP + 1))
  local filled=$((STEP * 20 / TOTAL)) bar=""
  for ((i = 0; i < 20; i++)); do if ((i < filled)); then bar+="█"; else bar+="░"; fi; done
  printf '\n%s[%s] %d/%d  %s%s\n' "$bold" "$bar" "$STEP" "$TOTAL" "$1" "$reset"
}
ok() { printf '  %s✓%s %s\n' "$green" "$reset" "$1"; }
note() { printf '  %s%s%s\n' "$dim" "$1" "$reset"; }
die() {
  printf '\n  %s✗ %s%s\n' "$red" "$1" "$reset"
  shift
  for line in "$@"; do printf '    %s\n' "$line"; done
  printf '\n  Fix that, then run %s./demo.sh%s again.\n\n' "$bold" "$reset"
  exit 1
}
ask() {
  local reply
  read -r -p "  $1 [y/N] " reply </dev/tty || return 1
  [[ "$reply" =~ ^[Yy] ]]
}

printf '%sTOMCOM Deutsch · demo setup%s\n' "$bold" "$reset"

# ---------------------------------------------------------------- 1. Mac + Xcode
step "Checking Xcode and the iOS Simulator"
[[ "$(uname)" == "Darwin" ]] || die "The iOS Simulator needs a Mac." "On Windows or Linux, run the app on a phone instead: see README.md."
if ! xcode-select -p >/dev/null 2>&1 || [[ ! -d "$(xcode-select -p 2>/dev/null)/Platforms" && ! -d /Applications/Xcode.app ]]; then
  die "Xcode is not installed." "Install it from the App Store (free, large download):" "  https://apps.apple.com/app/xcode/id497799835" "Open it once and accept the licence."
fi
if [[ "$(xcode-select -p)" == *CommandLineTools* ]]; then
  die "Your Mac is using the Command Line Tools instead of Xcode." "Run this (asks for your password):" "  sudo xcode-select -s /Applications/Xcode.app/Contents/Developer"
fi
if ! xcodebuild -checkFirstLaunchStatus >/dev/null 2>&1; then
  die "Xcode needs its one-time setup." "Run this (asks for your password):" "  sudo xcodebuild -runFirstLaunch"
fi
if ! xcrun simctl list runtimes 2>/dev/null | grep -q '^iOS'; then
  note "No iOS Simulator runtime is installed (a one-time download of several GB)."
  if ask "Download it now?"; then
    xcodebuild -downloadPlatform iOS
  else
    die "An iOS Simulator runtime is required." "Run: xcodebuild -downloadPlatform iOS"
  fi
fi
ok "$(xcodebuild -version | head -1) with iOS Simulator"

# ---------------------------------------------------------------- 2. Node.js
step "Checking Node.js"
node_ok() {
  command -v node >/dev/null 2>&1 &&
    node -e 'const [a,b]=process.versions.node.split(".").map(Number);process.exit((a===22&&b>=13)||(a===24&&b>=3)||a>=26?0:1)'
}
if ! node_ok; then
  note "Expo needs Node.js 22.13+ or 24.3+ (found: $(node -v 2>/dev/null || echo none))."
  if command -v brew >/dev/null 2>&1 && ask "Install Node.js 22 with Homebrew now?"; then
    brew install node@22
    export PATH="$(brew --prefix node@22)/bin:$PATH"
    note "Added for this run. To keep it: echo 'export PATH=\"$(brew --prefix node@22)/bin:\$PATH\"' >> ~/.zshrc"
  fi
  node_ok || die "Node.js 22 LTS is required." "Install it from https://nodejs.org (LTS) and open a new terminal."
fi
ok "Node.js $(node -v)"

# ---------------------------------------------------------------- 3. Packages
step "Installing app packages"
LOCK_HASH="$(shasum "$APP/package-lock.json" | cut -d' ' -f1)"
STAMP="$APP/node_modules/.demo-installed"
if [[ -f "$STAMP" && "$(cat "$STAMP")" == "$LOCK_HASH" ]]; then
  ok "Already installed (package-lock.json unchanged)"
else
  note "First run takes a few minutes, depending on your connection."
  (cd "$APP" && npm ci --no-audit --no-fund --loglevel=error --progress=true)
  echo "$LOCK_HASH" >"$STAMP"
  ok "Packages installed"
fi

# ---------------------------------------------------------------- 4. Simulator
step "Starting the $DEVICE_NAME simulator"
# Prints "<udid>" of the named device on the newest iOS runtime, or nothing.
find_device() {
  xcrun simctl list devices available -j | node -e '
    const name = process.argv[1];
    const { devices } = JSON.parse(require("fs").readFileSync(0, "utf8"));
    const ver = (k) => (k.match(/iOS-(\d+)-(\d+)/) || [0, 0, 0]).slice(1).map(Number);
    const keys = Object.keys(devices).filter((k) => k.includes("iOS")).sort((a, b) => {
      const [x, y] = [ver(a), ver(b)];
      return y[0] - x[0] || y[1] - x[1];
    });
    for (const k of keys) {
      const d = devices[k].find((d) => d.name === name);
      if (d) { console.log(d.udid); break; }
    }' "$DEVICE_NAME"
}
UDID="$(find_device)"
if [[ -z "$UDID" ]]; then
  # Newer iOS runtimes drop older iPhones, so use the newest runtime that still supports this one.
  # If none does, fall back to the newest Pro Max model the newest runtime supports.
  read -r RUNTIME TYPE NAME < <(xcrun simctl list runtimes available -j | node -e '
    const want = process.argv[1];
    const rts = JSON.parse(require("fs").readFileSync(0, "utf8")).runtimes
      .filter((r) => r.platform === "iOS" && r.isAvailable)
      .sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }));
    if (!rts.length) process.exit(1);
    const hit = rts.find((r) => r.supportedDeviceTypes.some((t) => t.identifier === want));
    if (hit) { const t = hit.supportedDeviceTypes.find((t) => t.identifier === want); console.log(hit.identifier, t.identifier, t.name); }
    else {
      // Regular-shaped iPhones only (no foldables); the list is newest model first.
      const phones = (r) => r.supportedDeviceTypes.filter((t) => t.productFamily === "iPhone" && !/Duo|Fold|Flip/.test(t.name));
      const rt = rts.find((r) => phones(r).length);
      if (!rt) process.exit(1);
      const p = phones(rt);
      const t = p.find((t) => /Pro Max$/.test(t.name)) || p.find((t) => /Pro$/.test(t.name)) || p[0];
      console.log(rt.identifier, t.identifier, t.name);
    }' "$DEVICE_TYPE") || die "No iOS Simulator runtime with a regular iPhone found." "Run: xcodebuild -downloadPlatform iOS"
  if [[ "$NAME" != "$DEVICE_NAME" ]]; then
    note "This Xcode has no runtime for $DEVICE_NAME; using $NAME instead."
    DEVICE_NAME="$NAME"
    UDID="$(find_device)"
  fi
  if [[ -z "$UDID" ]]; then
    note "Creating $DEVICE_NAME on ${RUNTIME##*.}"
    UDID="$(xcrun simctl create "$DEVICE_NAME" "$TYPE" "$RUNTIME")" || die "Could not create the $DEVICE_NAME simulator."
  fi
fi
# Expo opens the app on the first booted simulator, so the demo device must be the only one running.
OTHERS="$(xcrun simctl list devices booted -j | node -e '
  const { devices } = JSON.parse(require("fs").readFileSync(0, "utf8"));
  console.log(Object.values(devices).flat().map((d) => d.udid).filter((u) => u !== process.argv[1]).join(" "));' "$UDID")"
for other in $OTHERS; do
  note "Shutting down another running simulator ($other)"
  xcrun simctl shutdown "$other" || true
done
xcrun simctl boot "$UDID" 2>/dev/null || true
defaults write com.apple.iphonesimulator CurrentDeviceUDID "$UDID"
# Xcode 27+ replaced Simulator.app with DeviceHub, which opens a device via a devices:// link.
open -a Simulator --args -CurrentDeviceUDID "$UDID" 2>/dev/null ||
  open "devices://device/open?id=$UDID" 2>/dev/null ||
  note "Could not open the simulator window; the app will still start in it."
note "Waiting for the simulator to finish booting..."
xcrun simctl bootstatus "$UDID" -b >/dev/null
ok "$DEVICE_NAME is running"

# ---------------------------------------------------------------- 5. App
step "Opening the app"
note "Expo installs Expo Go on the simulator the first time, then loads the app."
note "Demo sign-in: ${bold}demo@tomcom.test / demo1234${reset}${dim} (pre-filled). Press Ctrl+C here to stop.${reset}"
cd "$APP"
note "Building lesson content from content/ (no network needed)."
npm run --silent content >/dev/null || die "Lesson content is invalid." "Run: cd mobile && npm run content"
exec npx expo start --ios
