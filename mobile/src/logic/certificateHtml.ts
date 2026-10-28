import type { Certificate } from '../backend/types';

export const BRAND = 'TOMCOM Deutsch';
export const ISSUER = 'Telangana Overseas Manpower Company Limited (TOMCOM)';

const LEVEL_NAMES = { A1: 'A1 · Beginner', A2: 'A2 · Elementary', B1: 'B1 · Intermediate' } as const;

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

export function certificateFileName(c: Certificate): string {
  const name = c.fullName.trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'Learner';
  return `TOMCOM-Deutsch-${c.level}-${name}.pdf`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Landscape A4 (842 × 595 pt) certificate for expo-print.
export function certificateHtml(c: Certificate): string {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@page { size: 842px 595px; margin: 0; }
html, body { margin: 0; padding: 0; }
body { width: 842px; height: 595px; background: #FBF5E6; font-family: Georgia, 'Times New Roman', serif; color: #1F2A44; }
.frame { position: absolute; inset: 24px; border: 3px double #B59A6D; padding: 40px 56px; text-align: center; box-sizing: border-box; }
.brand { font-style: italic; font-size: 22px; color: #1F4A75; }
h1 { font-size: 40px; margin: 18px 0 8px; letter-spacing: 1px; }
.small { font-size: 15px; color: #5B6275; margin: 6px 0; }
.name { font-size: 34px; font-weight: bold; margin: 12px 0; }
.meta { display: flex; justify-content: center; gap: 48px; margin-top: 18px; font-size: 14px; }
.issuer { position: absolute; bottom: 36px; left: 0; right: 0; font-size: 13px; color: #5B6275; }
</style></head><body><div class="frame">
<div class="brand">${BRAND}</div>
<h1>Certificate of Achievement</h1>
<p class="small">This is proudly presented to</p>
<div class="name">${esc(c.fullName || 'Learner')}</div>
<p class="small">for successfully completing the German ${LEVEL_NAMES[c.level]} programme</p>
<p class="small">with a final score of ${c.score}%.</p>
<div class="meta"><span>Issued: ${esc(formatDate(c.issuedAt))}</span><span>Level: ${c.level}</span></div>
<p class="small">Certificate ID: ${esc(c.publicSlug)}</p>
<div class="issuer">${ISSUER}</div>
</div></body></html>`;
}
