# TOMCOM Deutsch

Learn German in Telugu, English or Hindi. A mobile app (iOS and Android, built with Expo) for learners from Telangana preparing to work in Germany, covering CEFR levels A1, A2 and B1.

Published by Telangana Overseas Manpower Company Limited (TOMCOM).

## Features

- **48-lesson curriculum** (A1 · A2 · B1). Each lesson has vocabulary with audio, examples, a grammar note, a deep dive, more vocabulary, a sample dialogue, a cultural note, common mistakes and quick exercises.
- **Trilingual:** every explanation in Telugu, English or Hindi, switchable on any screen.
- **Audio:** recorded clips where available, otherwise the device's German voice, at normal and slow speed.
- **Quizzes:** 6 questions per lesson (4 multiple choice, 2 listening) on one page, with explanations. Pass mark 80%; the best score is kept.
- **Dashboard:** progress per level, "continue where you left off", lessons unlock in order.
- **Certificates:** earned when every quiz in a level is at 80% or more; shareable as a PDF.
- **AI tutor:** ask questions or "How do I say this in German?"; German lines are highlighted and spoken. Voice mode with a full-screen view.
- **Accounts:** email and password, password reset with a 6-digit code, profile with stats.

## Run the demo (Mac, one command)

```bash
git clone https://github.com/smadduri9/tom-com-german-tutor-poc.git && cd tom-com-german-tutor-poc
./demo.sh
```

The script checks Xcode and Node.js, installs the packages, starts an iPhone simulator and opens the app. No API keys are needed: without a backend configured, the app uses an on-device demo backend.

- **Demo sign-in:** `demo@tomcom.test` / `demo1234` (pre-filled on the sign-in screen). Any new email and a 6+ character password also works.
- **Password reset code** in the demo: `123456`.
- **Certificates without doing every quiz:** Profile → Developer tools → "Mark A1 passed (demo)" (development builds only).
- **Other simulator:** `DEMO_DEVICE="iPhone 16 Pro" ./demo.sh`.

## Structure

| Path | Contents |
|---|---|
| `mobile/` | The Expo (React Native) app |
| `mobile/app/` | Screens (Expo Router) |
| `mobile/src/backend/` | One backend interface: Supabase, or the on-device demo backend |
| `mobile/src/logic/` | Progress, unlock, certificate, quiz and tutor rules (unit-tested) |
| `content/lessons/<level>/<slug>.json` | One file per lesson: the single source for lesson text |
| `content/curriculum.json` | The 48-lesson curriculum index |
| `content/ATTRIBUTION.md` | Sources and licences of any imported material |
| `supabase/` | Database migrations and the tutor Edge Function |
| `tools/` | Content build and validation, audio generation, secrets check |

After editing anything in `content/`, run `npm run content` in `mobile/` (it copies the lessons into the app and validates them). `./demo.sh` does this automatically.

## Production backend (Supabase)

1. Create a Supabase project.
2. Run the SQL in `supabase/migrations/0001_init.sql` and `0002_tutor_usage.sql` (SQL editor, or `supabase db push`).
3. Authentication → Email templates → "Reset password": show the code `{{ .Token }}` instead of the link, so the app's 6-digit reset flow works.
4. Copy `mobile/.env.example` to `mobile/.env` and fill in the project URL and **anon** key (never the service-role key).
5. Deploy the tutor and set its key (the key stays in Supabase, never in the app):

```bash
supabase functions deploy tutor
```

```bash
supabase secrets set ANTHROPIC_API_KEY=your-key
```

The tutor allows 30 questions per user per day.

## Run on a phone

Install **Expo Go** on the phone, then:

```bash
cd mobile && npm ci && npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS).

## Tests

```bash
cd mobile && npm test && npm run typecheck && npm run content
```

## Content review

Lesson explanations are written fresh for this app. Telugu and Hindi text needs native-speaker review before release; each lesson tracks this in its `review` field.
