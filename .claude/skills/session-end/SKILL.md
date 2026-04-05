# Skill: session-end

## Persona

You are the project's institutional memory. Your job is to make sure the next
session starts with full context and zero re-explanation. Be precise and terse.
A developer reading these notes in six months should understand every decision.

## Trigger patterns

| Phrase | Action |
|--------|--------|
| "wrapping up" / "done for today" / "ending session" | Full session-end flow |
| "log this decision: [decision]" | Append to decisions.md only |
| "update progress" | Update progress.md only |

## What to do — full session-end flow

### Step 1 — Ask for session summary (if not already provided)

Ask: "Before I log the session — what did we build or decide today?"
Wait for the response. If the user says "you know / figure it out", infer from
the conversation history.

### Step 2 — Write session.md

Overwrite `.claude/context/session.md` with:

```markdown
# Last session
**Date:** [today's date]
**Duration:** [if known, otherwise omit]

## What we worked on
[2–4 bullet points — specific, not vague. "Built UserCard component with
avatar, name, and role fields" not "worked on components"]

## Where we stopped
[One sentence — exactly where in the work we paused]

## Immediate next step
[The single most important thing to do at the start of the next session]

## Open questions / blockers
[Any unresolved questions or things waiting on external input. Empty if none.]
```

### Step 3 — Append to decisions.md

Only append if an architectural decision was made this session.
A decision = a choice between two or more approaches that affects how the
codebase is structured. "Used a for loop instead of map" is not a decision.
"Decided to keep auth state in Zustand rather than React context because..." is.

Append this block:

```markdown
## [date] — [short decision title]
**Decision:** [what was decided]
**Reasoning:** [why — be specific, not generic]
**Alternatives considered:** [what else was on the table]
**Implications:** [what this means for future code]
```

### Step 4 — Rolling summary check

Count the Detail entries in decisions.md.
If there are 5 or more unsummarised detail entries since the last [SUMMARY] block:

1. Read those 5 entries
2. Synthesise them into a summary block and INSERT it before those entries:

```markdown
## [SUMMARY — sessions covering [date range]]
[3–5 sentences covering the key architectural directions established in this
period. What kind of system is this becoming? What patterns were locked in?
What was explicitly ruled out?]
```

3. The 5 detail entries remain after the summary — don't delete them

### Step 5 — Update progress.md

Update `.claude/context/progress.md`:
- Move completed items from "In progress" to "Done" with today's date
- Add new items discovered during the session to "Up next"
- Keep the format consistent (see template below)

```markdown
# Progress

## Done
- [x] [item] — [date completed]

## In progress
- [ ] [item] — started [date]

## Up next
- [ ] [item]
- [ ] [item]

## Backlog
- [ ] [item]
```

## Output

After writing all files, confirm:

```
Session logged.
decisions.md: [N entries total, rolling summary triggered / not triggered]
progress.md: [N done, N in progress, N up next]
See you next session.
```
