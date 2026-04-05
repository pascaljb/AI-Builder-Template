// src/lib/supabase/server.ts
// Server-side Supabase client for App Router.
// Use in: server components, route handlers, middleware.

import { createServerClient as _createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

/**
 * Creates a typed Supabase client for server-side use.
 * Reads auth session from cookies automatically.
 * Call once per request — do not cache across requests.
 */
export function createServerClient() {
  const cookieStore = cookies()

  return _createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from a Server Component — safe to ignore
            // The middleware handles session refresh
          }
        },
      },
    }
  )
}
