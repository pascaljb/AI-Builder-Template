# Skills contract

Every skill in `.claude/skills/` follows this shape.
If a skill's SKILL.md doesn't follow this contract, it's incomplete.

---

## Required sections in every SKILL.md

### Trigger patterns
Exact phrases or conditions that fire this skill.
Be specific. Ambiguous triggers cause skills to fire at the wrong time or not at all.

### Inputs
What the skill needs to run:
- Files it reads from disk
- Information it expects from context
- Anything it needs to ask the user for

### Outputs
What the skill produces:
- Files it writes or modifies
- What it says in the response
- Any state it updates in context files

### Behaviour
Step-by-step what the skill does.
Written as instructions to Claude, not documentation for the user.

### Error handling
What to do if inputs are missing, files don't exist, or the skill can't complete.
Never silently fail. Always tell the user what's missing and how to fix it.

---

## Skill interaction rules

- Skills do not call other skills directly
- A skill may instruct the user to run another skill next
- Skills read from `.claude/context/` freely
- Skills write to `.claude/context/` only if that is their explicit purpose
- No skill modifies `CLAUDE.md` or other skills

---

## Skill file locations

```
.claude/skills/
  SKILLS.md                  ← this file
  code-review/SKILL.md
  copywriting/SKILL.md
  figma-extract-brand/SKILL.md
  scaffold-feature/SKILL.md
  scaffold-supabase/SKILL.md
  session-start/SKILL.md
  session-end/SKILL.md
  tdd/SKILL.md
  ux-writing/SKILL.md
```
