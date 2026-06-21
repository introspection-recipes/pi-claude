# Skills

Skills are reusable instruction bundles the agent can load when a task needs specific behavior, and that users can invoke as `/<skill-name>`.

Add a skill as a directory with a `SKILL.md` file containing frontmatter:

```text
skills/
  simplify/
    SKILL.md
```

```markdown
---
name: simplify
description: One-line summary used to decide when to load the skill.
---

# Skill body / prompt...
```

Then reference the skill by `name` from an agent's `skills:` list in `agents/*.yaml`.

## Included

| Skill | Purpose |
|---|---|
| `simplify` | Review changed code for reuse, quality, and efficiency, then fix issues. |

> Claude Code's internal-only bundled skills (`verify`, `remember`, `stuck`, etc.) are gated off in external builds and are omitted here. Add your own following the format above.
