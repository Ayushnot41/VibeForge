import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for use in browser / Client Components.
 * Uses safe fallbacks to prevent runtime crashes if environment variables are unset.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
  return createBrowserClient(url, key);
}
