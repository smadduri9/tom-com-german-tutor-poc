#!/usr/bin/env node
// Generates German MP3 clips for the POC with ElevenLabs text-to-speech.
// Reads content/lessons/A1/greetings.json -> writes generated/audio/*.mp3 and generated/audioMap.ts,
// then copies both into the mobile app (mobile/assets/audio, mobile/src/data/audioMap.ts).
// Usage: node tools/generate-audio.mjs [--force] [--dry-run]
// Needs Node 18+ (built-in fetch). No npm packages.

import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LESSON_PATH = join(ROOT, 'content', 'lessons', 'A1', 'greetings.json');
const OUT_DIR = join(ROOT, 'generated', 'audio');
const MAP_PATH = join(ROOT, 'generated', 'audioMap.ts');
const VOICES_PATH = join(ROOT, 'generated', 'voices.json');
const APP_AUDIO_DIR = join(ROOT, 'mobile', 'assets', 'audio');
const APP_MAP_PATH = join(ROOT, 'mobile', 'src', 'data', 'audioMap.ts');
const API = 'https://api.elevenlabs.io/v1';
const MODEL = 'eleven_multilingual_v2';
// ElevenLabs speed range is 0.7-1.2; 1.0 is the voice's natural pace.
const NORMAL_SPEED = 0.9;
const SLOW_SPEED = 0.7;
// Premade voices with German support; they work on the free plan.
// Native German library voices need a paid plan: set ELEVEN_VOICE_FEMALE / ELEVEN_VOICE_MALE in .env.
const DEFAULT_VOICES = { female: 'XrExE9yKIg1WjnnlVkGX', male: 'cjVigY5qzO86Huf0OWal' };

const args = new Set(process.argv.slice(2));
const FORCE = args.has('--force');
const DRY = args.has('--dry-run');

function loadEnv() {
  const envPath = join(ROOT, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

function fail(msg) {
  console.error(`\nERROR: ${msg}\n`);
  process.exit(1);
}

async function synth(text, voiceId, speed) {
  const res = await fetch(`${API}/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'xi-api-key': process.env.ELEVENLABS_API_KEY },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0, use_speaker_boost: true, speed },
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  loadEnv();
  const lesson = JSON.parse(readFileSync(LESSON_PATH, 'utf8'));
  const items = lesson.audio;

  // Validate the content before spending any API calls.
  const ids = new Set();
  for (const a of items) {
    if (!/^[a-z]+\d+$/.test(a.id)) fail(`Bad audio id "${a.id}"`);
    if (ids.has(a.id)) fail(`Duplicate audio id "${a.id}"`);
    if (!a.text?.trim()) fail(`Empty text for "${a.id}"`);
    if (!['female', 'male'].includes(a.voice)) fail(`Bad voice for "${a.id}"`);
    ids.add(a.id);
  }
  const jobs = items.flatMap((a) => [
    { file: `${a.id}.mp3`, key: a.id, text: a.text, voice: a.voice, speed: NORMAL_SPEED },
    ...(a.slow ? [{ file: `${a.id}_slow.mp3`, key: `${a.id}_slow`, text: a.text, voice: a.voice, speed: SLOW_SPEED }] : []),
  ]);
  console.log(`Lesson has ${items.length} audio items -> ${jobs.length} MP3 files.`);

  mkdirSync(OUT_DIR, { recursive: true });

  if (!DRY) {
    if (!process.env.ELEVENLABS_API_KEY) fail('ELEVENLABS_API_KEY is missing. Copy .env.example to .env and paste your key.');
    const chosen = {
      female: process.env.ELEVEN_VOICE_FEMALE || DEFAULT_VOICES.female,
      male: process.env.ELEVEN_VOICE_MALE || DEFAULT_VOICES.male,
    };
    console.log(`Voices: female=${chosen.female}, male=${chosen.male}`);

    let made = 0;
    let skipped = 0;
    const failures = [];
    for (const j of jobs) {
      const out = join(OUT_DIR, j.file);
      if (existsSync(out) && !FORCE) {
        skipped++;
        continue;
      }
      try {
        writeFileSync(out, await synth(j.text, chosen[j.voice], j.speed));
        made++;
        console.log(`  ok  ${j.file}`);
      } catch (e) {
        failures.push(`${j.file}: ${e.message}`);
        console.error(`  ERR ${j.file}: ${e.message}`);
      }
      await new Promise((r) => setTimeout(r, 150));
    }
    writeFileSync(VOICES_PATH, JSON.stringify({ provider: 'elevenlabs', model: MODEL, chosen }, null, 2) + '\n');
    console.log(`\nGenerated ${made}, skipped ${skipped} existing, failed ${failures.length}.`);
    if (failures.length) fail(`Some files failed:\n  ${failures.join('\n  ')}\nFix and re-run (existing files are kept).`);
  }

  // The app needs static require() calls, so we generate them here.
  const missing = jobs.filter((j) => !DRY && !existsSync(join(OUT_DIR, j.file)));
  if (missing.length) fail(`Missing files: ${missing.map((m) => m.file).join(', ')}`);
  const lines = jobs.map((j) => `  ${JSON.stringify(j.key)}: require('../../assets/audio/${j.file}'),`);
  const ts =
    '// AUTO-GENERATED by tools/generate-audio.mjs. Do not edit by hand.\n' +
    'export const audioMap = {\n' +
    lines.join('\n') +
    '\n} as const;\n\n' +
    'export type AudioKey = keyof typeof audioMap;\n';
  writeFileSync(MAP_PATH, ts);
  console.log(`Wrote ${MAP_PATH}${DRY ? ' (dry run, no audio generated)' : ''}`);

  if (!DRY) {
    // Replace the app's clips so no stale files from an older provider stay bundled.
    mkdirSync(APP_AUDIO_DIR, { recursive: true });
    for (const f of readdirSync(APP_AUDIO_DIR)) rmSync(join(APP_AUDIO_DIR, f));
    for (const j of jobs) copyFileSync(join(OUT_DIR, j.file), join(APP_AUDIO_DIR, j.file));
    copyFileSync(MAP_PATH, APP_MAP_PATH);
    console.log(`Copied ${jobs.length} clips and audioMap.ts into the mobile app.`);
  }
  console.log('\nDONE.');
}

main().catch((e) => fail(e.stack || e.message));
