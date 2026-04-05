// src/components/ui/Spinner.tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-7 w-7' }

const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ className, size = 'md', ...props }, ref) => (
    <span
      ref={ref}
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-current border-t-transparent text-brand-500',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
)
Spinner.displayName = 'Spinner'

export { Spinner }
