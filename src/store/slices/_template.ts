// src/store/slices/_template.ts
// ─────────────────────────────────────────────────────────────────────────────
// CANONICAL SLICE PATTERN — copy this when creating a new slice.
// The scaffold-feature and scaffold-supabase skills use this as the template.
// The code-review skill checks all slices conform to this pattern.
// ─────────────────────────────────────────────────────────────────────────────
//
// Usage:
//   1. Copy this file to src/store/slices/[domain].ts
//   2. Replace "Thing" / "thing" / "things" with your domain entity
//   3. Add the slice to src/store/index.ts
//   4. Never call set() directly in components — use the exported actions

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// ── Types ─────────────────────────────────────────────────────────────────────

// Replace with your entity type (usually imported from @/types)
interface Thing {
  id: string
  name: string
  createdAt: string
}

type LoadingState = 'idle' | 'loading' | 'success' | 'error'

interface ThingState {
  // Data
  things: Thing[]
  selectedThing: Thing | null

  // Async state — always track all three
  status: LoadingState
  error: string | null

  // Actions — all state mutations go through these
  fetchThings: () => Promise<void>
  selectThing: (thing: Thing | null) => void
  createThing: (input: Omit<Thing, 'id' | 'createdAt'>) => Promise<void>
  updateThing: (id: string, updates: Partial<Thing>) => Promise<void>
  deleteThing: (id: string) => Promise<void>
  clearError: () => void
  reset: () => void
}

// ── Initial state ─────────────────────────────────────────────────────────────

const initialState = {
  things: [],
  selectedThing: null,
  status: 'idle' as LoadingState,
  error: null,
}

// ── Slice ─────────────────────────────────────────────────────────────────────

export const useThingStore = create<ThingState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchThings: async () => {
        set({ status: 'loading', error: null }, false, 'thing/fetchThings/pending')

        try {
          // Replace with your actual query import
          // const things = await getThings()
          const things: Thing[] = [] // placeholder

          set({ things, status: 'success' }, false, 'thing/fetchThings/success')
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to fetch things'
          set({ status: 'error', error: message }, false, 'thing/fetchThings/error')
        }
      },

      selectThing: (thing) => {
        set({ selectedThing: thing }, false, 'thing/selectThing')
      },

      createThing: async (input) => {
        set({ status: 'loading', error: null }, false, 'thing/createThing/pending')

        try {
          // Replace with your actual query import
          // const newThing = await createThingQuery(input)
          const newThing: Thing = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() }

          set(
            (state) => ({ things: [newThing, ...state.things], status: 'success' }),
            false,
            'thing/createThing/success'
          )
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to create thing'
          set({ status: 'error', error: message }, false, 'thing/createThing/error')
        }
      },

      updateThing: async (id, updates) => {
        set({ status: 'loading', error: null }, false, 'thing/updateThing/pending')

        try {
          // Replace with your actual query import
          // const updated = await updateThingQuery(id, updates)

          set(
            (state) => ({
              things: state.things.map((t) => (t.id === id ? { ...t, ...updates } : t)),
              selectedThing: state.selectedThing?.id === id
                ? { ...state.selectedThing, ...updates }
                : state.selectedThing,
              status: 'success',
            }),
            false,
            'thing/updateThing/success'
          )
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to update thing'
          set({ status: 'error', error: message }, false, 'thing/updateThing/error')
        }
      },

      deleteThing: async (id) => {
        set({ status: 'loading', error: null }, false, 'thing/deleteThing/pending')

        try {
          // Replace with your actual query import
          // await deleteThingQuery(id)

          set(
            (state) => ({
              things: state.things.filter((t) => t.id !== id),
              selectedThing: state.selectedThing?.id === id ? null : state.selectedThing,
              status: 'success',
            }),
            false,
            'thing/deleteThing/success'
          )
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to delete thing'
          set({ status: 'error', error: message }, false, 'thing/deleteThing/error')
        }
      },

      clearError: () => {
        set({ error: null }, false, 'thing/clearError')
      },

      reset: () => {
        set(initialState, false, 'thing/reset')
      },
    }),
    { name: 'ThingStore' }
  )
)

// ── Selectors ─────────────────────────────────────────────────────────────────
// Import these in components — never write inline selectors

export const selectThings = (state: ThingState) => state.things
export const selectSelectedThing = (state: ThingState) => state.selectedThing
export const selectThingStatus = (state: ThingState) => state.status
export const selectThingError = (state: ThingState) => state.error
export const selectThingIsLoading = (state: ThingState) => state.status === 'loading'
