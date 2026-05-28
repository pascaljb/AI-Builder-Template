# AI Builder Template

An opinionated Next.js + Supabase + Claude Code starter for shipping AI-built apps. Clone it, run one script, and you're away.

> If you're not an engineer, trying to ship AI-built apps that don't feel held together with string, this is a decent place to start.

## What you get

- **Next.js 14 App Router** with TypeScript in strict mode
- **Supabase** wired up end to end — auth, RLS-on-by-default migrations, typed queries
- **Tailwind + Radix UI** with a brand-token system that extracts colors and type from a Figma file
- **Zustand** for state, with devtools and persist baked in
- **Vitest + React Testing Library** for unit and component tests
- **Playwright** for E2E, with a setup that just works
- **Claude Code context system** — `CLAUDE.md`, project skills, and a session/progress log so your AI assistant always knows where you left off
- **`pnpm setup`** — one script that asks for your project name, Supabase keys, and Figma URL, then has you ready to build

## Quick start

```bash
# Use the GitHub "Use this template" button, or:
gh repo create my-app --template pascaljb/vibe-template
cd my-app

pnpm setup        # walks through project name + Supabase + Figma
pnpm dev          # start building
```

## The stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + Radix UI |
| Icons | Phosphor |
| State | Zustand (devtools + persist) |
| Database | Supabase (RLS on by default) |
| Auth | Supabase Auth |
| Package manager | pnpm |
| Unit tests | Vitest + Testing Library |
| E2E tests | Playwright |
| AI assistant | Claude Code |

## How it works with Claude Code

The `.claude/` directory is the part that took the longest to get right. It contains:

- `CLAUDE.md` — auto-loads context at every session start, so Claude knows the stack, the rules, and where things go
- `.claude/context/` — `brand.md`, `decisions.md`, `progress.md`, `session.md`. Read first thing every session
- `.claude/skills/` — opinionated skills for scaffolding features, scaffolding Supabase tables, writing tests TDD-style, doing code reviews, writing copy, and ending sessions cleanly

The result: Claude doesn't ask where things go. It already knows.

## Architecture rules

A few hard rules the codebase (and the AI) follows:

- UI components live in `src/components/ui/` — no store access, no data fetching
- Feature components live in `src/components/features/` — store access and lib calls, but no direct Supabase
- All Supabase calls live in `src/lib/supabase/` — never outside
- No `any` without a `// reason:` comment
- No file over 200 lines
- No hardcoded colours, spacing, or radius — Tailwind brand tokens only
- Every data-fetching component handles loading, error, and empty states

Full rules in `CLAUDE.md`.

## Commands

```bash
pnpm dev           # start dev server (checks env first)
pnpm build         # regen brand tokens + build
pnpm test          # unit + component (Vitest)
pnpm test:e2e      # E2E (Playwright)
pnpm test:all      # everything
pnpm brand:extract # extract brand tokens from a Figma URL
pnpm db:types      # regenerate Supabase types
```

## License

MIT — do whatever you want with it.

---

Built by [Pascal Barry](https://www.linkedin.com/in/pascal-barry-9141b3123/).
