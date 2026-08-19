import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for use in browser / Client Components.
 * This client uses the anon key and relies on the user's session cookie.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
