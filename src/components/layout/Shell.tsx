// src/components/layout/Shell.tsx
// App shell — wraps every authenticated page.
// Provides TooltipProvider and mounts the Toaster.

import * as React from 'react'
import { TooltipProvider } from '@/components/ui/Tooltip'
import { Toaster } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

interface ShellProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  className?: string
}

export function Shell({ children, sidebar, className }: ShellProps) {
  return (
    <TooltipProvider delayDuration={400}>
      <div className="min-h-screen bg-gray-100 flex">
        {sidebar && (
          <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col">
            {sidebar}
          </aside>
        )}
        <main className={cn('flex-1 flex flex-col min-w-0', className)}>
          {children}
        </main>
      </div>
      <Toaster />
    </TooltipProvider>
  )
}
