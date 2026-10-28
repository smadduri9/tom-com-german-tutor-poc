// Splits a tutor answer into plain lines and German lines.
// "DE: <German>" starts a German block; a following "Meaning: ..." line belongs to it.
export type TutorBlock = { kind: 'text'; text: string } | { kind: 'de'; de: string; meaning?: string };

export function parseTutorAnswer(answer: string): TutorBlock[] {
  const blocks: TutorBlock[] = [];
  for (const raw of answer.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const de = line.match(/^DE:\s*(.+)$/i);
    if (de) {
      blocks.push({ kind: 'de', de: de[1].trim() });
      continue;
    }
    const meaning = line.match(/^Meaning:\s*(.+)$/i);
    const last = blocks[blocks.length - 1];
    if (meaning && last?.kind === 'de' && !last.meaning) {
      last.meaning = meaning[1].trim();
      continue;
    }
    blocks.push({ kind: 'text', text: line });
  }
  return blocks;
}
