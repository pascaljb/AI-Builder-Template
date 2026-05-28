# CLAUDE.md

## On every session start — do this silently, then confirm

Load these files into context before responding to anything:

1. `.claude/context/brand.md` — visual system, token rules, TOV
2. `.claude/context/decisions.md` — architecture decisions log
3. `.claude/context/session.md` — what was happening last session
4. `.claude/context/progress.md` — what's done, in progress, and next

Then confirm with exactly this format as your first response:

```
Context loaded. Here's where we are:
[1 sentence from session.md on what was last being worked on]
[1 sentence from progress.md on what's next]
Ready.
```

If any context file is missing or empty, note it by name and continue.
Do not ask the user to provide them.

---

## Project

**Name:** AI-Builder-Template
**Repo:** https://github.com/pascaljb/AI-Builder-Template
**Supabase project:** [SUPABASE_PROJECT_URL]

---

## Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + Radix UI Themes
- **Icons:** Phosphor Icons (@phosphor-icons/react)
- **State:** Zustand with devtools + persist
- **Database:** Supabase (remote project, RLS enabled)
- **Auth:** Supabase Auth, state managed in Zustand
- **Package manager:** pnpm

---

## Architecture rules — always follow these

### Where things live
- UI logic → src/components/ui/ (no store access, no data fetching)
- Feature logic → src/components/features/ (store access, lib calls, no direct Supabase)
- Layout → src/components/layout/ (structure only)
- State → src/store/slices/ (one slice per domain, follow _template.ts)
- Database calls → src/lib/supabase/queries.ts or feature-scoped queries file
- Auth helpers → src/lib/supabase/auth.ts
- Utilities → src/lib/utils.ts
- Global types → src/types/index.ts
- Generated DB types → src/types/database.ts (never edit manually)
- Unit/component tests → co-located *.test.{ts,tsx} next to the file under test
- E2E tests → e2e/*.spec.ts
- Test utilities → src/test/ (setup, custom render, mocks)

### Hard rules
- No any without a // reason: comment
- No direct supabase calls outside src/lib/supabase/
- No set() in components — use named slice actions
- No hardcoded colours, spacing, or radius values — use Tailwind brand tokens
- No Tailwind gray-*, neutral-*, slate-* — use the tinted gray-* scale
- Use Phosphor Icons (@phosphor-icons/react) for all icons unless the user specifies otherwise
- No default exports except Next.js pages and layouts
- No file over 200 lines — split it
- All async functions have explicit return types
- Every data-fetching component handles loading, error, and empty states

### Naming
- Components: PascalCase.tsx
- Utilities / slices: camelCase.ts
- No barrel exports of multiple components from one file

---

## Skills available

| Trigger | Skill |
|---------|-------|
| First Figma URL in session | figma-extract-brand |
| "review this" / "review the feature" / "full audit" | code-review |
| "build [feature]" / "scaffold [feature]" | scaffold-feature |
| "add [entity] table" / "scaffold [entity]" | scaffold-supabase |
| "write copy for" / "improve this headline" / "critique my CTA" / "empty state copy" | copywriting |
| "test [thing]" / "write tests for" / "red/green" / "tdd" / "first run the tests" / "e2e [flow]" | tdd |
| End of session / "wrapping up" / "done for today" | session-end |

Skills live in .claude/skills/. Read the relevant SKILL.md before executing.

---

## Commands

```bash
pnpm dev           # start dev server (runs check-env first)
pnpm build         # brand:gen + next build
pnpm brand:extract # extract brand from Figma URL
pnpm brand:gen     # regenerate tailwind.config + theme.css + brand.md
pnpm db:types      # regenerate src/types/database.ts from Supabase
pnpm test          # run unit + component tests (Vitest)
pnpm test:watch    # run tests in watch mode
pnpm test:e2e      # run end-to-end tests (Playwright) — first run: pnpm exec playwright install chromium
pnpm test:all      # run all tests (Vitest + Playwright)
pnpm setup         # first-time project setup
```

---

## Current sprint / focus

See .claude/context/progress.md
