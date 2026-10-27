#!/usr/bin/env node
// Generates ElevenLabs versions of a few lesson clips and a page to compare them with the Google clips.
// Reads content/lessons/A1/greetings.json + generated/audio/*.wav -> writes compare/ (audio + index.html).
// Usage: node tools/compare-tts.mjs [--force]
// Needs ELEVENLABS_API_KEY in .env. Optional: ELEVEN_VOICE_FEMALE / ELEVEN_VOICE_MALE (voice ids).

import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LESSON_PATH = join(ROOT, 'content', 'lessons', 'A1', 'greetings.json');
const GOOGLE_DIR = join(ROOT, 'generated', 'audio');
const OUT_DIR = join(ROOT, 'compare');
const API = 'https://api.elevenlabs.io/v1';
const MODEL = 'eleven_multilingual_v2';
// ElevenLabs speed range is 0.7-1.2; 1.0 is the voice's natural pace.
const NORMAL_SPEED = 0.9;
const SLOW_SPEED = 0.7;
// Native German voices from the ElevenLabs voice library.
const VOICES = { female: 'v3V1d2rk6528UrLKRuy8', male: 'aTTiK3YzK3dXETpuDE2h' };
// Premade multilingual voices (German verified) if library voices are not allowed on this plan.
const FALLBACK = { female: 'XrExE9yKIg1WjnnlVkGX', male: 'cjVigY5qzO86Huf0OWal' };

// Two clips per part of the lesson.
const SECTIONS = [
  { title: 'Single words', ids: ['p01', 'p05'] },
  { title: 'Phrases', ids: ['p12', 'p13'] },
  { title: 'Conversation', ids: ['d02', 'd03'] },
  { title: 'Grammar (formal / informal)', ids: ['p10', 'g01'] },
  { title: 'Pronunciation', ids: ['pr01', 'pr02'] },
  { title: 'Quiz', ids: ['p02', 'p04'] },
];

const FORCE = process.argv.includes('--force');

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
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
  return Buffer.from(await res.arrayBuffer());
}

function esc(s) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

async function main() {
  loadEnv();
  if (!process.env.ELEVENLABS_API_KEY) fail('ELEVENLABS_API_KEY is missing in .env.');
  const lesson = JSON.parse(readFileSync(LESSON_PATH, 'utf8'));
  const byId = Object.fromEntries(lesson.audio.map((a) => [a.id, a]));
  mkdirSync(join(OUT_DIR, 'google'), { recursive: true });
  mkdirSync(join(OUT_DIR, 'eleven'), { recursive: true });

  // Remember which voices made the cached clips, so a re-run without --force labels them correctly.
  const usedPath = join(OUT_DIR, 'voices.json');
  const voices =
    !FORCE && existsSync(usedPath)
      ? JSON.parse(readFileSync(usedPath, 'utf8'))
      : { female: process.env.ELEVEN_VOICE_FEMALE || VOICES.female, male: process.env.ELEVEN_VOICE_MALE || VOICES.male };
  const rows = [];
  for (const s of SECTIONS) {
    for (const id of s.ids) {
      const a = byId[id];
      if (!a) fail(`Unknown audio id "${id}"`);
      const variants = [{ suffix: '', speed: NORMAL_SPEED }, ...(a.slow ? [{ suffix: '_slow', speed: SLOW_SPEED }] : [])];
      for (const v of variants) {
        const name = `${id}${v.suffix}`;
        // The app no longer uses Google clips; keep the copies already in compare/google.
        const googleSrc = join(GOOGLE_DIR, `${name}.wav`);
        if (existsSync(googleSrc)) copyFileSync(googleSrc, join(OUT_DIR, 'google', `${name}.wav`));
        const out = join(OUT_DIR, 'eleven', `${name}.mp3`);
        if (!existsSync(out) || FORCE) {
          let buf;
          try {
            buf = await synth(a.text, voices[a.voice], v.speed);
          } catch (e) {
            if (voices[a.voice] === FALLBACK[a.voice] || ![401, 402, 403].includes(e.status)) throw e;
            console.warn(`  library voice refused (${e.message}); switching ${a.voice} to premade voice`);
            voices[a.voice] = FALLBACK[a.voice];
            buf = await synth(a.text, voices[a.voice], v.speed);
          }
          writeFileSync(out, buf);
          console.log(`  ok  ${name}.mp3`);
        }
      }
      rows.push({ section: s.title, id, a });
    }
  }

  let html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>TTS Comparison</title><style>
body{font:16px/1.5 -apple-system,system-ui,sans-serif;margin:0 auto;max-width:900px;padding:16px;color:#1A1A1A;background:#fff}
h1{color:#1F2A60;margin-bottom:4px}h2{color:#E85C5C;margin-top:32px}
.row{border:1px solid #D9DEEA;border-radius:12px;padding:12px;margin:8px 0}
.de{font-size:20px;font-weight:700;color:#1F2A60}.meta{color:#5B6275;font-size:13px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px}
.col b{display:block;font-size:13px;color:#5B6275}audio{width:100%;height:36px}
@media(max-width:600px){.grid{grid-template-columns:1fr}}
</style></head><body><h1>Google Chirp3-HD vs ElevenLabs</h1>
<p class="meta">Google: normal 0.75, slow 0.6 (WAV). ElevenLabs ${MODEL}: normal ${NORMAL_SPEED}, slow ${SLOW_SPEED} (MP3 128k).
Voices: female ${voices.female}, male ${voices.male}.</p>`;
  let section = '';
  for (const r of rows) {
    if (r.section !== section) {
      section = r.section;
      html += `<h2>${esc(section)}</h2>`;
    }
    // Audio is embedded as data URIs so the page works in previews that cannot load sibling files.
    const clip = (dir, name, ext) => {
      const b64 = readFileSync(join(OUT_DIR, dir, `${name}.${ext}`)).toString('base64');
      return `<audio controls preload="auto" src="data:audio/${ext === 'wav' ? 'wav' : 'mpeg'};base64,${b64}"></audio>`;
    };
    const col = (label, dir, ext) =>
      `<div class="col"><b>${label}</b>${clip(dir, r.id, ext)}${r.a.slow ? `<b>slow</b>${clip(dir, `${r.id}_slow`, ext)}` : ''}</div>`;
    html += `<div class="row"><div class="de">${esc(r.a.text)}</div><div class="meta">${r.id} · ${r.a.voice}</div>
<div class="grid">${col('Google', 'google', 'wav')}${col('ElevenLabs', 'eleven', 'mp3')}</div></div>`;
  }
  html += '</body></html>\n';
  writeFileSync(join(OUT_DIR, 'index.html'), html);
  writeFileSync(usedPath, JSON.stringify(voices, null, 2) + '\n');
  console.log(`\nVoices used: female=${voices.female}, male=${voices.male}`);
  console.log(`Open ${join(OUT_DIR, 'index.html')}`);
}

main().catch((e) => fail(e.stack || e.message));
