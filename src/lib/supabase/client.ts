// src/lib/supabase/client.ts
// Typed Supabase singleton clients for browser and server contexts.
// Import the correct one for your context — never call createClient() directly.

import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// ── Browser client (use in components and client-side code) ───────────────────
// Singleton pattern — one client per browser session
let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient

  browserClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return browserClient
}

// Convenience alias
export const supabase = getSupabaseBrowserClient()

// ── Server client (use in Server Components and Route Handlers) ───────────────
// Creates a new client per request — cookies are request-scoped
export function getSupabaseServerClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Server Component context — cookies can't be set here
            // This is handled by the middleware
          }
        },
      },
    }
  )
}
