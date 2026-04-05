// src/types/index.ts
// Global application types. Entity types derived from the database
// should come from @/types/database — only put app-level types here.

export type { Database } from './database'

// ── Common ────────────────────────────────────────────────────────────────────

export type ID = string  // UUID

export interface Timestamps {
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

// ── Route params ──────────────────────────────────────────────────────────────

export interface PageProps {
  params: Record<string, string>
  searchParams: Record<string, string | string[] | undefined>
}
