# Audio setup (one time, about 15 minutes)

This turns the German text in `content/lesson1.json` into 42 MP3 files using Google Cloud text-to-speech. You do it once; then Haiku builds the app from `docs/02-poc-build-plan.md`.

## 1. Get a Google Cloud API key

1. Go to https://console.cloud.google.com and sign in.
2. Create a project, for example `tomcom-german-poc`. Billing must be enabled on the project, but this lesson (about 1,000 characters) is well inside the free tier.
3. Open **APIs & Services → Library**, search for **Cloud Text-to-Speech API** and click **Enable**.
4. Open **APIs & Services → Credentials → Create credentials → API key**.
5. Click the new key → **API restrictions → Restrict key → Cloud Text-to-Speech API** → Save. This means a leaked key can do nothing else.

## 2. Put the key in `.env`

From the project folder:

```bash
cp .env.example .env
```

Open `.env` and paste the key after `GOOGLE_TTS_API_KEY=`. `.env` is git-ignored; never commit it or paste it in chat.

## 3. Generate the audio

```bash
node tools/generate-audio.mjs
```

You should see `Voices: female=de-DE-Chirp3-HD-..., male=de-DE-Chirp3-HD-...`, then 42 `ok` lines, then `DONE`.

- **Re-running** skips files that already exist. To regenerate everything, for example after changing a voice: `node tools/generate-audio.mjs --force`.
- **Want different voices?** Listen to the files in `generated/audio/`. To change one, set `TTS_VOICE_FEMALE` / `TTS_VOICE_MALE` in `.env` (the voice names are printed by the run and saved in `generated/voices.json`), then run with `--force`.
- **A slow clip fails on the premium voice:** the script retries it automatically with a Neural2 voice of the same gender and logs that.

## 4. Check, then hand over

```bash
ls generated/audio/*.mp3 | wc -l   # 42
```

Play a few files, especially `d02.mp3` (Ravi, male) and `p02_slow.mp3`. If they sound right, give Haiku `docs/02-poc-build-plan.md`.

## Errors

| Message | Fix |
|---|---|
| `GOOGLE_TTS_API_KEY is missing` | Step 2 |
| `Could not list voices (API key not valid)` | Wrong key, or a restriction that excludes Text-to-Speech |
| `... has not been used in project ... or it is disabled` | Step 1.3: enable the API and wait 2 minutes |
| `billing` in the error | Enable billing on the project (usage stays free) |
| `voice "X" from .env is not available` | Remove or fix the voice name in `.env` |
