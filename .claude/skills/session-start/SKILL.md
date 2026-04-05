# Skill: session-start

## Trigger

Fires automatically at the start of every Claude Code session.
This is defined in CLAUDE.md and requires no user input to activate.

## What to do

1. Read `.claude/context/brand.md`
2. Read `.claude/context/decisions.md`
3. Read `.claude/context/session.md`
4. Read `.claude/context/progress.md`

If any file is missing, note it by name and continue — do not stop or ask.

5. Respond with exactly this format (no more, no less):

```
Context loaded. Here's where we are:
[1 sentence from session.md describing what was last being worked on]
[1 sentence from progress.md describing what comes next]
Ready.
```

## Rules

- Do this silently — no narration about loading files, no "I'm now reading..."
- The confirmation message is the only output from this skill
- Do not summarise the brand, decisions, or full progress list — one sentence each
- If session.md is empty or missing: "No previous session recorded."
- If progress.md is empty or missing: "No progress file found — create one when we define the first feature."
- Keep the total confirmation to 4 lines maximum
