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
| `simplify` | Review changed code for reuse, simplification, efficiency, and abstraction altitude, then fix safe cleanup issues. |
| `code-review` | Find concrete correctness bugs and regressions in a diff without applying fixes. |
| `security-review` | Report high-confidence exploitable vulnerabilities introduced by a diff. |
| `run` | Launch and drive the project's real runtime surface. |
| `verify` | Exercise a change end-to-end and capture behavioral evidence plus an adversarial probe. |

These are the portable coding-focused subset of Claude Code's bundled skills. Claude-hosted, UI-internal, or runtime-specific skills such as `doctor`, `loop`, design sync, and usage diagnostics are intentionally omitted because the Pi recipe cannot faithfully provide their host capabilities.
