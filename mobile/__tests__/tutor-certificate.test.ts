import { parseTutorAnswer } from '../src/logic/tutorLines';
import { cannedAnswer } from '../src/backend/tutorCanned';
import { certificateFileName, certificateHtml } from '../src/logic/certificateHtml';
import type { Certificate } from '../src/backend/types';

describe('parseTutorAnswer', () => {
  it('splits text, DE lines and their meanings', () => {
    const blocks = parseTutorAnswer('Say this:\nDE: Guten Morgen!\nMeaning: "Good morning!" (GOO-ten)\nUntil 11 am.');
    expect(blocks).toEqual([
      { kind: 'text', text: 'Say this:' },
      { kind: 'de', de: 'Guten Morgen!', meaning: '"Good morning!" (GOO-ten)' },
      { kind: 'text', text: 'Until 11 am.' },
    ]);
  });
  it('keeps a Meaning line with no DE line as text', () => {
    expect(parseTutorAnswer('Meaning: x')).toEqual([{ kind: 'text', text: 'Meaning: x' }]);
  });
});

describe('canned tutor', () => {
  it('answers how to say good morning, in DE line format', () => {
    for (const lang of ['en', 'te', 'hi'] as const) {
      const a = cannedAnswer('How do I say good morning?', lang, 'ask');
      expect(parseTutorAnswer(a).some((b) => b.kind === 'de' && b.de === 'Guten Morgen!')).toBe(true);
    }
  });
  it('falls back to an offline message', () => {
    expect(cannedAnswer('quantum physics', 'en', 'ask')).toMatch(/live tutor/);
  });
});

describe('certificate', () => {
  const cert: Certificate = { id: '1', level: 'A1', score: 92, issuedAt: '2026-10-27T10:00:00Z', publicSlug: 'abcd2345efgh', fullName: 'Ravi <Kumar>' };
  it('builds the PDF HTML with brand, name, level and score, escaping the name', () => {
    const html = certificateHtml(cert);
    expect(html).toContain('TomCom');
    expect(html).toContain('Certificate of Achievement');
    expect(html).toContain('Ravi &lt;Kumar&gt;');
    expect(html).toContain('A1 · Beginner');
    expect(html).toContain('92%');
    expect(html).toContain('Telangana Overseas Manpower Company Limited (TOMCOM)');
  });
  it('names the file TomCom-<level>-<Name>.pdf', () => {
    expect(certificateFileName({ ...cert, fullName: 'Ravi Kumar' })).toBe('TomCom-A1-Ravi-Kumar.pdf');
  });
});
