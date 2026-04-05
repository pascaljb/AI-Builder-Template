// src/components/layout/PageWrapper.tsx
// Standard page content wrapper with consistent max-width and padding.
import * as React from 'react'
import { cn } from '@/lib/utils'

interface PageWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  actions?: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const maxWidthClasses = {
  sm:   'max-w-2xl',
  md:   'max-w-4xl',
  lg:   'max-w-6xl',
  xl:   'max-w-7xl',
  full: 'max-w-none',
}

export function PageWrapper({
  title,
  description,
  actions,
  maxWidth = 'lg',
  className,
  children,
  ...props
}: PageWrapperProps) {
  return (
    <div className={cn('flex-1 flex flex-col', className)} {...props}>
      {(title || actions) && (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className={cn('mx-auto flex items-start justify-between gap-4', maxWidthClasses[maxWidth])}>
            <div>
              {title && <h1 className="text-lg font-medium text-gray-900">{title}</h1>}
              {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
          </div>
        </header>
      )}
      <div className={cn('flex-1 mx-auto w-full px-6 py-6', maxWidthClasses[maxWidth])}>
        {children}
      </div>
    </div>
  )
}
