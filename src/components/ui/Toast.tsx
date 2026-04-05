// src/components/ui/Toast.tsx
// Toast notification renderer. Mount once in Shell — reads from the UI store.
// Trigger toasts anywhere via: useUIStore.getState().addToast(...)

import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { X, CheckCircle, WarningCircle, XCircle, Info } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useUIStore, selectToasts } from '@/store'
import type { ToastVariant } from '@/store/slices/ui'

// ── Icon + colour map ─────────────────────────────────────────────────────────

const variantConfig: Record<ToastVariant, {
  icon: React.ReactNode
  containerClass: string
  iconClass: string
}> = {
  default: {
    icon: <Info size={16} weight="fill" />,
    containerClass: 'bg-gray-900 border-gray-800',
    iconClass: 'text-gray-400',
  },
  success: {
    icon: <CheckCircle size={16} weight="fill" />,
    containerClass: 'bg-gray-900 border-gray-800',
    iconClass: 'text-green-400',
  },
  error: {
    icon: <XCircle size={16} weight="fill" />,
    containerClass: 'bg-gray-900 border-red-900',
    iconClass: 'text-red-400',
  },
  warning: {
    icon: <WarningCircle size={16} weight="fill" />,
    containerClass: 'bg-gray-900 border-amber-900',
    iconClass: 'text-amber-400',
  },
}

// ── Single toast ──────────────────────────────────────────────────────────────

function ToastItem({ id, message, variant = 'default', duration = 4000 }: {
  id: string
  message: string
  variant?: ToastVariant
  duration?: number
}) {
  const removeToast = useUIStore(s => s.removeToast)
  const config = variantConfig[variant]

  return (
    <ToastPrimitive.Root
      duration={duration}
      onOpenChange={(open) => { if (!open) removeToast(id) }}
      className={cn(
        'flex items-start gap-3 w-full max-w-sm rounded-[var(--radius)] border px-4 py-3 shadow-lg',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full',
        'data-[state=open]:slide-in-from-bottom-full',
        'duration-[var(--duration)]',
        config.containerClass
      )}
    >
      <span className={cn('mt-0.5 shrink-0', config.iconClass)}>
        {config.icon}
      </span>

      <ToastPrimitive.Description className="flex-1 text-sm text-gray-100 leading-snug">
        {message}
      </ToastPrimitive.Description>

      <ToastPrimitive.Close
        className="shrink-0 rounded p-0.5 text-gray-500 hover:text-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-500"
        aria-label="Dismiss"
      >
        <X size={13} />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  )
}

// ── Toaster — mount once in Shell ─────────────────────────────────────────────

export function Toaster() {
  const toasts = useUIStore(selectToasts)

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
      <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm outline-none" />
    </ToastPrimitive.Provider>
  )
}
