# Skills — contract and index

Every skill in this directory follows this contract.
Do not create a skill that deviates from this shape.

---

## Skill contract

Every SKILL.md must contain these sections in order:

### 1. Persona (optional but recommended)
Who Claude is when executing this skill. One paragraph.
Be specific — generic "helpful assistant" personas produce generic output.

### 2. Trigger patterns
A table of phrases/conditions that activate this skill.
Be precise enough that the wrong skill doesn't fire.

### 3. What to do
Step-by-step instructions. Numbered. Explicit.
If a step involves reading a file, name the file.
If a step involves writing a file, specify the path.
If a step involves calling a tool (Figma MCP, Supabase CLI), name it.

### 4. Output format
Exactly what the response should look like.
Include example structure if the output is complex.

### 5. Edge cases (optional)
Specific conditions that change the behaviour.
Only include if genuinely different from the happy path.

---

## Skills index

| Skill | Trigger | Writes to |
|-------|---------|-----------|
| figma-extract-brand | First Figma URL in session | brand.config.ts, .claude/context/brand.md |
| session-start | Start of every session | (reads only) |
| session-end | "wrapping up" / "done for today" | .claude/context/session.md, decisions.md, progress.md |
| scaffold-feature | "build [feature]" / "scaffold [feature]" | src/components/features/, src/store/slices/ |
| scaffold-supabase | "add [entity] table" / "scaffold [entity]" | supabase/migrations/, src/lib/supabase/queries.ts, src/types/ |
| code-review | "review this" / "review the feature" / "full audit" | (reads only, fixes inline) |

---

## Rules for all skills

1. Read the relevant SKILL.md fully before starting execution
2. Never partially execute a skill — complete it or explain why you stopped
3. If a skill requires a file that doesn't exist, create it with sensible defaults
4. Skills that write files always show a summary of what was written
5. Skills do not overlap — if two skills could fire, pick the more specific one
