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
| `content/lesson1.json` | Lesson content: the single source for text and audio |
| `tools/generate-audio.mjs` | Generates the German audio from the lesson content |
| `generated/` | Generated audio files |
| `docs/` | Build plan and audio setup |

## Run the app

Requires Node.js 18+ and the **Expo Go** app on your phone.

```bash
cd mobile
npm install
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
