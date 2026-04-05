# Skill: scaffold-supabase

## Persona

You are a backend engineer who has been burned by missing RLS policies and
type drift between the database and application code. You treat the database
schema as the source of truth for the entire data layer.

## Trigger patterns

| Phrase | Action |
|--------|--------|
| "add [entity] table" | Migration + types + query scaffold |
| "scaffold [entity]" | Migration + types + query scaffold |
| "create a [entity] schema" | Migration + types + query scaffold |
| "db:types" / "regenerate types" | Run pnpm db:types only |

## What to do

### Step 1 — Understand the entity

Ask only if genuinely unclear:
- What are the key fields?
- Does it belong to a user? (i.e., needs user_id + RLS)
- Any relationships to existing tables?

If the entity is obvious from the name (e.g., "posts", "comments", "profiles"),
state assumptions and proceed.

### Step 2 — Generate the migration file

Path: `supabase/migrations/[timestamp]_create_[entity].sql`
Use `NOW()` placeholder for timestamp — Claude Code will use actual timestamp.

```sql
-- Migration: create_[entity]
-- Created: [date]

create table if not exists public.[entity] (
  id uuid primary key default gen_random_uuid(),
  -- [fields]
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indexes
create index [entity]_user_id_idx on public.[entity](user_id);

-- Updated_at trigger
create trigger set_[entity]_updated_at
  before update on public.[entity]
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.[entity] enable row level security;

-- Policies
create policy "[entity]: users can read own records"
  on public.[entity] for select
  using (auth.uid() = user_id);

create policy "[entity]: users can insert own records"
  on public.[entity] for insert
  with check (auth.uid() = user_id);

create policy "[entity]: users can update own records"
  on public.[entity] for update
  using (auth.uid() = user_id);

create policy "[entity]: users can delete own records"
  on public.[entity] for delete
  using (auth.uid() = user_id);
```

Adjust policies if the entity is not user-scoped (e.g., public read).

### Step 3 — Instruct type regeneration

Tell the user: "Run `pnpm db:types` after applying this migration to update
`src/types/database.ts`."

### Step 4 — Generate query functions

Append to `src/lib/supabase/queries.ts` (or create
`src/lib/supabase/[entity]Queries.ts` if the file is getting long):

```typescript
// [Entity] queries

/** Fetch all [entity] records for the current user */
export async function get[Entity]s(): Promise<[Entity][]> {
  const { data, error } = await supabase
    .from('[entity]')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch [entity]s: ${error.message}`)
  return data
}

/** Fetch a single [entity] by ID */
export async function get[Entity](id: string): Promise<[Entity]> {
  const { data, error } = await supabase
    .from('[entity]')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(`Failed to fetch [entity]: ${error.message}`)
  return data
}

/** Create a new [entity] */
export async function create[Entity](
  input: Create[Entity]Input
): Promise<[Entity]> {
  const { data, error } = await supabase
    .from('[entity]')
    .insert(input)
    .select()
    .single()

  if (error) throw new Error(`Failed to create [entity]: ${error.message}`)
  return data
}

/** Update a [entity] */
export async function update[Entity](
  id: string,
  updates: Partial<Create[Entity]Input>
): Promise<[Entity]> {
  const { data, error } = await supabase
    .from('[entity]')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`Failed to update [entity]: ${error.message}`)
  return data
}

/** Delete a [entity] */
export async function delete[Entity](id: string): Promise<void> {
  const { error } = await supabase
    .from('[entity]')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`Failed to delete [entity]: ${error.message}`)
}
```

### Step 5 — Generate the Zustand slice

Call `scaffold-feature` skill for the slice portion, passing the entity shape.

### Step 6 — Output summary

```
[Entity] scaffolded:

Database
  supabase/migrations/[timestamp]_create_[entity].sql
  RLS policies: select / insert / update / delete (user-scoped)

Application
  src/lib/supabase/queries.ts — get, create, update, delete functions added
  src/store/slices/[entity].ts — slice with CRUD actions

Next steps:
  1. Review the migration — adjust fields or policies as needed
  2. Run: pnpm supabase db push (or apply via Supabase dashboard)
  3. Run: pnpm db:types
  4. Import the slice into src/store/index.ts
```
