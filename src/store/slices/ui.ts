// src/store/slices/ui.ts
// Global UI state: loading overlays, toast notifications, modal management.
// Import useUIStore in layout components and the Shell.

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// ── Types ─────────────────────────────────────────────────────────────────────

export type ToastVariant = 'default' | 'success' | 'error' | 'warning'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
  duration?: number  // ms, default 4000
}

interface UIState {
  // Global loading overlay (for page-level transitions)
  isLoading: boolean

  // Toast notifications
  toasts: Toast[]

  // Active modal (one at a time)
  activeModal: string | null
  modalData: unknown

  // Actions
  setLoading: (loading: boolean) => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  openModal: (modalId: string, data?: unknown) => void
  closeModal: () => void
}

// ── Slice ─────────────────────────────────────────────────────────────────────

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      isLoading: false,
      toasts: [],
      activeModal: null,
      modalData: null,

      setLoading: (loading) => {
        set({ isLoading: loading }, false, 'ui/setLoading')
      },

      addToast: (toast) => {
        const id = crypto.randomUUID()
        set(
          (state) => ({ toasts: [...state.toasts, { ...toast, id }] }),
          false,
          'ui/addToast'
        )
        // Auto-remove after duration
        setTimeout(() => {
          set(
            (state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }),
            false,
            'ui/removeToast/auto'
          )
        }, toast.duration ?? 4000)
      },

      removeToast: (id) => {
        set(
          (state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }),
          false,
          'ui/removeToast'
        )
      },

      openModal: (modalId, data = null) => {
        set({ activeModal: modalId, modalData: data }, false, 'ui/openModal')
      },

      closeModal: () => {
        set({ activeModal: null, modalData: null }, false, 'ui/closeModal')
      },
    }),
    { name: 'UIStore' }
  )
)

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectIsLoading = (state: UIState) => state.isLoading
export const selectToasts = (state: UIState) => state.toasts
export const selectActiveModal = (state: UIState) => state.activeModal
export const selectModalData = (state: UIState) => state.modalData
