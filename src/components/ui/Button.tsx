// src/components/ui/Button.tsx
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Base
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background-color,opacity,transform] duration-[var(--duration)] ease-[var(--easing)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none',
  {
    variants: {
      variant: {
        primary:   'bg-brand-500 text-white hover:bg-brand-600',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200',
        outline:   'border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-100',
        ghost:     'bg-transparent text-gray-700 hover:bg-gray-100',
        danger:    'bg-red-600 text-white hover:bg-red-700',
        'danger-ghost': 'bg-transparent text-red-600 hover:bg-red-50',
      },
      size: {
        sm:   'h-8 px-3 text-xs rounded-[var(--radius-sm)]',
        md:   'h-9 px-4 text-sm rounded-[var(--radius)]',
        lg:   'h-11 px-6 text-base rounded-[var(--radius)]',
        icon: 'h-9 w-9 rounded-[var(--radius)]',
        'icon-sm': 'h-7 w-7 rounded-[var(--radius-sm)]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {children}
          </>
        ) : children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
