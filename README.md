# pi-claude Recipe

A Git-backed Introspection (Pi) recipe that reproduces the **Claude Code** harness — system prompt, subagents, skills, and tools — as a runnable Pi coding agent. Use it as a starter template for building Claude-Code-style agents on the Pi runtime.

It is ported from the [Claude Code OSS](https://github.com/rolandgvc/claude-code-oss) harness (MIT) onto Pi's recipe format, following the same layout as the `nextplay-recipe` example.

## What This Is

An Introspection recipe is a package of runtime behavior. This repository contains:

- `.introspection/claude-code-agent.yaml`: the GitOps manifest Introspection discovers.
- `SYSTEM.md`: the Claude Code base system prompt shared by the agent.
- `agents/agent.yaml`: the default runnable agent (the Claude Code main agent).
- `agents/*.yaml`: the built-in subagents (Explore, Plan, general-purpose, verification, claude-code-guide, statusline-setup).
- `skills/`: reusable instruction bundles (e.g. `simplify`).
- `extensions/`: custom tools and runtime hooks (e.g. `todo_write`).

When you create a runtime from this repo, Introspection reads the manifest, pins the selected git commit, and launches the default agent from this recipe package.

## How It Maps to Claude Code

| Claude Code harness piece | Where it lives here |
|---|---|
| System prompt (`src/constants/prompts.ts`) | `SYSTEM.md` |
| Main agent + tool/delegation guidance | `agents/agent.yaml` |
| Built-in subagents (`src/tools/AgentTool/built-in/`) | `agents/explore.yaml`, `plan.yaml`, `general-purpose.yaml`, `verification.yaml`, `claude-code-guide.yaml`, `statusline-setup.yaml` |
| Bundled skills (`src/skills/bundled/`) | `skills/simplify/SKILL.md` |
| `Read`/`Write`/`Edit`/`Glob`/`Grep`/`Bash` tools | Pi built-ins: `read`, `write`, `edit`, `find`, `grep`, `bash` |
| `TodoWrite` tool | `extensions/claude-tools.ts` |
| `WebFetch` tool | `extensions/web-tools.ts` (native `fetch()`) |
| `WebSearch` tool | `extensions/web-tools.ts` (Parallel AI Search API; needs `PARALLEL_API_KEY`) |

Tool names in the prompts are mapped to Pi's tool names (`Read` → `read`, `Glob` → `find`, `Grep` → `grep`, `Bash` → `bash`, etc.). Ant-internal-only prompt sections, feature-flagged behavior, and internal skills (`verify`, `remember`, `stuck`) are intentionally omitted — they are gated off in external Claude Code builds.

## Repository Layout

```text
.introspection/
  claude-code-agent.yaml
README.md
SYSTEM.md
package.json
agents/
  README.md
  agent.yaml
  explore.yaml
  plan.yaml
  general-purpose.yaml
  verification.yaml
  claude-code-guide.yaml
  statusline-setup.yaml
skills/
  README.md
  simplify/
    SKILL.md
extensions/
  README.md
  claude-tools.ts
  web-tools.ts
```

## Customize

Edit these files first:

- `SYSTEM.md` for shared behavior and operating rules.
- `agents/agent.yaml` for model, tools, skills, subagents, and role instructions.
- `agents/*.yaml` for subagent behavior and tool scoping.
- `skills/` for reusable instruction bundles.
- `extensions/` for custom tools or runtime hooks.
