// Checks every lesson against docs/05 section 5 (structure, not teaching quality).
// Exit code 1 on any error. Run with: node tools/validate-content.mjs
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'content');
const LANGS = ['en', 'te', 'hi'];
const LEVELS = ['A1', 'A2', 'B1'];
const errors = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);

function checkL10n(l, where) {
  if (!l || typeof l !== 'object') return err(where, 'missing L10n');
  for (const lang of LANGS) {
    if (typeof l[lang] !== 'string' || l[lang].trim() === '') err(where, `missing ${lang}`);
  }
}
const checkDe = (s, where) => {
  if (typeof s !== 'string' || s.length === 0) err(where, 'empty German text');
  else if (s.length > 160) err(where, 'German text longer than 160 chars');
};
const count = (where, arr, min, max) => {
  if (!Array.isArray(arr)) return err(where, 'not an array');
  if (arr.length < min || arr.length > max) err(where, `has ${arr.length}, expected ${min}-${max}`);
};
const unique = (where, ids) => {
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) err(where, `duplicate id ${id}`);
    seen.add(id);
  }
};

const curriculum = JSON.parse(readFileSync(join(CONTENT, 'curriculum.json'), 'utf8'));
for (const level of LEVELS) {
  for (const item of curriculum[level] ?? []) {
    checkL10n(item.title, `curriculum ${item.slug} title`);
    checkL10n(item.topic, `curriculum ${item.slug} topic`);
  }
}

for (const level of LEVELS) {
  const dir = join(CONTENT, 'lessons', level);
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const where = `lessons/${level}/${file}`;
    const slug = file.replace(/\.json$/, '');
    const l = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    if (l.slug !== slug) err(where, `slug "${l.slug}" does not match file name`);
    if (l.level !== level) err(where, `level "${l.level}" does not match folder`);
    if (!(curriculum[level] ?? []).some((c) => c.slug === slug)) err(where, 'slug not in curriculum.json');
    checkL10n(l.title, `${where} title`);
    checkL10n(l.subtitle, `${where} subtitle`);
    checkL10n(l.intro, `${where} intro`);
    checkL10n(l.deep_dive, `${where} deep_dive`);
    checkL10n(l.practice_tip, `${where} practice_tip`);
    checkL10n(l.grammar_note?.title, `${where} grammar_note.title`);
    checkL10n(l.grammar_note?.body, `${where} grammar_note.body`);
    if (l.cultural_note) checkL10n(l.cultural_note, `${where} cultural_note`);
    if (!l.review || typeof l.review.te !== 'boolean' || typeof l.review.hi !== 'boolean') err(where, 'review flags missing');

    count(`${where} vocabulary`, l.vocabulary, 8, 15);
    count(`${where} examples`, l.examples, 4, 6);
    count(`${where} more_vocabulary`, l.more_vocabulary, 4, 6);
    // Review lessons have no dialogue; every other lesson has 4-8 lines between 2 speakers.
    const isReview = slug.endsWith('-review');
    if (!isReview || l.dialogue?.lines?.length) {
      count(`${where} dialogue.lines`, l.dialogue?.lines, 4, 8);
      checkL10n(l.dialogue?.scene, `${where} dialogue.scene`);
      if (new Set(l.dialogue?.lines?.map((x) => x.speaker)).size !== 2) err(where, 'dialogue needs exactly 2 speakers');
    }
    count(`${where} common_mistakes`, l.common_mistakes, 2, 4);
    count(`${where} self_check`, l.self_check, 2, 4);

    const vocab = l.vocabulary ?? [];
    const examples = l.examples ?? [];
    const more = l.more_vocabulary ?? [];
    const lines = l.dialogue?.lines ?? [];
    vocab.forEach((v) => {
      checkDe(v.de, `${where} vocab ${v.id}`);
      checkL10n(v.meaning, `${where} vocab ${v.id} meaning`);
    });
    examples.forEach((e) => {
      checkDe(e.de, `${where} example ${e.id}`);
      checkL10n(e.meaning, `${where} example ${e.id} meaning`);
    });
    more.forEach((m) => {
      checkDe(m.de, `${where} more ${m.id}`);
      checkL10n(m.meaning, `${where} more ${m.id} meaning`);
    });
    lines.forEach((d) => {
      checkDe(d.de, `${where} line ${d.id}`);
      checkL10n(d.meaning, `${where} line ${d.id} meaning`);
    });
    unique(where, [...vocab, ...examples, ...more, ...lines].map((x) => x.id));
    (l.common_mistakes ?? []).forEach((m, i) => checkL10n(m.why, `${where} mistake ${i} why`));
    (l.self_check ?? []).forEach((s, i) => {
      checkL10n(s.question, `${where} self_check ${i} question`);
      checkL10n(s.answer, `${where} self_check ${i} answer`);
    });

    const quiz = l.quiz ?? [];
    if (quiz.length !== 6) err(where, `quiz has ${quiz.length}, expected 6`);
    quiz.forEach((q, i) => {
      const qwhere = `${where} quiz ${q.id}`;
      const want = i < 4 ? 'mcq' : 'listening';
      if (q.kind !== want) err(qwhere, `kind must be ${want}`);
      checkL10n(q.prompt, `${qwhere} prompt`);
      checkL10n(q.explanation, `${qwhere} explanation`);
      if (!Array.isArray(q.options) || q.options.length !== 4) err(qwhere, 'needs exactly 4 options');
      if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3) err(qwhere, 'correctIndex must be 0-3');
      if (q.kind === 'listening') {
        if (!q.audioId) err(qwhere, 'listening question needs audioId');
        if (!q.audio_de) err(qwhere, 'listening question needs audio_de');
      }
      (q.options ?? []).forEach((o, j) => {
        if (o.text) checkL10n(o.text, `${qwhere} option ${j}`);
        else if (typeof o.de !== 'string' || !o.de) err(qwhere, `option ${j} has no text`);
      });
    });
    unique(where, quiz.map((q) => q.id));
  }
}

if (errors.length) {
  console.error(`Content validation failed (${errors.length} errors):`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log('Content validation passed.');
