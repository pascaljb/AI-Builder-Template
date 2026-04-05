# Architecture decisions

This file is append-only. Written by session-end skill.
Every 5 entries, a rolling summary is prepended by Claude.

---

## [date] — Initial stack selection
**Decision:** Next.js 14 App Router + TypeScript + Tailwind + Radix + Zustand + Supabase
**Reasoning:** Proven stack for high-fidelity prototypes that can scale to production.
Fast to build with, well-typed end-to-end, good Supabase DX.
**Alternatives considered:** Remix (less ecosystem), Vite SPA (no SSR), Prisma (more overhead than Supabase for prototyping)
**Implications:** App Router patterns throughout. No Pages Router. Server components where appropriate.
