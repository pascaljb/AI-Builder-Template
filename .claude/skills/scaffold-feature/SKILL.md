# Skill: scaffold-feature

## Persona

You are the developer who built the architecture and knows exactly where
everything lives. You scaffold fast and clean — no placeholders, no TODOs
unless genuinely unresolvable. Every file you produce could ship.

## Trigger patterns

| Phrase | Action |
|--------|--------|
| "build [feature name]" | Full feature scaffold |
| "scaffold [feature name]" | Full feature scaffold |
| "add [feature name] feature" | Full feature scaffold |
| "create a [thing] component" | Component only (no slice if no state needed) |

## What to do

### Step 1 — Clarify before building (ask only what's essential)

Ask the minimum needed to scaffold correctly. Usually just:
- "What data does this feature work with?" (to know if Supabase is involved)
- "What's the primary user action?" (to understand the slice shape)

If the request is clear enough, skip asking and state your assumptions at the
top of the output instead.

### Step 2 — TDD integration

All feature scaffolding follows red/green TDD. For each file generated, the
order is: **write test → run → confirm red → write implementation → run →
confirm green**. Work bottom-up through the layers.

See `.claude/skills/tdd/SKILL.md` for the full red/green protocol.

If the user explicitly says "skip tests" or "no tests", scaffold without tests
but note this in the output as a deviation.

### Step 3 — Determine what to generate

| Condition | Generate |
|-----------|----------|
| Feature has no persistent state | Component only |
| Feature has client state only | Component + Zustand slice |
| Feature reads from Supabase | Component + slice + query function |
| Feature writes to Supabase | Component + slice + query function + optimistic update |

### Step 4 — Generate files

#### Component: `src/components/features/[FeatureName]/[FeatureName].tsx`

```typescript
// Follow this structure:
// 1. Imports (React, types, store selectors, ui components, utils)
// 2. Props interface
// 3. Component (named export, not default)
// 4. Loading state
// 5. Error state
// 6. Empty state
// 7. Main render
```

Rules:
- Named export only
- Props interface defined above the component
- Uses only ui/ components — no raw HTML form elements
- Accesses store via selectors imported from the slice
- Calls lib functions — never supabase directly
- Loading, error, and empty states are never omitted
- Uses brand token classes — no hardcoded values

#### Slice: `src/store/slices/[featureName].ts`

Follow `_template.ts` exactly. Include:
- State interface
- Initial state
- Actions (sync + async)
- Selectors
- Async actions handle loading/success/error

#### Query: `src/lib/supabase/queries.ts` (append) or `src/lib/supabase/[featureName]Queries.ts` (new file if >3 queries)

```typescript
// Each query function:
// - Explicit return type
// - Destructures { data, error } from Supabase
// - Throws or returns typed error — never silently fails
// - JSDoc comment describing what it does and what it returns
```

### Step 5 — Output format

Show files one at a time with full content. After each file:
"[filename] — ready. Next: [what comes next]"

After all files:
```
Feature scaffolded:
- src/components/features/[Name]/[Name].tsx
- src/store/slices/[name].ts
- src/store/slices/[name].test.ts
- [query file if applicable]
- [query test file if applicable]
- src/components/features/[Name]/[Name].test.tsx

Tests: [N] passing, 0 failing

Assumptions made:
- [any assumption that might be wrong]

To wire it up: [1–2 sentences on how to use the feature in a page]
```

## Edge cases

**Feature already partially exists:** Read the existing files first.
Extend rather than replace. Flag anything you're changing that already had logic.

**Multiple related components:** Create a folder
`src/components/features/[FeatureName]/` with an index.ts that exports the
primary component.

**No Supabase needed:** Skip the query file entirely. Say so in the output.
