#!/usr/bin/env node
// Generates German MP3s for the POC with Google Cloud Text-to-Speech.
// Reads content/lesson1.json -> writes generated/audio/*.mp3 and generated/audioMap.ts.
// Usage: node tools/generate-audio.mjs [--force] [--dry-run]
// Needs Node 18+ (built-in fetch). No npm packages.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LESSON_PATH = join(ROOT, 'content', 'lesson1.json');
const OUT_DIR = join(ROOT, 'generated', 'audio');
const MAP_PATH = join(ROOT, 'generated', 'audioMap.ts');
const VOICES_PATH = join(ROOT, 'generated', 'voices.json');
const API = 'https://texttospeech.googleapis.com/v1';
const SLOW_RATE = 0.75;

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

async function api(path, body) {
  const key = process.env.GOOGLE_TTS_API_KEY;
  const url = `${API}${path}${path.includes('?') ? '&' : '?'}key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json?.error?.message || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return json;
}

// Preference order: Chirp3-HD (most natural) > Neural2 > WaveNet > anything.
function rankVoices(voices, gender) {
  const tier = (n) => (n.includes('Chirp3-HD') ? 0 : n.includes('Neural2') ? 1 : n.includes('Wavenet') ? 2 : 3);
  return voices
    .filter((v) => v.languageCodes.includes('de-DE') && v.ssmlGender === gender)
    .sort((a, b) => tier(a.name) - tier(b.name) || a.name.localeCompare(b.name))
    .map((v) => v.name);
}

function pickVoice(ranked, envName, label) {
  if (envName) {
    if (!ranked.includes(envName)) fail(`${label} voice "${envName}" from .env is not available for de-DE.`);
    return envName;
  }
  if (!ranked.length) fail(`No de-DE ${label} voice found.`);
  return ranked[0];
}

async function synth(text, voiceName, rate) {
  const json = await api('/text:synthesize', {
    input: { text },
    voice: { languageCode: 'de-DE', name: voiceName },
    audioConfig: { audioEncoding: 'MP3', speakingRate: rate, sampleRateHertz: 24000 },
  });
  if (!json.audioContent) throw new Error('Empty audioContent');
  return Buffer.from(json.audioContent, 'base64');
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
    { file: `${a.id}.mp3`, key: a.id, text: a.text, voice: a.voice, rate: 1.0 },
    ...(a.slow ? [{ file: `${a.id}_slow.mp3`, key: `${a.id}_slow`, text: a.text, voice: a.voice, rate: SLOW_RATE }] : []),
  ]);
  console.log(`Lesson has ${items.length} audio items -> ${jobs.length} MP3 files.`);

  mkdirSync(OUT_DIR, { recursive: true });

  if (!DRY) {
    if (!process.env.GOOGLE_TTS_API_KEY) fail('GOOGLE_TTS_API_KEY is missing. Copy .env.example to .env and paste your key.');
    const { voices = [] } = await api('/voices?languageCode=de-DE').catch((e) =>
      fail(`Could not list voices (${e.message}). Check the key and that the Text-to-Speech API is enabled.`),
    );
    const female = rankVoices(voices, 'FEMALE');
    const male = rankVoices(voices, 'MALE');
    const chosen = {
      female: pickVoice(female, process.env.TTS_VOICE_FEMALE, 'female'),
      male: pickVoice(male, process.env.TTS_VOICE_MALE, 'male'),
    };
    // Fallback for slow clips if the premium voice rejects speakingRate.
    const fallback = {
      female: female.find((n) => !n.includes('Chirp')) ?? chosen.female,
      male: male.find((n) => !n.includes('Chirp')) ?? chosen.male,
    };
    console.log(`Voices: female=${chosen.female}, male=${chosen.male}`);

    const used = {};
    let made = 0;
    let skipped = 0;
    const failures = [];
    for (const j of jobs) {
      const out = join(OUT_DIR, j.file);
      if (existsSync(out) && !FORCE) {
        skipped++;
        continue;
      }
      let voice = chosen[j.voice];
      try {
        let buf;
        try {
          buf = await synth(j.text, voice, j.rate);
        } catch (e) {
          if (j.rate === 1.0 || voice === fallback[j.voice]) throw e;
          voice = fallback[j.voice];
          console.warn(`  ${j.file}: retrying slow clip with ${voice} (${e.message})`);
          buf = await synth(j.text, voice, j.rate);
        }
        writeFileSync(out, buf);
        used[j.key] = voice;
        made++;
        console.log(`  ok  ${j.file}  (${voice})`);
      } catch (e) {
        failures.push(`${j.file}: ${e.message}`);
        console.error(`  ERR ${j.file}: ${e.message}`);
      }
      await new Promise((r) => setTimeout(r, 150));
    }
    writeFileSync(VOICES_PATH, JSON.stringify({ chosen, used }, null, 2) + '\n');
    console.log(`\nGenerated ${made}, skipped ${skipped} existing, failed ${failures.length}.`);
    if (failures.length) fail(`Some files failed:\n  ${failures.join('\n  ')}\nFix and re-run (existing files are kept).`);
  }

  // The app needs static require() calls, so we generate them here.
  const missing = jobs.filter((j) => !DRY && !existsSync(join(OUT_DIR, j.file)));
  if (missing.length) fail(`Missing files: ${missing.map((m) => m.file).join(', ')}`);
  const lines = jobs.map((j) => `  ${JSON.stringify(j.key)}: require('../../assets/audio/${j.file}'),`);
  const ts =
    '// AUTO-GENERATED by tools/generate-audio.mjs. Do not edit by hand.\n' +
    '// Copied into mobile/src/data/audioMap.ts by the build plan.\n' +
    'export const audioMap = {\n' +
    lines.join('\n') +
    '\n} as const;\n\n' +
    'export type AudioKey = keyof typeof audioMap;\n';
  writeFileSync(MAP_PATH, ts);
  console.log(`Wrote ${MAP_PATH}${DRY ? ' (dry run, no audio generated)' : ''}`);
  console.log('\nDONE. Next: hand docs/02-poc-build-plan.md to Haiku.');
}

main().catch((e) => fail(e.stack || e.message));
