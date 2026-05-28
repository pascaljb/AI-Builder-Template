# AI-Builder-Template

**Build a real app by describing it to your AI agent.** You direct. It writes the code.

AI agents can write code. Left alone, they write *messy* code — untested,
inconsistent, and quick to break the moment you add the next feature. This
template gives your agent the structure it's missing: a working foundation, and
a set of rules it follows every time. You say what you want. It builds on solid
ground.

## What you get out of the box

- **User accounts and a private database.** Supabase handles sign-in, and each
  user only ever sees their own data. Already wired up.
- **A design system.** Your app looks considered from the first screen. Share a
  Figma file and your agent pulls in your exact colours and fonts — skip it and
  a polished default is ready to go.
- **Tests that prove it works.** Vitest and Playwright are set up so your agent
  can check its own work, not just hope.
- **Built-in agent skills.** The repo teaches your agent to write copy, review
  code, and pick up where you left off (see below).

## Start in one of two ways

You'll need [Node.js](https://nodejs.org), [pnpm](https://pnpm.io), and a free
[Supabase](https://supabase.com) account.

1. **Run one command.** `pnpm setup`, then start building.
2. **Hand it to your agent.** Open the repo in Claude Code and tell it to start
   your project. It reads the rules and takes it from there.

## The prompts that do the work

You don't need technical language. These plain instructions trigger the
built-in skills:

| When | Type this | What your agent does |
|------|-----------|----------------------|
| Start of every session | **Load context** | Reads where you left off and picks up the thread. |
| Building a feature | end your prompt with **red green TDD** | Writes the test first, *then* the feature — so it works, and keeps working. |
| The wording feels off | **run copywriting skill** | Sharpens every button, message, and label. |
| Before you call it done | **run code review** | Audits the new code and cleans it up. |
| End of every session | **session-end** | Saves your progress so tomorrow starts where you stopped. |

> Rule of thumb: **Load context** first, **session-end** last. Everything in
> between is up to you.

## Your brand, your way

- **Have a Figma file?** Drop its URL into a session. Your agent extracts your
  colours and type into the design system automatically.
- **Don't?** The template ships with a complete default — a brand colour, tinted
  greys, status colours for toasts and errors, and a type scale — so nothing
  looks half-finished while you build.

## Handy commands

The full list lives in [`CLAUDE.md`](./CLAUDE.md). The ones you'll reach for:

```bash
pnpm setup   # first-time setup
pnpm dev     # run your app locally
pnpm test    # check everything still works
```
