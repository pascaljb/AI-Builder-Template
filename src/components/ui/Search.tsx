// src/components/ui/Search.tsx
// Search input with debounced onChange and clear button.
import * as React from 'react'
import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export interface SearchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string
  onChange?: (value: string) => void
  debounceMs?: number
  onClear?: () => void
}

const Search = React.forwardRef<HTMLInputElement, SearchProps>(
  ({ className, value = '', onChange, debounceMs = 300, onClear, placeholder = 'Search…', ...props }, ref) => {
    const [internal, setInternal] = React.useState(value)
    const timerRef = React.useRef<ReturnType<typeof setTimeout>>()

    // Sync external value
    React.useEffect(() => { setInternal(value) }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value
      setInternal(next)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => onChange?.(next), debounceMs)
    }

    const handleClear = () => {
      setInternal('')
      onChange?.('')
      onClear?.()
    }

    return (
      <div className="relative w-full">
        <MagnifyingGlass
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          ref={ref}
          type="search"
          value={internal}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            'h-9 w-full rounded-[var(--radius)] border border-gray-300 bg-white pl-9 pr-8 text-sm text-gray-900',
            'placeholder:text-gray-400',
            'transition-[border-color,box-shadow] duration-[var(--duration)] ease-[var(--easing)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/25 focus-visible:border-brand-500',
            'hover:border-gray-400',
            '[&::-webkit-search-decoration]:hidden [&::-webkit-search-cancel-button]:hidden',
            className
          )}
          {...props}
        />
        {internal && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>
    )
  }
)
Search.displayName = 'Search'

export { Search }
