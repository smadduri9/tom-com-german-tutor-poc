# Deutsch Lernen: proof of concept

A Telugu-first German learning app for Android and iOS, aligned with CEFR level A1. This proof of concept contains one complete lesson.

## What the POC shows

- **Trilingual:** every explanation in Telugu, English or Hindi, switchable on any screen.
- **Lesson 1 · Hallo!:** greetings and introducing yourself, with 15 phrases, a dialogue, a grammar note (*Sie* / *du*) and pronunciation tips.
- **Natural German audio:** neural text-to-speech at normal and slow speed, bundled in the app so it works offline.
- **Quiz:** 5 questions with a pass mark of 4/5.
- **Sign-in:** email one-time-code flow (mocked in the POC: code `123456`).
- **Progress** is saved on the device.

## Structure

| Path | Contents |
|---|---|
| `mobile/` | The Expo (React Native) app |
| `content/lessons/<level>/<slug>.json` | One file per lesson: the single source for text and audio |
| `content/curriculum.json` | The 48-lesson curriculum index (A1, A2, B1) |
| `demo.sh` | One-command setup and launch on the iOS Simulator |
| `tools/generate-audio.mjs` | Generates the German audio (ElevenLabs) from the lesson content |
| `generated/` | Generated audio files |
| `docs/` | Build plan and audio setup |

## Run the demo (Mac, one command)

```bash
git clone https://github.com/smadduri9/tom-com-german-tutor-poc.git && cd tom-com-german-tutor-poc
./demo.sh
```

The script shows a progress bar and walks through 5 steps: it checks Xcode and Node.js, installs the app packages, starts an **iPhone 15 Pro Max** simulator and opens the app in it. Run it again any time; finished steps are skipped, so later starts take seconds. Demo sign-in code: `123456`.

You only need **Xcode** (free, App Store). If Node.js 22+ is missing, the script offers to install it with Homebrew, or tells you where to get it. No API keys are needed: the audio is already in the repo.

- **Other simulator:** `DEMO_DEVICE="iPhone 16 Pro" ./demo.sh`. If your Xcode has no iOS runtime for the iPhone 15 Pro Max, the script picks the newest Pro Max it has and says so.
- **Other simulators running** are shut down first, because Expo opens the app on the first running simulator.

## Run on a phone (any computer)

Install **Expo Go** on the phone, then:

```bash
cd mobile
npm ci
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS).

## Tests

```bash
cd mobile
npm test
npm run typecheck
```

## Limitations of the POC

Mock sign-in (no email is sent), one lesson, no backend, no AI tutor. The Telugu and Hindi text are awaiting native-speaker review.
