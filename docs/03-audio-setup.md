# Audio setup

The German clips in `content/lesson1.json` are turned into 42 MP3 files with ElevenLabs text-to-speech (`eleven_multilingual_v2`). The generator also copies them into the app.

## 1. Key

1. Sign in at https://elevenlabs.io → **Developers → API keys** → create a key.
2. `cp .env.example .env` and paste it after `ELEVENLABS_API_KEY=`. `.env` is git-ignored; never commit it.

The free plan works for generating (the lesson is about 1,500 characters including slow clips), but it requires attribution and does not allow commercial use. Use a paid plan before showing this to a client commercially.

## 2. Generate

```bash
node tools/generate-audio.mjs
```

This writes `generated/audio/*.mp3` and `generated/audioMap.ts`, then replaces `mobile/assets/audio/` and `mobile/src/data/audioMap.ts`.

- **Re-running** skips clips that already exist. Regenerate everything with `--force`.
- **Speed:** normal clips use speed 0.9, slow clips 0.7 (the ElevenLabs minimum). Change `NORMAL_SPEED` / `SLOW_SPEED` in the script.
- **Voices:** defaults are premade voices with German support (Matilda, Eric). Native German voices from the ElevenLabs library (for example Susi and Ben, ids in `.env.example`) need a paid plan; set `ELEVEN_VOICE_FEMALE` / `ELEVEN_VOICE_MALE` and run with `--force`.
- **Compare providers or voices:** `node tools/compare-tts.mjs` builds `compare/index.html` with clips side by side.

## Errors

| Message | Fix |
|---|---|
| `ELEVENLABS_API_KEY is missing` | Step 1 |
| `HTTP 401` | Wrong or revoked key |
| `HTTP 402 ... paid_plan_required` | Library voice on the free plan: use a premade voice or upgrade |
| `HTTP 429` | Rate limited or out of characters this month; wait or upgrade |
