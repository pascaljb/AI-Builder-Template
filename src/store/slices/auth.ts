// src/store/slices/auth.ts
// Auth state. This is the single source of truth for the current user.
// Never call supabase.auth.getUser() in components — use selectUser instead.

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import { signInWithEmail, signUpWithEmail, signOut, getSession } from '@/lib/supabase/auth'

// ── Types ─────────────────────────────────────────────────────────────────────

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error'

interface AuthState {
  user: User | null
  session: Session | null
  status: AuthStatus
  error: string | null

  // Actions
  initialise: () => Promise<void>
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
  clearError: () => void
}

// ── Slice ─────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        session: null,
        status: 'idle',
        error: null,

        initialise: async () => {
          set({ status: 'loading' }, false, 'auth/initialise/pending')
          try {
            const session = await getSession()
            set(
              {
                user: session?.user ?? null,
                session: session ?? null,
                status: session ? 'authenticated' : 'unauthenticated',
              },
              false,
              'auth/initialise/success'
            )
          } catch (err) {
            set({ status: 'unauthenticated', user: null, session: null }, false, 'auth/initialise/error')
          }
        },

        signIn: async (email, password) => {
          set({ status: 'loading', error: null }, false, 'auth/signIn/pending')
          const { error } = await signInWithEmail(email, password)
          if (error) {
            set({ status: 'error', error: error.message }, false, 'auth/signIn/error')
            return false
          }
          const session = await getSession()
          set(
            { user: session?.user ?? null, session: session ?? null, status: 'authenticated', error: null },
            false,
            'auth/signIn/success'
          )
          return true
        },

        signUp: async (email, password) => {
          set({ status: 'loading', error: null }, false, 'auth/signUp/pending')
          const { error } = await signUpWithEmail(email, password)
          if (error) {
            set({ status: 'error', error: error.message }, false, 'auth/signUp/error')
            return false
          }
          set({ status: 'unauthenticated', error: null }, false, 'auth/signUp/success')
          return true
        },

        signOut: async () => {
          await signOut()
          set({ user: null, session: null, status: 'unauthenticated', error: null }, false, 'auth/signOut')
        },

        clearError: () => set({ error: null }, false, 'auth/clearError'),
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({ user: state.user, session: state.session }),
      }
    ),
    { name: 'AuthStore' }
  )
)

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectUser = (state: AuthState) => state.user
export const selectSession = (state: AuthState) => state.session
export const selectIsAuthenticated = (state: AuthState) => state.status === 'authenticated'
export const selectAuthStatus = (state: AuthState) => state.status
export const selectAuthError = (state: AuthState) => state.error
export const selectUserId = (state: AuthState) => state.user?.id
