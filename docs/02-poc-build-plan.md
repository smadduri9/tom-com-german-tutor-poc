# POC Build Plan: TOMCOM "Deutsch Lernen" (Expo, Android + iOS)

**Audience: the implementing agent (Claude Haiku).** Follow this file top to bottom. Every file you need is given in full. Copy code **exactly**. Do not add libraries, screens, features or content that are not in this file.

Date: 2026-10-26. Repository: https://github.com/smadduri9/tom-com-german-tutor-poc (**public, the client can see it**).

---

## 0. Rules for the implementing agent (read first)

1. **Copy, don't improvise.** If this file gives code, paste it verbatim. Do not "improve" it.
2. **Never edit** `content/lesson1.json`, `tools/generate-audio.mjs`, or anything in `generated/`. Content and audio are owned by humans.
3. **Install only** the packages listed in Phase 1. Use `npx expo install` (never plain `npm install <pkg>` for runtime packages) so versions match the Expo SDK.
4. **Run every "Verify" command** at the end of each phase. If one fails: read the error, fix only what the error points at, re-run. If it still fails after 3 attempts, **stop and report** the exact error. Never swap a library to get around an error.
5. **Every phase ships as its own branch and pull request** (PR), using the exact loop in section G below. Never commit straight to `main` except the one-time Phase 0 push.
6. Work only inside this repository. Never touch files outside it.
7. All user-facing text comes from `src/i18n/strings.ts` or `lesson1.json`. **No hard-coded English text in screens.** The only exceptions are German words and speaker names.
8. **The repository is public and the client reads it.** Never commit `.env`, anything in `internal/`, keys, tokens or personal notes. Never use `git add -f`. Never print the contents of `.env`. Commit messages and PR text must be short, professional and about the app only.

---

## G. Git and GitHub workflow

`gh` is installed and logged in as `smadduri9`. Remote: `https://github.com/smadduri9/tom-com-german-tutor-poc.git`.

### Phase 0: first push (once, before Phase 1)

The remote repository is empty, so this one push goes straight to `main`. Run from the repository root:

```bash
git init -b main
git remote add origin https://github.com/smadduri9/tom-com-german-tutor-poc.git
chmod +x tools/check-secrets.sh
ln -sf ../../tools/check-secrets.sh .git/hooks/pre-commit
git add -A
git status --short
```

**Stop and check the `git status` list.** It must contain only: `.env.example`, `.github/`, `.gitignore`, `README.md`, `content/`, `docs/`, `generated/`, `tools/`. If `.env` or `internal/` appears, **stop and report**; do not continue.

```bash
bash tools/check-secrets.sh
git commit -m "chore: lesson content, generated audio, build plan and CI"
git push -u origin main
```

If `git init` says the repository already exists, skip `git init`. If the remote already exists, skip `git remote add`.

### The PR loop (run for every phase from Phase 1 on)

Replace `<branch>`, `<title>` and `<summary>` with the values from the table below.

```bash
# 1. start the branch from an up-to-date main
git switch main && git pull --ff-only
git switch -c <branch>

# 2. ... do the phase's work and pass its Verify step ...

# 3. commit
git add -A
git status --short          # nothing from .env or internal/ may appear
bash tools/check-secrets.sh
git commit -m "<title>"

# 4. push and open the PR
git push -u origin <branch>
gh pr create --base main --head <branch> --title "<title>" --body "<summary>"

# 5. wait for CI, then merge
gh pr checks <branch> --watch --fail-fast
gh pr merge <branch> --squash --delete-branch

# 6. back to main
git switch main && git pull --ff-only
```

- **If CI fails:** read the failed log (`gh run view --log-failed`), fix it on the same branch, `git commit` and `git push`, then repeat step 5. After 3 failed attempts, stop and report, leaving the PR open.
- **If `gh pr checks` says no checks were reported,** wait 20 seconds and run it again once. If there are still none, merge anyway: the local Verify step already passed.
- Never merge a PR whose checks are red. Never use `--admin` or force-push to `main`.

| Phase | `<branch>` | `<title>` | `<summary>` |
|---|---|---|---|
| 1 | `feat/scaffold` | `feat: scaffold Expo app with lesson assets` | `Expo + TypeScript app with expo-router, expo-audio and AsyncStorage. Bundles Lesson 1 content and audio.` |
| 2 | `feat/core-logic` | `feat: types, i18n strings, mock OTP, quiz and progress logic` | `Pure logic and trilingual (te/en/hi) UI strings. No UI yet.` |
| 3 | `test/logic-and-content` | `test: OTP, quiz, steps, storage and content checks` | `Unit tests, plus content checks that every text is trilingual and every audio clip is bundled.` |
| 4 | `feat/state-audio-components` | `feat: app state, shared audio player and UI components` | `Persisted state, a single audio player (plays in iOS silent mode), language switch and buttons.` |
| 5 | `feat/screens` | `feat: language, sign-in, home, lesson, quiz and result screens` | `All POC screens. Mock email OTP (demo code 123456).` |

---

## 1. What we are building

A demo app (proof of concept) of a Telugu-first German course. It has:

| # | Screen | Route | Purpose |
|---|---|---|---|
| 0 | Gate | `/` | Decides where to go on launch (no UI except a spinner) |
| 1 | Language picker | `/language` | Choose తెలుగు / English / हिन्दी |
| 2 | Email | `/login/email` | Enter email (mock OTP login) |
| 3 | OTP | `/login/otp` | Enter 6-digit code. **Demo code `123456` always works** |
| 4 | Home | `/home` | Lesson 1 card with progress, logout |
| 5 | Lesson | `/lesson` | Intro → 15 phrase cards → dialogue → grammar → pronunciation |
| 6 | Quiz | `/quiz` | 5 multiple-choice questions |
| 7 | Result | `/result` | Score, pass at 4/5, retry or home |

On every screen except the gate there is a **language switch** (`తె | EN | हि`) in the header that changes all text instantly.

**Out of scope (do not build):** real email sending, backend, AI tutor, certificates, more lessons, speech recognition, dark mode, animations.

### Tech stack (locked)

- Expo SDK: latest stable (from `create-expo-app@latest`), TypeScript
- `expo-router` for navigation
- `expo-audio` for playback of **bundled** MP3 files (no network)
- `@react-native-async-storage/async-storage` for saving language, session and progress on the device
- React Context for state (no Redux, no Zustand)
- Jest with `jest-expo` for logic and content tests
- Run on phones with the **Expo Go** app

---

## 2. Prerequisite (done by the human before Haiku starts)

The human runs the audio generator once:

```bash
cp .env.example .env          # then paste the Google key into .env
node tools/generate-audio.mjs
```

This must have produced:
- `generated/audio/` with **42** `.wav` files
- `generated/audioMap.ts`
- `generated/voices.json`

**Haiku: check this first.**

```bash
ls generated/audio/*.wav | wc -l    # must print 42
test -f generated/audioMap.ts && echo OK
```

If either check fails, **stop** and tell the human: "Run `node tools/generate-audio.mjs` first (see docs/03-audio-setup.md)."

---

## Phase 1: Scaffold the Expo app

Run from the repository root:

```bash
npx create-expo-app@latest mobile --template blank-typescript
rm -rf mobile/.git   # the app lives inside this repository, not in its own one
cd mobile
npx expo install expo-router expo-audio @react-native-async-storage/async-storage react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
npx expo install jest-expo jest @types/jest -- --save-dev
```

Delete the template entry files (expo-router replaces them):

```bash
rm -f App.tsx index.ts
```

### 1.1 Edit `mobile/package.json`

Set `"main"` and add `test` / `typecheck` scripts and the `jest` block. Keep everything else that is already there (dependencies and versions).

```json
{
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "test": "jest",
    "typecheck": "tsc --noEmit"
  },
  "jest": {
    "preset": "jest-expo",
    "moduleNameMapper": {
      "\\.(mp3|wav)$": "<rootDir>/__mocks__/fileMock.js"
    }
  }
}
```

### 1.2 Replace `mobile/app.json`

```json
{
  "expo": {
    "name": "Deutsch Lernen",
    "slug": "deutsch-lernen-poc",
    "version": "0.1.0",
    "orientation": "portrait",
    "scheme": "deutschlernen",
    "userInterfaceStyle": "light",
    "ios": { "supportsTablet": false },
    "android": {},
    "plugins": ["expo-router"]
  }
}
```

If the template's `app.json` had `icon`, `splash` or `adaptiveIcon` entries pointing to files in `assets/`, keep those entries too.

### 1.3 Replace `mobile/tsconfig.json`

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "resolveJsonModule": true,
    "esModuleInterop": true
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

### 1.4 Create `mobile/__mocks__/fileMock.js`

```js
module.exports = 1;
```

### 1.5 Copy content and audio into the app

From the repository root:

```bash
mkdir -p mobile/assets/audio mobile/src/data
cp generated/audio/*.wav mobile/assets/audio/
cp generated/audioMap.ts mobile/src/data/audioMap.ts
cp content/lesson1.json mobile/src/data/lesson1.json
```

**Verify (Phase 1):**
```bash
cd mobile && ls assets/audio/*.wav | wc -l   # 42
```
Ship: run the PR loop in section G using this phase's row of the table.

---

## Phase 2: Types, data, strings, logic (no UI yet)

Create these files exactly. Paths are relative to `mobile/`.

### 2.1 `src/types.ts`

```ts
export type Lang = 'te' | 'en' | 'hi';
export const LANGS: Lang[] = ['te', 'en', 'hi'];
export type L10n = Record<Lang, string>;

export type Phrase = { id: string; de: string; meaning: L10n };
export type DialogueLine = { id: string; speaker: string; de: string; meaning: L10n };
export type GrammarExample = { audioId: string; de: string; label: L10n };
export type PronItem = { audioId: string; de: string; focus: string; tip: L10n };
export type QuizOption = { de?: string; text?: L10n };
export type QuizQuestion = {
  id: string;
  prompt: L10n;
  audioId?: string;
  options: QuizOption[];
  correctIndex: number;
};
export type AudioItem = { id: string; text: string; voice: 'female' | 'male'; slow: boolean };

export type Lesson = {
  id: string;
  level: string;
  title: L10n;
  subtitle: L10n;
  intro: L10n;
  phrases: Phrase[];
  dialogue: DialogueLine[];
  grammar: { title: L10n; body: L10n; examples: GrammarExample[] };
  pronunciation: PronItem[];
  quiz: QuizQuestion[];
  audio: AudioItem[];
};
```

### 2.2 `src/data/lesson.ts`

```ts
import raw from './lesson1.json';
import type { Lesson } from '../types';

export const lesson1 = raw as Lesson;

export function hasSlow(audioId: string): boolean {
  return lesson1.audio.some((a) => a.id === audioId && a.slow);
}
```

### 2.3 `src/i18n/strings.ts`

```ts
import type { L10n } from '../types';

export const strings = {
  appName: { en: 'Deutsch Lernen', te: 'Deutsch Lernen', hi: 'Deutsch Lernen' },
  chooseLanguage: { en: 'Choose your language', te: 'మీ భాషను ఎంచుకోండి', hi: 'अपनी भाषा चुनें' },
  chooseLanguageHint: {
    en: 'You can change this any time from the top of the screen.',
    te: 'దీన్ని స్క్రీన్ పైభాగం నుండి ఎప్పుడైనా మార్చవచ్చు.',
    hi: 'आप इसे स्क्रीन के ऊपर से कभी भी बदल सकते हैं।',
  },
  continue: { en: 'Continue', te: 'కొనసాగించు', hi: 'आगे बढ़ें' },
  emailTitle: { en: 'Sign in with email', te: 'ఈమెయిల్‌తో లాగిన్ అవ్వండి', hi: 'ईमेल से साइन इन करें' },
  emailLabel: { en: 'Email address', te: 'ఈమెయిల్ చిరునామా', hi: 'ईमेल पता' },
  emailInvalid: {
    en: 'Please enter a valid email address.',
    te: 'దయచేసి సరైన ఈమెయిల్ చిరునామా ఇవ్వండి.',
    hi: 'कृपया सही ईमेल पता दर्ज करें।',
  },
  sendCode: { en: 'Send code', te: 'కోడ్ పంపండి', hi: 'कोड भेजें' },
  otpTitle: { en: 'Enter the 6-digit code', te: '6 అంకెల కోడ్ ఇవ్వండి', hi: '6 अंकों का कोड दर्ज करें' },
  otpSentTo: { en: 'We sent a code to {email}', te: '{email} కి కోడ్ పంపాము', hi: 'हमने {email} पर कोड भेजा है' },
  otpDemoHint: { en: 'Demo: use code 123456', te: 'డెమో: 123456 కోడ్ వాడండి', hi: 'डेमो: कोड 123456 डालें' },
  verify: { en: 'Verify', te: 'ధృవీకరించు', hi: 'सत्यापित करें' },
  otpInvalidFormat: { en: 'The code must be 6 digits.', te: 'కోడ్ 6 అంకెలు ఉండాలి.', hi: 'कोड 6 अंकों का होना चाहिए।' },
  otpWrong: {
    en: 'Wrong code. {n} attempts left.',
    te: 'తప్పు కోడ్. ఇంకా {n} ప్రయత్నాలు ఉన్నాయి.',
    hi: 'गलत कोड। {n} प्रयास बाकी हैं।',
  },
  otpLocked: {
    en: 'Too many wrong attempts. Please request a new code.',
    te: 'చాలా తప్పు ప్రయత్నాలు. దయచేసి కొత్త కోడ్ అడగండి.',
    hi: 'बहुत अधिक गलत प्रयास। कृपया नया कोड मँगाएँ।',
  },
  otpExpired: {
    en: 'This code has expired. Please request a new code.',
    te: 'ఈ కోడ్ గడువు ముగిసింది. దయచేసి కొత్త కోడ్ అడగండి.',
    hi: 'इस कोड की समय-सीमा समाप्त हो गई है। कृपया नया कोड मँगाएँ।',
  },
  resendIn: { en: 'Resend code in {s}s', te: '{s} సెకన్లలో మళ్ళీ పంపవచ్చు', hi: '{s} सेकंड में दोबारा भेजें' },
  resend: { en: 'Resend code', te: 'కోడ్ మళ్ళీ పంపండి', hi: 'कोड दोबारा भेजें' },
  changeEmail: { en: 'Change email', te: 'ఈమెయిల్ మార్చండి', hi: 'ईमेल बदलें' },
  welcome: { en: 'Welcome!', te: 'స్వాగతం!', hi: 'स्वागत है!' },
  levelA1: { en: 'Level A1 · Beginner', te: 'స్థాయి A1 · ప్రారంభ', hi: 'स्तर A1 · शुरुआती' },
  start: { en: 'Start', te: 'ప్రారంభించండి', hi: 'शुरू करें' },
  resume: { en: 'Continue lesson', te: 'పాఠం కొనసాగించండి', hi: 'पाठ जारी रखें' },
  review: { en: 'Review lesson', te: 'పాఠాన్ని మళ్ళీ చూడండి', hi: 'पाठ दोहराएँ' },
  completed: { en: 'Completed', te: 'పూర్తయింది', hi: 'पूरा हुआ' },
  progress: { en: 'Progress: {p}%', te: 'పురోగతి: {p}%', hi: 'प्रगति: {p}%' },
  bestScore: { en: 'Best quiz score: {s}/5', te: 'ఉత్తమ క్విజ్ స్కోరు: {s}/5', hi: 'सर्वश्रेष्ठ क्विज़ स्कोर: {s}/5' },
  logout: { en: 'Log out', te: 'లాగ్ అవుట్', hi: 'लॉग आउट' },
  lessonTitle: { en: 'Lesson', te: 'పాఠం', hi: 'पाठ' },
  introTitle: { en: "What you'll learn", te: 'మీరు నేర్చుకునేది', hi: 'आप क्या सीखेंगे' },
  phrasesTitle: { en: 'New words {n}/{total}', te: 'కొత్త పదాలు {n}/{total}', hi: 'नए शब्द {n}/{total}' },
  dialogueTitle: { en: 'Dialogue', te: 'సంభాషణ', hi: 'संवाद' },
  pronTitle: { en: 'Pronunciation', te: 'ఉచ్చారణ', hi: 'उच्चारण' },
  play: { en: 'Play', te: 'వినండి', hi: 'सुनें' },
  playSlow: { en: 'Slow', te: 'నెమ్మదిగా', hi: 'धीरे' },
  showMeaning: { en: 'Show meaning', te: 'అర్థం చూపించు', hi: 'अर्थ दिखाएँ' },
  next: { en: 'Next', te: 'తర్వాత', hi: 'आगे' },
  back: { en: 'Back', te: 'వెనుకకు', hi: 'पीछे' },
  startQuiz: { en: 'Start quiz', te: 'క్విజ్ ప్రారంభించండి', hi: 'क्विज़ शुरू करें' },
  quizTitle: { en: 'Quiz', te: 'క్విజ్', hi: 'क्विज़' },
  questionOf: { en: 'Question {n} of {total}', te: 'ప్రశ్న {n} / {total}', hi: 'प्रश्न {n} / {total}' },
  check: { en: 'Check', te: 'సరిచూడు', hi: 'जाँचें' },
  correct: { en: 'Correct!', te: 'సరైనది!', hi: 'सही!' },
  incorrect: {
    en: 'Not quite. The answer is: {answer}',
    te: 'సరైనది కాదు. జవాబు: {answer}',
    hi: 'सही नहीं। उत्तर है: {answer}',
  },
  seeResult: { en: 'See result', te: 'ఫలితం చూడండి', hi: 'परिणाम देखें' },
  resultTitle: { en: 'Result', te: 'ఫలితం', hi: 'परिणाम' },
  resultPass: {
    en: 'Well done! You passed Lesson 1.',
    te: 'శభాష్! మీరు పాఠం 1 పూర్తి చేశారు.',
    hi: 'शाबाश! आपने पाठ 1 पास कर लिया।',
  },
  resultFail: {
    en: 'Almost there. You need 4 out of 5 to pass.',
    te: 'దాదాపు అయిపోయింది. పాస్ అవ్వడానికి 5 లో 4 కావాలి.',
    hi: 'बस थोड़ा और। पास होने के लिए 5 में से 4 चाहिए।',
  },
  score: { en: 'Your score: {score}/5', te: 'మీ స్కోరు: {score}/5', hi: 'आपका स्कोर: {score}/5' },
  retry: { en: 'Try again', te: 'మళ్ళీ ప్రయత్నించండి', hi: 'फिर से कोशिश करें' },
  backHome: { en: 'Back to home', te: 'హోమ్‌కి వెళ్ళండి', hi: 'होम पर जाएँ' },
  audioError: { en: 'Audio could not play.', te: 'ఆడియో ప్లే కాలేదు.', hi: 'ऑडियो नहीं चल सका।' },
} satisfies Record<string, L10n>;

export type StringKey = keyof typeof strings;
```

### 2.4 `src/i18n/t.ts`

```ts
import { strings, type StringKey } from './strings';
import type { L10n, Lang } from '../types';

export function t(lang: Lang, key: StringKey, vars?: Record<string, string | number>): string {
  let s: string = strings[key][lang] || strings[key].en;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  }
  return s;
}

export function pick(text: L10n, lang: Lang): string {
  return text[lang] || text.en;
}
```

### 2.5 `src/logic/otp.ts` (mock OTP, pure functions)

```ts
export const DEMO_CODE = '123456';
export const MAX_ATTEMPTS = 5;
export const RESEND_COOLDOWN_MS = 30_000;
export const CODE_TTL_MS = 10 * 60_000;

export type OtpState = {
  email: string;
  sentAt: number;
  attemptsLeft: number;
  locked: boolean;
};

export type VerifyReason = 'format' | 'wrong' | 'locked' | 'expired';
export type VerifyResult = { ok: true } | { ok: false; reason: VerifyReason };

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function createOtp(email: string, now: number): OtpState {
  return { email: normalizeEmail(email), sentAt: now, attemptsLeft: MAX_ATTEMPTS, locked: false };
}

export function verifyOtp(
  state: OtpState,
  code: string,
  now: number,
): { result: VerifyResult; state: OtpState } {
  if (state.locked) return { result: { ok: false, reason: 'locked' }, state };
  if (now - state.sentAt > CODE_TTL_MS) return { result: { ok: false, reason: 'expired' }, state };
  if (!/^\d{6}$/.test(code)) return { result: { ok: false, reason: 'format' }, state };
  if (code === DEMO_CODE) return { result: { ok: true }, state };
  const attemptsLeft = state.attemptsLeft - 1;
  const next: OtpState = { ...state, attemptsLeft, locked: attemptsLeft <= 0 };
  return { result: { ok: false, reason: next.locked ? 'locked' : 'wrong' }, state: next };
}

export function resendSecondsLeft(state: OtpState, now: number): number {
  return Math.max(0, Math.ceil((state.sentAt + RESEND_COOLDOWN_MS - now) / 1000));
}
```

### 2.6 `src/logic/quiz.ts`

```ts
import type { QuizQuestion } from '../types';

export const PASS_SCORE = 4;

export function scoreQuiz(answers: (number | null)[], questions: QuizQuestion[]): number {
  return questions.reduce((n, q, i) => n + (answers[i] === q.correctIndex ? 1 : 0), 0);
}

export function isPass(score: number): boolean {
  return score >= PASS_SCORE;
}
```

### 2.7 `src/logic/steps.ts`

```ts
import type { Lesson } from '../types';

export type Step =
  | { kind: 'intro' }
  | { kind: 'phrase'; index: number }
  | { kind: 'dialogue' }
  | { kind: 'grammar' }
  | { kind: 'pron' };

export function buildSteps(lesson: Lesson): Step[] {
  return [
    { kind: 'intro' },
    ...lesson.phrases.map((_, index) => ({ kind: 'phrase' as const, index })),
    { kind: 'dialogue' },
    { kind: 'grammar' },
    { kind: 'pron' },
  ];
}

export function clampStep(step: number, total: number): number {
  if (!Number.isFinite(step)) return 0;
  return Math.min(Math.max(0, Math.floor(step)), total - 1);
}
```

### 2.8 `src/state/storage.ts`

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGS, type Lang } from '../types';

const KEY = 'tc.v1';

export type Progress = { step: number; quizBest: number; passed: boolean };
export type Session = { email: string };
export type Persisted = { lang: Lang | null; session: Session | null; progress: Progress };

export const DEFAULT_STATE: Persisted = {
  lang: null,
  session: null,
  progress: { step: 0, quizBest: 0, passed: false },
};

// Never trust stored data: anything malformed falls back to defaults.
export function parsePersisted(raw: string | null): Persisted {
  if (!raw) return DEFAULT_STATE;
  try {
    const d = JSON.parse(raw);
    const lang: Lang | null = LANGS.includes(d?.lang) ? d.lang : null;
    const session: Session | null =
      typeof d?.session?.email === 'string' && d.session.email.length > 0 ? { email: d.session.email } : null;
    const p = d?.progress ?? {};
    const progress: Progress = {
      step: Number.isInteger(p.step) && p.step >= 0 ? p.step : 0,
      quizBest: Number.isInteger(p.quizBest) && p.quizBest >= 0 && p.quizBest <= 5 ? p.quizBest : 0,
      passed: p.passed === true,
    };
    return { lang, session, progress };
  } catch {
    return DEFAULT_STATE;
  }
}

export async function loadState(): Promise<Persisted> {
  try {
    return parsePersisted(await AsyncStorage.getItem(KEY));
  } catch {
    return DEFAULT_STATE;
  }
}

export async function saveState(state: Persisted): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Saving is best effort in the POC; the app keeps working in memory.
  }
}
```

**Verify (Phase 2):**
```bash
cd mobile && npx tsc --noEmit
```
Ship: run the PR loop in section G using this phase's row of the table.

---

## Phase 3: Tests (write them before the UI)

### 3.1 `__tests__/otp.test.ts`

```ts
import {
  CODE_TTL_MS, DEMO_CODE, MAX_ATTEMPTS, RESEND_COOLDOWN_MS,
  createOtp, isValidEmail, normalizeEmail, resendSecondsLeft, verifyOtp,
} from '../src/logic/otp';

describe('email', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('ravi@example.com')).toBe(true);
    expect(isValidEmail('  ravi.k@gov.in ')).toBe(true);
  });
  it('rejects invalid emails', () => {
    for (const e of ['', 'ravi', 'ravi@', '@x.com', 'ravi@x', 'ra vi@x.com', 'ravi@x.c']) {
      expect(isValidEmail(e)).toBe(false);
    }
  });
  it('normalizes', () => expect(normalizeEmail('  Ravi@Example.COM ')).toBe('ravi@example.com'));
});

describe('verifyOtp', () => {
  const t0 = 1_000_000;
  it('accepts the demo code', () => {
    const s = createOtp('a@b.co', t0);
    expect(verifyOtp(s, DEMO_CODE, t0 + 1000).result).toEqual({ ok: true });
  });
  it('rejects bad format without using an attempt', () => {
    const s = createOtp('a@b.co', t0);
    for (const c of ['', '12345', '1234567', 'abcdef', '12 456']) {
      const r = verifyOtp(s, c, t0);
      expect(r.result).toEqual({ ok: false, reason: 'format' });
      expect(r.state.attemptsLeft).toBe(MAX_ATTEMPTS);
    }
  });
  it('counts wrong attempts and locks after the max', () => {
    let s = createOtp('a@b.co', t0);
    for (let i = 1; i < MAX_ATTEMPTS; i++) {
      const r = verifyOtp(s, '000000', t0);
      expect(r.result).toEqual({ ok: false, reason: 'wrong' });
      expect(r.state.attemptsLeft).toBe(MAX_ATTEMPTS - i);
      s = r.state;
    }
    const last = verifyOtp(s, '000000', t0);
    expect(last.result).toEqual({ ok: false, reason: 'locked' });
    expect(last.state.locked).toBe(true);
    expect(verifyOtp(last.state, DEMO_CODE, t0).result).toEqual({ ok: false, reason: 'locked' });
  });
  it('expires after the TTL', () => {
    const s = createOtp('a@b.co', t0);
    expect(verifyOtp(s, DEMO_CODE, t0 + CODE_TTL_MS + 1).result).toEqual({ ok: false, reason: 'expired' });
  });
  it('resend cooldown counts down to zero', () => {
    const s = createOtp('a@b.co', t0);
    expect(resendSecondsLeft(s, t0)).toBe(RESEND_COOLDOWN_MS / 1000);
    expect(resendSecondsLeft(s, t0 + RESEND_COOLDOWN_MS)).toBe(0);
    expect(resendSecondsLeft(s, t0 + RESEND_COOLDOWN_MS + 5000)).toBe(0);
  });
});
```

### 3.2 `__tests__/quiz-steps-storage.test.ts`

```ts
import { lesson1 } from '../src/data/lesson';
import { isPass, scoreQuiz } from '../src/logic/quiz';
import { buildSteps, clampStep } from '../src/logic/steps';
import { DEFAULT_STATE, parsePersisted } from '../src/state/storage';

describe('quiz', () => {
  const q = lesson1.quiz;
  it('scores all correct as 5', () => {
    expect(scoreQuiz(q.map((x) => x.correctIndex), q)).toBe(5);
  });
  it('scores unanswered as wrong', () => {
    expect(scoreQuiz([null, null, null, null, null], q)).toBe(0);
  });
  it('passes at 4, fails at 3', () => {
    expect(isPass(4)).toBe(true);
    expect(isPass(3)).toBe(false);
  });
});

describe('steps', () => {
  it('has intro + 15 phrases + dialogue + grammar + pron', () => {
    const s = buildSteps(lesson1);
    expect(s).toHaveLength(19);
    expect(s[0].kind).toBe('intro');
    expect(s[18].kind).toBe('pron');
  });
  it('clamps', () => {
    expect(clampStep(-3, 19)).toBe(0);
    expect(clampStep(99, 19)).toBe(18);
    expect(clampStep(NaN, 19)).toBe(0);
  });
});

describe('parsePersisted', () => {
  it('returns defaults for null and junk', () => {
    expect(parsePersisted(null)).toEqual(DEFAULT_STATE);
    expect(parsePersisted('not json')).toEqual(DEFAULT_STATE);
    expect(parsePersisted('{"lang":"fr","progress":{"step":-1,"quizBest":9}}')).toEqual(DEFAULT_STATE);
  });
  it('keeps valid data', () => {
    const v = { lang: 'te', session: { email: 'a@b.co' }, progress: { step: 4, quizBest: 3, passed: false } };
    expect(parsePersisted(JSON.stringify(v))).toEqual(v);
  });
});
```

### 3.3 `__tests__/content.test.ts` (guards against broken content and missing audio)

```ts
import { lesson1 } from '../src/data/lesson';
import { audioMap } from '../src/data/audioMap';
import { strings } from '../src/i18n/strings';
import { LANGS, type L10n } from '../src/types';

function expectL10n(l: L10n, where: string) {
  for (const lang of LANGS) {
    if (typeof l?.[lang] !== 'string' || l[lang].trim() === '') throw new Error(`Missing ${lang} in ${where}`);
  }
}

describe('UI strings', () => {
  it('every key has te, en, hi', () => {
    for (const [k, v] of Object.entries(strings)) expectL10n(v, `strings.${k}`);
  });
});

describe('lesson1 content', () => {
  const audioIds = new Set(lesson1.audio.map((a) => a.id));

  it('has 15 phrases, 6 dialogue lines, 5 quiz questions', () => {
    expect(lesson1.phrases).toHaveLength(15);
    expect(lesson1.dialogue).toHaveLength(6);
    expect(lesson1.quiz).toHaveLength(5);
  });

  it('every text is trilingual', () => {
    expectL10n(lesson1.title, 'title');
    expectL10n(lesson1.subtitle, 'subtitle');
    expectL10n(lesson1.intro, 'intro');
    lesson1.phrases.forEach((p) => expectL10n(p.meaning, p.id));
    lesson1.dialogue.forEach((d) => expectL10n(d.meaning, d.id));
    expectL10n(lesson1.grammar.title, 'grammar.title');
    expectL10n(lesson1.grammar.body, 'grammar.body');
    lesson1.grammar.examples.forEach((e) => expectL10n(e.label, `grammar ${e.de}`));
    lesson1.pronunciation.forEach((p) => expectL10n(p.tip, `pron ${p.de}`));
    lesson1.quiz.forEach((q) => {
      expectL10n(q.prompt, q.id);
      q.options.forEach((o, i) => {
        if (o.text) expectL10n(o.text, `${q.id} option ${i}`);
        else expect(typeof o.de).toBe('string');
      });
    });
  });

  it('every referenced audio id exists in lesson.audio', () => {
    const refs = [
      ...lesson1.phrases.map((p) => p.id),
      ...lesson1.dialogue.map((d) => d.id),
      ...lesson1.grammar.examples.map((e) => e.audioId),
      ...lesson1.pronunciation.map((p) => p.audioId),
      ...lesson1.quiz.flatMap((q) => (q.audioId ? [q.audioId] : [])),
    ];
    for (const r of refs) expect(audioIds.has(r)).toBe(true);
  });

  it('every audio clip has a bundled file (and a slow file when slow=true)', () => {
    for (const a of lesson1.audio) {
      expect(audioMap).toHaveProperty(a.id);
      if (a.slow) expect(audioMap).toHaveProperty(`${a.id}_slow`);
    }
  });

  it('quiz correctIndex is in range', () => {
    for (const q of lesson1.quiz) {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.options.length);
    }
  });
});
```

**Verify (Phase 3):**
```bash
cd mobile && npx jest
```
All tests must pass. If a content test fails, **do not edit the content**: stop and report which item is broken.

Ship: run the PR loop in section G using this phase's row of the table.

---

## Phase 4: State, audio and shared UI

### 4.1 `src/theme.ts`

```ts
export const colors = {
  primary: '#1F2A60',
  accent: '#E85C5C',
  bg: '#FFFFFF',
  surface: '#F4F6FB',
  border: '#D9DEEA',
  text: '#1A1A1A',
  muted: '#5B6275',
  success: '#1E7B4F',
  successBg: '#E6F4EC',
  error: '#B3261E',
  errorBg: '#FCEBEA',
  white: '#FFFFFF',
};

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

// Telugu and Devanagari need generous line height so marks are not clipped.
export const type = {
  title: { fontSize: 24, lineHeight: 34, fontWeight: '700' as const, color: colors.text },
  heading: { fontSize: 20, lineHeight: 30, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 17, lineHeight: 27, color: colors.text },
  small: { fontSize: 14, lineHeight: 22, color: colors.muted },
  german: { fontSize: 30, lineHeight: 40, fontWeight: '700' as const, color: colors.primary },
};
```

### 4.2 `src/state/AppContext.tsx`

```tsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Lang } from '../types';
import type { OtpState } from '../logic/otp';
import { isPass } from '../logic/quiz';
import { DEFAULT_STATE, loadState, saveState, type Persisted, type Session } from './storage';

type AppCtx = {
  hydrated: boolean;
  lang: Lang; // always set; falls back to 'en' before the user chooses
  langChosen: boolean;
  session: Session | null;
  progress: Persisted['progress'];
  otp: OtpState | null;
  setLang: (l: Lang) => void;
  setSession: (s: Session | null) => void;
  setOtp: (o: OtpState | null) => void;
  saveStep: (step: number) => void;
  recordQuiz: (score: number) => void;
  logout: () => void;
};

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Persisted>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [otp, setOtp] = useState<OtpState | null>(null);

  useEffect(() => {
    let alive = true;
    loadState().then((s) => {
      if (!alive) return;
      setState(s);
      setHydrated(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Only save after loading, otherwise defaults would overwrite saved data.
  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const setLang = useCallback((lang: Lang) => setState((s) => ({ ...s, lang })), []);
  const setSession = useCallback((session: Session | null) => setState((s) => ({ ...s, session })), []);
  const saveStep = useCallback(
    (step: number) => setState((s) => (s.progress.step === step ? s : { ...s, progress: { ...s.progress, step } })),
    [],
  );
  const recordQuiz = useCallback(
    (score: number) =>
      setState((s) => ({
        ...s,
        progress: {
          ...s.progress,
          quizBest: Math.max(s.progress.quizBest, score),
          passed: s.progress.passed || isPass(score),
        },
      })),
    [],
  );
  const logout = useCallback(() => {
    setOtp(null);
    setState((s) => ({ ...s, session: null }));
  }, []);

  const value = useMemo<AppCtx>(
    () => ({
      hydrated,
      lang: state.lang ?? 'en',
      langChosen: state.lang !== null,
      session: state.session,
      progress: state.progress,
      otp,
      setLang,
      setSession,
      setOtp,
      saveStep,
      recordQuiz,
      logout,
    }),
    [hydrated, state, otp, setLang, setSession, saveStep, recordQuiz, logout],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}
```

### 4.3 `src/audio/AudioContext.tsx`

One audio player for the whole app (many players would overlap and leak).

```tsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { Alert } from 'react-native';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { audioMap, type AudioKey } from '../data/audioMap';
import { useApp } from '../state/AppContext';
import { t } from '../i18n/t';

type AudioCtx = { play: (audioId: string, slow?: boolean) => void };
const Ctx = createContext<AudioCtx | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const { lang } = useApp();
  const player = useAudioPlayer(audioMap.p01);
  const current = useRef<AudioKey>('p01');

  useEffect(() => {
    // Without this, iPhones on silent mode play nothing.
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  const play = useCallback(
    (audioId: string, slow = false) => {
      const key = (slow ? `${audioId}_slow` : audioId) as AudioKey;
      const source = audioMap[key];
      if (!source) {
        Alert.alert(t(lang, 'audioError'));
        return;
      }
      (async () => {
        try {
          if (current.current === key) {
            await player.seekTo(0);
          } else {
            player.replace(source);
            current.current = key;
          }
          player.play();
        } catch (e) {
          console.warn('audio error', e);
          Alert.alert(t(lang, 'audioError'));
        }
      })();
    },
    [player, lang],
  );

  const value = useMemo(() => ({ play }), [play]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAudio(): AudioCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAudio must be used inside AudioProvider');
  return v;
}
```

### 4.4 `src/components/AppButton.tsx`

```tsx
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, space } from '../theme';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  accessibilityLabel?: string;
};

export function AppButton({ title, onPress, variant = 'primary', disabled = false, accessibilityLabel }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.text, variant !== 'primary' && styles.textAlt]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 12,
    paddingHorizontal: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.sm,
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.white, borderWidth: 2, borderColor: colors.primary },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.8 },
  text: { color: colors.white, fontSize: 17, lineHeight: 26, fontWeight: '600' },
  textAlt: { color: colors.primary },
});
```

### 4.5 `src/components/LanguageSwitch.tsx`

```tsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../state/AppContext';
import type { Lang } from '../types';
import { colors } from '../theme';

const OPTIONS: { lang: Lang; label: string; a11y: string }[] = [
  { lang: 'te', label: 'తె', a11y: 'తెలుగు' },
  { lang: 'en', label: 'EN', a11y: 'English' },
  { lang: 'hi', label: 'हि', a11y: 'हिन्दी' },
];

export function LanguageSwitch() {
  const { lang, setLang } = useApp();
  return (
    <View style={styles.row}>
      {OPTIONS.map((o) => {
        const active = o.lang === lang;
        return (
          <Pressable
            key={o.lang}
            onPress={() => setLang(o.lang)}
            accessibilityRole="button"
            accessibilityLabel={o.a11y}
            accessibilityState={{ selected: active }}
            hitSlop={6}
            style={[styles.pill, active && styles.active]}
          >
            <Text style={[styles.text, active && styles.activeText]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4 },
  pill: {
    minWidth: 36,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 14, lineHeight: 20, color: colors.primary, fontWeight: '600' },
  activeText: { color: colors.white },
});
```

### 4.6 `src/components/AudioButtons.tsx`

```tsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAudio } from '../audio/AudioContext';
import { hasSlow } from '../data/lesson';
import { useApp } from '../state/AppContext';
import { t } from '../i18n/t';
import { colors, space } from '../theme';

export function AudioButtons({ audioId, german }: { audioId: string; german: string }) {
  const { play } = useAudio();
  const { lang } = useApp();
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => play(audioId)}
        accessibilityRole="button"
        accessibilityLabel={`${t(lang, 'play')}: ${german}`}
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
      >
        <Text style={styles.text}>🔊 {t(lang, 'play')}</Text>
      </Pressable>
      {hasSlow(audioId) && (
        <Pressable
          onPress={() => play(audioId, true)}
          accessibilityRole="button"
          accessibilityLabel={`${t(lang, 'playSlow')}: ${german}`}
          style={({ pressed }) => [styles.btn, styles.slow, pressed && styles.pressed]}
        >
          <Text style={[styles.text, styles.slowText]}>🐢 {t(lang, 'playSlow')}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.sm, marginTop: space.sm, flexWrap: 'wrap' },
  btn: {
    minHeight: 44,
    paddingHorizontal: space.md,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slow: { backgroundColor: colors.white, borderWidth: 2, borderColor: colors.primary },
  pressed: { opacity: 0.75 },
  text: { color: colors.white, fontSize: 16, lineHeight: 24, fontWeight: '600' },
  slowText: { color: colors.primary },
});
```

### 4.7 `src/components/Screen.tsx`

```tsx
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { colors, space } from '../theme';

export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.md, paddingBottom: space.xl * 2 },
});
```

**Verify (Phase 4):** `cd mobile && npx tsc --noEmit && npx jest`
Ship: run the PR loop in section G using this phase's row of the table.

---

## Phase 5: Screens (expo-router)

Create these files under `mobile/app/`.

### 5.1 `app/_layout.tsx`

```tsx
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from '../src/state/AppContext';
import { AudioProvider } from '../src/audio/AudioContext';
import { LanguageSwitch } from '../src/components/LanguageSwitch';
import { t } from '../src/i18n/t';
import { colors } from '../src/theme';

function AppStack() {
  const { lang } = useApp();
  return (
    <Stack
      screenOptions={{
        headerRight: () => <LanguageSwitch />,
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '700' },
        headerBackTitle: t(lang, 'back'),
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="language" options={{ title: t(lang, 'appName') }} />
      <Stack.Screen name="login/email" options={{ title: t(lang, 'appName') }} />
      <Stack.Screen name="login/otp" options={{ title: t(lang, 'appName') }} />
      <Stack.Screen
        name="home"
        options={{ title: t(lang, 'appName'), headerBackVisible: false, gestureEnabled: false }}
      />
      <Stack.Screen name="lesson" options={{ title: t(lang, 'lessonTitle') }} />
      <Stack.Screen name="quiz" options={{ title: t(lang, 'quizTitle') }} />
      <Stack.Screen
        name="result"
        options={{ title: t(lang, 'resultTitle'), headerBackVisible: false, gestureEnabled: false }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <AudioProvider>
        <StatusBar style="dark" />
        <AppStack />
      </AudioProvider>
    </AppProvider>
  );
}
```

### 5.2 `app/index.tsx` (launch gate)

```tsx
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useApp } from '../src/state/AppContext';
import { colors } from '../src/theme';

export default function Gate() {
  const { hydrated, langChosen, session } = useApp();
  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (!langChosen) return <Redirect href="/language" />;
  if (!session) return <Redirect href="/login/email" />;
  return <Redirect href="/home" />;
}
```

### 5.3 `app/language.tsx`

```tsx
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../src/components/Screen';
import { AppButton } from '../src/components/AppButton';
import { useApp } from '../src/state/AppContext';
import { t } from '../src/i18n/t';
import type { Lang } from '../src/types';
import { colors, space, type } from '../src/theme';

const CHOICES: { lang: Lang; name: string; sub: string }[] = [
  { lang: 'te', name: 'తెలుగు', sub: 'Telugu' },
  { lang: 'en', name: 'English', sub: 'English' },
  { lang: 'hi', name: 'हिन्दी', sub: 'Hindi' },
];

export default function LanguageScreen() {
  const { lang, langChosen, setLang, session } = useApp();
  return (
    <Screen>
      <Text style={type.title}>{t(lang, 'chooseLanguage')}</Text>
      <Text style={[type.small, { marginBottom: space.md }]}>{t(lang, 'chooseLanguageHint')}</Text>
      {CHOICES.map((c) => {
        const selected = langChosen && c.lang === lang;
        return (
          <Pressable
            key={c.lang}
            onPress={() => setLang(c.lang)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[styles.card, selected && styles.selected]}
          >
            <Text style={[type.heading, selected && styles.selectedText]}>{c.name}</Text>
            <Text style={[type.small, selected && styles.selectedText]}>{c.sub}</Text>
          </Pressable>
        );
      })}
      <AppButton
        title={t(lang, 'continue')}
        disabled={!langChosen}
        onPress={() => router.replace(session ? '/home' : '/login/email')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 14,
    padding: space.md,
    marginBottom: space.sm,
    backgroundColor: colors.surface,
  },
  selected: { borderColor: colors.primary, backgroundColor: colors.primary },
  selectedText: { color: colors.white },
});
```

### 5.4 `app/login/email.tsx`

```tsx
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { AppButton } from '../../src/components/AppButton';
import { useApp } from '../../src/state/AppContext';
import { createOtp, isValidEmail } from '../../src/logic/otp';
import { t } from '../../src/i18n/t';
import { colors, space, type } from '../../src/theme';

export default function EmailScreen() {
  const { lang, setOtp } = useApp();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const invalid = submitted && !isValidEmail(email);

  const onSend = () => {
    setSubmitted(true);
    if (!isValidEmail(email)) return;
    setOtp(createOtp(email, Date.now()));
    router.push('/login/otp');
  };

  return (
    <Screen>
      <Text style={type.title}>{t(lang, 'emailTitle')}</Text>
      <Text style={[type.small, { marginTop: space.md }]}>{t(lang, 'emailLabel')}</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        onSubmitEditing={onSend}
        placeholder="name@example.com"
        placeholderTextColor={colors.muted}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="send"
        accessibilityLabel={t(lang, 'emailLabel')}
        style={[styles.input, invalid && styles.inputError]}
      />
      {invalid && <Text style={styles.error}>{t(lang, 'emailInvalid')}</Text>}
      <AppButton title={t(lang, 'sendCode')} onPress={onSend} disabled={email.trim().length === 0} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: space.md,
    minHeight: 52,
    fontSize: 17,
    color: colors.text,
    marginTop: space.xs,
  },
  inputError: { borderColor: colors.error },
  error: { color: colors.error, fontSize: 15, lineHeight: 22, marginTop: space.xs },
});
```

### 5.5 `app/login/otp.tsx`

All hooks are called **before** any early return. Keep it that way.

```tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { AppButton } from '../../src/components/AppButton';
import { useApp } from '../../src/state/AppContext';
import { createOtp, resendSecondsLeft, verifyOtp, type VerifyReason } from '../../src/logic/otp';
import { t } from '../../src/i18n/t';
import { colors, space, type } from '../../src/theme';

export default function OtpScreen() {
  const { lang, otp, setOtp, setSession } = useApp();
  const [code, setCode] = useState('');
  const [reason, setReason] = useState<VerifyReason | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!otp) return <Redirect href="/login/email" />;

  const secondsLeft = resendSecondsLeft(otp, now);

  const errorText =
    reason === 'format'
      ? t(lang, 'otpInvalidFormat')
      : reason === 'wrong'
        ? t(lang, 'otpWrong', { n: otp.attemptsLeft })
        : reason === 'locked'
          ? t(lang, 'otpLocked')
          : reason === 'expired'
            ? t(lang, 'otpExpired')
            : null;

  const onVerify = () => {
    const { result, state } = verifyOtp(otp, code, Date.now());
    setOtp(state);
    if (result.ok) {
      setSession({ email: otp.email });
      router.replace('/home');
      return;
    }
    setReason(result.reason);
  };

  const onResend = () => {
    if (secondsLeft > 0) return;
    setOtp(createOtp(otp.email, Date.now()));
    setCode('');
    setReason(null);
  };

  return (
    <Screen>
      <Text style={type.title}>{t(lang, 'otpTitle')}</Text>
      <Text style={[type.body, { marginTop: space.xs }]}>{t(lang, 'otpSentTo', { email: otp.email })}</Text>
      <View style={styles.hint}>
        <Text style={styles.hintText}>{t(lang, 'otpDemoHint')}</Text>
      </View>
      <TextInput
        value={code}
        onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
        onSubmitEditing={onVerify}
        keyboardType="number-pad"
        maxLength={6}
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        accessibilityLabel={t(lang, 'otpTitle')}
        editable={!otp.locked}
        style={[styles.input, errorText !== null && styles.inputError]}
      />
      {errorText && <Text style={styles.error}>{errorText}</Text>}
      <AppButton title={t(lang, 'verify')} onPress={onVerify} disabled={otp.locked || code.length === 0} />
      <AppButton
        title={secondsLeft > 0 ? t(lang, 'resendIn', { s: secondsLeft }) : t(lang, 'resend')}
        onPress={onResend}
        disabled={secondsLeft > 0}
        variant="secondary"
      />
      <AppButton title={t(lang, 'changeEmail')} onPress={() => router.back()} variant="ghost" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: space.sm,
    marginTop: space.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  hintText: { fontSize: 15, lineHeight: 22, color: colors.text, fontWeight: '600' },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    minHeight: 56,
    fontSize: 26,
    letterSpacing: 8,
    textAlign: 'center',
    color: colors.text,
    marginTop: space.md,
  },
  inputError: { borderColor: colors.error },
  error: { color: colors.error, fontSize: 15, lineHeight: 22, marginTop: space.xs },
});
```

### 5.6 `app/home.tsx`

```tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../src/components/Screen';
import { AppButton } from '../src/components/AppButton';
import { useApp } from '../src/state/AppContext';
import { lesson1 } from '../src/data/lesson';
import { buildSteps } from '../src/logic/steps';
import { pick, t } from '../src/i18n/t';
import { colors, space, type } from '../src/theme';

const TOTAL_STEPS = buildSteps(lesson1).length;

export default function Home() {
  const { lang, session, progress, saveStep, logout } = useApp();
  const percent = progress.passed ? 100 : Math.round((progress.step / TOTAL_STEPS) * 100);
  const label = progress.passed ? t(lang, 'review') : progress.step > 0 ? t(lang, 'resume') : t(lang, 'start');

  const open = () => {
    if (progress.passed) saveStep(0);
    router.push('/lesson');
  };

  return (
    <Screen>
      <Text style={type.title}>{t(lang, 'welcome')}</Text>
      {session && <Text style={type.small}>{session.email}</Text>}

      <View style={styles.card}>
        <Text style={styles.level}>{t(lang, 'levelA1')}</Text>
        <Text style={type.heading}>{pick(lesson1.title, lang)}</Text>
        <Text style={type.body}>{pick(lesson1.subtitle, lang)}</Text>

        <View style={styles.barTrack} accessibilityLabel={t(lang, 'progress', { p: percent })}>
          <View style={[styles.barFill, { width: `${percent}%` }]} />
        </View>
        <Text style={type.small}>{t(lang, 'progress', { p: percent })}</Text>
        {progress.quizBest > 0 && <Text style={type.small}>{t(lang, 'bestScore', { s: progress.quizBest })}</Text>}
        {progress.passed && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>✓ {t(lang, 'completed')}</Text>
          </View>
        )}
        <AppButton title={label} onPress={open} />
      </View>

      <AppButton
        title={t(lang, 'logout')}
        variant="ghost"
        onPress={() => {
          logout();
          router.replace('/login/email');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: space.md,
    marginTop: space.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  level: { color: colors.accent, fontWeight: '700', fontSize: 14, lineHeight: 22 },
  barTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    marginTop: space.md,
    marginBottom: space.xs,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: colors.success },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.successBg,
    borderRadius: 12,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    marginTop: space.sm,
  },
  badgeText: { color: colors.success, fontWeight: '700', fontSize: 14, lineHeight: 22 },
});
```

### 5.7 `app/lesson.tsx`

```tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../src/components/Screen';
import { AppButton } from '../src/components/AppButton';
import { AudioButtons } from '../src/components/AudioButtons';
import { useApp } from '../src/state/AppContext';
import { lesson1 } from '../src/data/lesson';
import { buildSteps, clampStep } from '../src/logic/steps';
import { pick, t } from '../src/i18n/t';
import type { Lang, Phrase } from '../src/types';
import { colors, space, type } from '../src/theme';

function PhraseCard({ phrase, lang, n, total }: { phrase: Phrase; lang: Lang; n: number; total: number }) {
  const [shown, setShown] = useState(false);
  return (
    <View>
      <Text style={type.small}>{t(lang, 'phrasesTitle', { n, total })}</Text>
      <View style={styles.card}>
        <Text style={type.german}>{phrase.de}</Text>
        <AudioButtons audioId={phrase.id} german={phrase.de} />
        {shown ? (
          <Text style={[type.heading, { marginTop: space.md }]}>{pick(phrase.meaning, lang)}</Text>
        ) : (
          <Pressable onPress={() => setShown(true)} accessibilityRole="button" style={styles.reveal}>
            <Text style={styles.revealText}>{t(lang, 'showMeaning')}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function LessonScreen() {
  const { lang, progress, saveStep } = useApp();
  const steps = useMemo(() => buildSteps(lesson1), []);
  const [idx, setIdx] = useState(() => clampStep(progress.step, steps.length));

  useEffect(() => {
    saveStep(idx);
  }, [idx, saveStep]);

  const step = steps[idx];
  const isLast = idx === steps.length - 1;

  let body: React.ReactNode = null;
  if (step.kind === 'intro') {
    body = (
      <View>
        <Text style={type.title}>{pick(lesson1.title, lang)}</Text>
        <Text style={[type.heading, { marginTop: space.md }]}>{t(lang, 'introTitle')}</Text>
        <Text style={type.body}>{pick(lesson1.intro, lang)}</Text>
      </View>
    );
  } else if (step.kind === 'phrase') {
    const phrase = lesson1.phrases[step.index];
    // key resets the "show meaning" state for each new card
    body = (
      <PhraseCard key={phrase.id} phrase={phrase} lang={lang} n={step.index + 1} total={lesson1.phrases.length} />
    );
  } else if (step.kind === 'dialogue') {
    body = (
      <View>
        <Text style={type.heading}>{t(lang, 'dialogueTitle')}</Text>
        {lesson1.dialogue.map((line) => {
          const isRavi = line.speaker === 'Ravi';
          return (
            <View key={line.id} style={[styles.bubble, isRavi ? styles.bubbleRight : styles.bubbleLeft]}>
              <Text style={styles.speaker}>{line.speaker}</Text>
              <Text style={[type.body, { fontWeight: '700', color: colors.primary }]}>{line.de}</Text>
              <Text style={type.small}>{pick(line.meaning, lang)}</Text>
              <AudioButtons audioId={line.id} german={line.de} />
            </View>
          );
        })}
      </View>
    );
  } else if (step.kind === 'grammar') {
    body = (
      <View>
        <Text style={type.heading}>{pick(lesson1.grammar.title, lang)}</Text>
        <Text style={[type.body, { marginTop: space.sm }]}>{pick(lesson1.grammar.body, lang)}</Text>
        {lesson1.grammar.examples.map((ex) => (
          <View key={ex.audioId} style={styles.card}>
            <Text style={styles.speaker}>{pick(ex.label, lang)}</Text>
            <Text style={type.german}>{ex.de}</Text>
            <AudioButtons audioId={ex.audioId} german={ex.de} />
          </View>
        ))}
      </View>
    );
  } else {
    body = (
      <View>
        <Text style={type.heading}>{t(lang, 'pronTitle')}</Text>
        {lesson1.pronunciation.map((p) => (
          <View key={p.audioId + p.focus} style={styles.card}>
            <Text style={styles.focus}>{p.focus}</Text>
            <Text style={type.german}>{p.de}</Text>
            <Text style={type.body}>{pick(p.tip, lang)}</Text>
            <AudioButtons audioId={p.audioId} german={p.de} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <Screen>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${((idx + 1) / steps.length) * 100}%` }]} />
      </View>
      {body}
      <View style={styles.nav}>
        <View style={styles.navItem}>
          <AppButton
            title={t(lang, 'back')}
            variant="secondary"
            disabled={idx === 0}
            onPress={() => setIdx((i) => Math.max(0, i - 1))}
          />
        </View>
        <View style={styles.navItem}>
          <AppButton
            title={isLast ? t(lang, 'startQuiz') : t(lang, 'next')}
            onPress={() => (isLast ? router.push('/quiz') : setIdx((i) => Math.min(steps.length - 1, i + 1)))}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  barTrack: { height: 6, borderRadius: 3, backgroundColor: colors.border, marginBottom: space.md, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.accent },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: space.md,
    marginTop: space.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reveal: {
    marginTop: space.md,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealText: { fontSize: 16, lineHeight: 24, color: colors.muted, fontWeight: '600' },
  bubble: { borderRadius: 14, padding: space.sm, marginTop: space.sm, maxWidth: '92%' },
  bubbleLeft: { alignSelf: 'flex-start', backgroundColor: colors.surface },
  bubbleRight: { alignSelf: 'flex-end', backgroundColor: '#EEF1FF' },
  speaker: { fontSize: 13, lineHeight: 20, fontWeight: '700', color: colors.accent },
  focus: { fontSize: 32, lineHeight: 40, fontWeight: '700', color: colors.accent },
  nav: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },
  navItem: { flex: 1 },
});
```

### 5.8 `app/quiz.tsx`

```tsx
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../src/components/Screen';
import { AppButton } from '../src/components/AppButton';
import { AudioButtons } from '../src/components/AudioButtons';
import { useApp } from '../src/state/AppContext';
import { lesson1 } from '../src/data/lesson';
import { scoreQuiz } from '../src/logic/quiz';
import { pick, t } from '../src/i18n/t';
import type { Lang, QuizOption } from '../src/types';
import { colors, space, type } from '../src/theme';

function optionLabel(o: QuizOption, lang: Lang): string {
  return o.text ? pick(o.text, lang) : (o.de ?? '');
}

export default function QuizScreen() {
  const { lang, recordQuiz } = useApp();
  const questions = lesson1.quiz;
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));

  const q = questions[qi];
  const isLast = qi === questions.length - 1;
  const isCorrect = checked && selected === q.correctIndex;

  const onCheck = () => {
    if (selected === null) return;
    setAnswers((a) => a.map((v, i) => (i === qi ? selected : v)));
    setChecked(true);
  };

  const onNext = () => {
    if (isLast) {
      const finalAnswers = answers.map((v, i) => (i === qi ? selected : v));
      const score = scoreQuiz(finalAnswers, questions);
      recordQuiz(score);
      router.replace({ pathname: '/result', params: { score: String(score) } });
      return;
    }
    setQi((i) => i + 1);
    setSelected(null);
    setChecked(false);
  };

  return (
    <Screen>
      <Text style={type.small}>{t(lang, 'questionOf', { n: qi + 1, total: questions.length })}</Text>
      <Text style={[type.heading, { marginTop: space.xs }]}>{pick(q.prompt, lang)}</Text>
      {q.audioId && <AudioButtons audioId={q.audioId} german="?" />}

      <View style={{ marginTop: space.md }}>
        {q.options.map((o, i) => {
          const isSel = selected === i;
          const showRight = checked && i === q.correctIndex;
          const showWrong = checked && isSel && i !== q.correctIndex;
          return (
            <Pressable
              key={`${q.id}-${i}`}
              disabled={checked}
              onPress={() => setSelected(i)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSel, disabled: checked }}
              style={[
                styles.option,
                isSel && styles.optionSel,
                showRight && styles.optionRight,
                showWrong && styles.optionWrong,
              ]}
            >
              <Text style={[type.body, o.de && !o.text ? styles.germanOpt : null]}>{optionLabel(o, lang)}</Text>
            </Pressable>
          );
        })}
      </View>

      {checked && (
        <Text style={[styles.feedback, { color: isCorrect ? colors.success : colors.error }]}>
          {isCorrect
            ? t(lang, 'correct')
            : t(lang, 'incorrect', { answer: optionLabel(q.options[q.correctIndex], lang) })}
        </Text>
      )}

      {!checked ? (
        <AppButton title={t(lang, 'check')} onPress={onCheck} disabled={selected === null} />
      ) : (
        <AppButton title={isLast ? t(lang, 'seeResult') : t(lang, 'next')} onPress={onNext} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  option: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: space.md,
    marginBottom: space.sm,
    backgroundColor: colors.white,
    minHeight: 52,
    justifyContent: 'center',
  },
  optionSel: { borderColor: colors.primary, backgroundColor: colors.surface },
  optionRight: { borderColor: colors.success, backgroundColor: colors.successBg },
  optionWrong: { borderColor: colors.error, backgroundColor: colors.errorBg },
  germanOpt: { fontWeight: '700', color: colors.primary },
  feedback: { fontSize: 17, lineHeight: 26, fontWeight: '700', marginTop: space.sm },
});
```

### 5.9 `app/result.tsx`

```tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '../src/components/Screen';
import { AppButton } from '../src/components/AppButton';
import { useApp } from '../src/state/AppContext';
import { isPass } from '../src/logic/quiz';
import { t } from '../src/i18n/t';
import { colors, space, type } from '../src/theme';

export default function ResultScreen() {
  const { lang } = useApp();
  const params = useLocalSearchParams<{ score?: string }>();
  const parsed = Number.parseInt(String(params.score ?? '0'), 10);
  const score = Number.isFinite(parsed) ? Math.min(5, Math.max(0, parsed)) : 0;
  const passed = isPass(score);

  return (
    <Screen>
      <View style={[styles.box, { backgroundColor: passed ? colors.successBg : colors.errorBg }]}>
        <Text style={styles.emoji}>{passed ? '🎉' : '💪'}</Text>
        <Text style={[type.title, { textAlign: 'center' }]}>{t(lang, 'score', { score })}</Text>
        <Text style={[type.body, { textAlign: 'center', marginTop: space.sm }]}>
          {passed ? t(lang, 'resultPass') : t(lang, 'resultFail')}
        </Text>
      </View>
      {!passed && <AppButton title={t(lang, 'retry')} onPress={() => router.replace('/quiz')} />}
      <AppButton
        title={t(lang, 'backHome')}
        variant={passed ? 'primary' : 'secondary'}
        onPress={() => router.dismissTo('/home')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 16, padding: space.lg, alignItems: 'center', marginTop: space.lg },
  emoji: { fontSize: 48, lineHeight: 60 },
});
```

> If `router.dismissTo` is reported as not existing by `tsc` (older expo-router), replace that one call with `router.replace('/home')`. Change nothing else.

**Verify (Phase 5):**
```bash
cd mobile
npx tsc --noEmit
npx jest
npx expo-doctor
npx expo export --platform all --output-dir .export-check && rm -rf .export-check
```
`expo export` bundles the app for iOS and Android without a phone. It must finish with no errors; it catches missing files and bad imports. Warnings from `expo-doctor` about versions must be fixed with `npx expo install --fix`; anything else, report.

Ship: run the PR loop in section G using this phase's row of the table.

---

## Phase 6: Run it and hand over

```bash
cd mobile && npx expo start
```

Tell the human: "Scan the QR code with the Expo Go app (Android) or the Camera app (iOS). Phone and laptop must be on the same Wi-Fi. If it does not connect, run `npx expo start --tunnel`."

Haiku cannot hold a phone. Hand the human the checklist in section 7 and stop.

No PR for Phase 6: it changes no files.

---

## 7. Acceptance checklist (human, on a real Android phone and a real iPhone)

**First launch**
- [ ] App opens on the language picker. Continue is disabled until a language is tapped.
- [ ] Choosing తెలుగు shows Telugu text with no clipped vowel marks (check ి ీ ు ూ ె). Repeat for हिन्दी (check ि ी ु and the top bar).

**Login (mock)**
- [ ] Empty email: Send code is disabled. `ravi@` shows the invalid-email message.
- [ ] Valid email opens the OTP screen and shows the email in lower case.
- [ ] `12345` shows "must be 6 digits" and does not use an attempt.
- [ ] `000000` shows "Wrong code. 4 attempts left". After 5 wrong codes: locked message, Verify disabled, input disabled.
- [ ] Resend shows a 30 s countdown, then is enabled. Tapping it clears the lock.
- [ ] `123456` goes to Home. Swiping back does not return to the OTP screen.

**Language switch**
- [ ] Tapping తె / EN / हि in the header changes every text on every screen immediately, including button labels and the quiz.

**Lesson**
- [ ] 🔊 plays natural German audio. 🐢 plays it slower. Tapping 🔊 twice replays from the start, with no overlapping sound.
- [ ] **iPhone with the silent switch ON still plays audio.**
- [ ] "Show meaning" hides again on the next card.
- [ ] Dialogue: Ravi has a male voice and Frau Müller a female voice.
- [ ] Close the app mid-lesson, reopen: Home shows progress and "Continue lesson" opens the same card.

**Quiz and result**
- [ ] Check is disabled until an option is chosen. After Check, the correct option is green and a wrong choice is red.
- [ ] 5/5 or 4/5 shows the pass screen. Home then shows ✓ Completed, 100% and the best score.
- [ ] 3/5 or lower shows the fail screen with Try again, which restarts the quiz at question 1.

**Persistence and logout**
- [ ] Kill and reopen the app: it goes straight to Home with the same language.
- [ ] Log out goes to the email screen. Progress is kept after logging in again.
- [ ] Airplane mode: everything, including audio, still works.

---

## 8. Known limits (say these out loud in the demo)

- Login is a mock: no email is sent and `123456` always works.
- Telugu and Hindi text are drafts and need native-speaker proofreading.
- The audio is Google Cloud text-to-speech, not human recordings.
- There is one lesson, no AI tutor, no backend and no certificate.
