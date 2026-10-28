import { createLocalBackend } from './localBackend';
import { createSupabaseBackend } from './supabaseBackend';
import type { Backend } from './types';

export * from './types';
export { DEMO_EMAIL, DEMO_PASSWORD, DEMO_RESET_CODE } from './localBackend';

// Supabase when both public env vars are set (mobile/.env), otherwise the on-device demo backend.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const backend: Backend = url && anonKey ? createSupabaseBackend(url, anonKey) : createLocalBackend();
