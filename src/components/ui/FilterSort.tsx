// src/components/ui/FilterSort.tsx
// Composable filter + sort bar. Renders a row of filter chips and a sort dropdown.
// Usage: pass filters config, active values, and onChange handlers.
import * as React from 'react'
import { ArrowsDownUp, X, Check } from '@phosphor-icons/react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'
import { Button } from './Button'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FilterOption {
  label: string
  value: string
}

export interface FilterConfig {
  key: string
  label: string
  options: FilterOption[]
  multiple?: boolean
}

export interface SortOption {
  label: string
  value: string
  direction?: 'asc' | 'desc'
}

export interface ActiveFilters {
  [key: string]: string | string[]
}

interface FilterSortProps {
  filters?: FilterConfig[]
  activeFilters?: ActiveFilters
  onFilterChange?: (key: string, value: string | string[]) => void
  sortOptions?: SortOption[]
  activeSort?: string
  onSortChange?: (value: string) => void
  className?: string
}

// ── Filter chip ───────────────────────────────────────────────────────────────

function FilterChip({
  config,
  active,
  onChange,
}: {
  config: FilterConfig
  active: string | string[] | undefined
  onChange: (value: string | string[]) => void
}) {
  const activeArr = active ? (Array.isArray(active) ? active : [active]) : []
  const hasActive = activeArr.length > 0

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          className={cn(
            'inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-sm)] text-sm font-medium border transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30',
            hasActive
              ? 'bg-brand-50 border-brand-200 text-brand-800'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          )}
        >
          {config.label}
          {hasActive && (
            <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded bg-brand-200 text-brand-900 text-xs font-semibold">
              {activeArr.length}
            </span>
          )}
        </button>
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          sideOffset={4}
          className="z-50 min-w-[160px] overflow-hidden rounded-[var(--radius)] border border-gray-200 bg-white p-1 shadow-lg animate-in fade-in-0 zoom-in-95"
        >
          {config.options.map((opt) => {
            const isActive = activeArr.includes(opt.value)
            return (
              <DropdownMenuPrimitive.Item
                key={opt.value}
                className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 rounded-[var(--radius-sm)] cursor-default select-none focus:bg-gray-100 focus:outline-none"
                onSelect={(e) => {
                  e.preventDefault()
                  if (config.multiple) {
                    onChange(isActive ? activeArr.filter(v => v !== opt.value) : [...activeArr, opt.value])
                  } else {
                    onChange(isActive ? [] : [opt.value])
                  }
                }}
              >
                <span className={cn('flex h-4 w-4 items-center justify-center rounded border', isActive ? 'bg-brand-500 border-brand-500' : 'border-gray-300')}>
                  {isActive && <Check size={10} className="text-white" />}
                </span>
                {opt.label}
              </DropdownMenuPrimitive.Item>
            )
          })}
          {hasActive && (
            <>
              <DropdownMenuPrimitive.Separator className="-mx-1 my-1 h-px bg-gray-100" />
              <DropdownMenuPrimitive.Item
                className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-400 rounded-[var(--radius-sm)] cursor-default select-none focus:bg-gray-100 focus:outline-none"
                onSelect={() => onChange([])}
              >
                <X size={12} />
                Clear
              </DropdownMenuPrimitive.Item>
            </>
          )}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}

// ── FilterSort ────────────────────────────────────────────────────────────────

const FilterSort = React.forwardRef<HTMLDivElement, FilterSortProps>(
  ({ filters = [], activeFilters = {}, onFilterChange, sortOptions = [], activeSort, onSortChange, className }, ref) => {
    const activeFilterCount = Object.values(activeFilters).filter(v => Array.isArray(v) ? v.length > 0 : !!v).length

    const clearAll = () => {
      filters.forEach(f => onFilterChange?.(f.key, []))
    }

    return (
      <div ref={ref} className={cn('flex items-center gap-2 flex-wrap', className)}>
        {filters.map((filter) => (
          <FilterChip
            key={filter.key}
            config={filter}
            active={activeFilters[filter.key]}
            onChange={(val) => onFilterChange?.(filter.key, val)}
          />
        ))}

        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1 h-8 px-2 rounded-[var(--radius-sm)] text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={11} />
            Clear all
          </button>
        )}

        {sortOptions.length > 0 && (
          <div className="ml-auto">
            <DropdownMenuPrimitive.Root>
              <DropdownMenuPrimitive.Trigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <ArrowsDownUp size={13} />
                  {sortOptions.find(s => s.value === activeSort)?.label ?? 'Sort'}
                </Button>
              </DropdownMenuPrimitive.Trigger>
              <DropdownMenuPrimitive.Portal>
                <DropdownMenuPrimitive.Content
                  align="end"
                  sideOffset={4}
                  className="z-50 min-w-[160px] overflow-hidden rounded-[var(--radius)] border border-gray-200 bg-white p-1 shadow-lg animate-in fade-in-0 zoom-in-95"
                >
                  {sortOptions.map((opt) => (
                    <DropdownMenuPrimitive.Item
                      key={opt.value}
                      className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 rounded-[var(--radius-sm)] cursor-default select-none focus:bg-gray-100 focus:outline-none"
                      onSelect={() => onSortChange?.(opt.value)}
                    >
                      <span className={cn('flex h-4 w-4 items-center justify-center', activeSort === opt.value ? 'text-brand-600' : 'text-transparent')}>
                        <Check size={12} />
                      </span>
                      {opt.label}
                    </DropdownMenuPrimitive.Item>
                  ))}
                </DropdownMenuPrimitive.Content>
              </DropdownMenuPrimitive.Portal>
            </DropdownMenuPrimitive.Root>
          </div>
        )}
      </div>
    )
  }
)
FilterSort.displayName = 'FilterSort'

export { FilterSort }
