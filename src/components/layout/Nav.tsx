// src/components/layout/Nav.tsx
// Sidebar navigation. Accepts a navItems config — no hardcoded routes.
// Designed to sit inside Shell's sidebar slot.

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore, selectUser } from '@/store'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: string | number
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

interface NavProps {
  sections: NavSection[]
  logo?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

// ── NavLink ───────────────────────────────────────────────────────────────────

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius)] text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30',
        isActive
          ? 'bg-brand-50 text-brand-800'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      <span className={cn('shrink-0', isActive ? 'text-brand-600' : 'text-gray-400')}>
        {item.icon}
      </span>
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge !== undefined && (
        <span className={cn(
          'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-xs font-semibold',
          isActive ? 'bg-brand-200 text-brand-900' : 'bg-gray-200 text-gray-700'
        )}>
          {item.badge}
        </span>
      )}
    </Link>
  )
}

// ── Nav ───────────────────────────────────────────────────────────────────────

export function Nav({ sections, logo, footer, className }: NavProps) {
  const user = useAuthStore(selectUser)

  return (
    <nav className={cn('flex flex-col h-full', className)}>
      {/* Logo */}
      {logo && (
        <div className="h-14 flex items-center px-4 border-b border-gray-200 shrink-0">
          {logo}
        </div>
      )}

      {/* Sections */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {sections.map((section, i) => (
          <div key={i}>
            {section.title && (
              <p className="px-3 mb-1 text-xs font-medium text-gray-400 uppercase tracking-wider">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer slot — custom content, or default user block */}
      <div className="shrink-0 border-t border-gray-200 p-3">
        {footer ?? (
          user && (
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-[var(--radius)] hover:bg-gray-100 transition-colors cursor-default">
              <Avatar
                src={user.user_metadata?.avatar_url}
                name={user.user_metadata?.full_name ?? user.email}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.user_metadata?.full_name ?? 'Account'}
                </p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          )
        )}
      </div>
    </nav>
  )
}
