// Supabase Edge Function (Deno): TOMCOM German tutor.
// Deploy: supabase functions deploy tutor
// Secret:  supabase secrets set ANTHROPIC_API_KEY=...   (never in the app or the repo)
import { createClient } from 'npm:@supabase/supabase-js@2';

const MODEL = 'claude-haiku-5-5';
const DAILY_LIMIT = 30;
const LANG_NAMES: Record<string, string> = { en: 'English', te: 'Telugu', hi: 'Hindi' };

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}

function systemPrompt(lang: string) {
  return `You are TOMCOM's German tutor for learners from Telangana preparing to work in Germany (levels A1–B1). Answer in ${LANG_NAMES[lang] ?? 'English'}, simply and briefly (max 8 lines). Put every German word or sentence on its own line starting with "DE: ". After each DE line add a line \`Meaning: "<translation>" (<easy English-letter pronunciation>)\`. Correct mistakes kindly and explain why. Stay on German language learning and life/work in Germany; politely decline other topics.`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const jwt = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!jwt) return json({ error: 'not signed in' }, 401);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: userData, error: userError } = await admin.auth.getUser(jwt);
  if (userError || !userData.user) return json({ error: 'not signed in' }, 401);
  const userId = userData.user.id;

  let body: { question?: string; lang?: string; history?: { role: string; text: string }[] };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad request' }, 400);
  }
  const question = String(body.question ?? '').trim().slice(0, 1000);
  const lang = ['en', 'te', 'hi'].includes(String(body.lang)) ? String(body.lang) : 'en';
  if (!question) return json({ error: 'empty question' }, 400);

  // 30 questions per user per UTC day.
  const midnight = new Date();
  midnight.setUTCHours(0, 0, 0, 0);
  const { count } = await admin
    .from('tutor_usage')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', midnight.toISOString());
  if ((count ?? 0) >= DAILY_LIMIT) return json({ error: 'daily limit reached' }, 429);
  await admin.from('tutor_usage').insert({ user_id: userId });

  const history = (Array.isArray(body.history) ? body.history : [])
    .slice(-6)
    .filter((t) => (t.role === 'user' || t.role === 'assistant') && typeof t.text === 'string')
    .map((t) => ({ role: t.role, content: t.text.slice(0, 2000) }));
  // The API expects the conversation to start with a user turn.
  while (history.length && history[0].role !== 'user') history.shift();

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 600,
      system: systemPrompt(lang),
      messages: [...history, { role: 'user', content: question }],
    }),
  });
  if (!res.ok) {
    console.error('anthropic error', res.status, await res.text());
    return json({ error: 'tutor unavailable' }, 502);
  }
  const data = await res.json();
  const answer = (data.content ?? [])
    .filter((b: { type: string }) => b.type === 'text')
    .map((b: { text: string }) => b.text)
    .join('\n')
    .trim();
  return json({ answer });
});
