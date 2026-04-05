// src/lib/supabase/auth.ts
// Auth helper functions. All auth state lives in the Zustand auth slice.
// Never call these directly from components — use the store actions instead.

import { supabase } from './client'
import type { Provider } from '@supabase/supabase-js'

export type AuthError = { message: string; status?: number }

/** Sign in with email + password */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return { error: error ? { message: error.message, status: error.status } : null }
}

/** Sign up with email + password */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })
  return { error: error ? { message: error.message, status: error.status } : null }
}

/** Sign in with OAuth provider (Google, GitHub, etc.) */
export async function signInWithProvider(
  provider: Provider
): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })
  return { error: error ? { message: error.message } : null }
}

/** Sign out */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

/** Get the current session — use Zustand selector in components instead */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw new Error(`Failed to get session: ${error.message}`)
  return session
}

/** Get the current user — use Zustand selector in components instead */
export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw new Error(`Failed to get user: ${error.message}`)
  return user
}
