// src/lib/supabase/queries.ts
// All database query functions live here (or in feature-scoped *Queries.ts files).
//
// Rules (enforced by code-review skill):
// - Every query checks for the error return — no silent failures
// - All returns typed against Database from @/types/database
// - No business logic here — just data access
// - Throw descriptive errors with the Supabase error message included

import { supabase } from './client'

// Feature queries are added here by the scaffold-supabase skill.
// Example pattern:
//
// export async function getThings(): Promise<Thing[]> {
//   const { data, error } = await supabase
//     .from('things')
//     .select('*')
//     .order('created_at', { ascending: false })
//
//   if (error) throw new Error(`Failed to fetch things: ${error.message}`)
//   return data
// }

export {}  // Remove when first query is added
