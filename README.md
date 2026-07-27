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
- `extensions/`: custom tools and runtime hooks (questions, plan approval, structured tasks, and web access).

When you create a runtime from this repo, Introspection reads the manifest, pins the selected git commit, and launches the default agent from this recipe package.

## How It Maps to Claude Code

| Claude Code harness piece | Where it lives here |
|---|---|
| System prompt (`src/constants/prompts.ts`) | `SYSTEM.md` |
| Main agent + tool/delegation guidance | `agents/agent.yaml` |
| Built-in subagents (`src/tools/AgentTool/built-in/`) | `agents/explore.yaml`, `plan.yaml`, `general-purpose.yaml`, `verification.yaml`, `claude-code-guide.yaml`, `statusline-setup.yaml` |
| Bundled skills (`src/skills/bundled/`) | `skills/simplify/SKILL.md` |
| `Read`/`Write`/`Edit`/`Glob`/`Grep`/`Bash` tools | Pi built-ins: `read`, `write`, `edit`, `find`, `grep`, `bash` |
| `AskUserQuestion` tool | `extensions/claude-tools.ts` via Pi's portable interaction contract |
| Plan approval interaction | `RequestPlanApproval` in `extensions/claude-tools.ts` |
| `TaskCreate` / `TaskGet` / `TaskList` / `TaskUpdate` | `extensions/claude-tools.ts` |
| `WebFetch` tool | `extensions/web-tools.ts` (native `fetch()`) |
| `WebSearch` tool | `extensions/web-tools.ts` (Parallel AI Search API; needs `PARALLEL_API_KEY`) |

Tool names in the prompts are mapped to Pi's tool names (`Read` → `read`, `Glob` → `find`, `Grep` → `grep`, `Bash` → `bash`, etc.). `TodoWrite` is intentionally absent: current Claude Code uses the four structured task tools by default.

Prompt and bundled-skill behavior is adapted from the [Piebald Claude Code system prompt snapshot](https://github.com/Piebald-AI/claude-code-system-prompts) for Claude Code **v2.1.220** (July 24, 2026). The recipe includes the portable coding-focused bundled skills: `simplify`, `code-review`, `security-review`, `run`, and `verify`. Claude-hosted or CLI-internal features are not represented by non-functional stubs.

## Interactions

`AskUserQuestion` and `RequestPlanApproval` use [`@introspection-ai/recipes/interactions`](https://pi.recipes/docs/interactions). The same recipe code works with Pi's terminal and RPC dialogs, deterministic headless behavior, and durable host pause/resume via `PI_INTERRUPT_RESUME`. Both tools are sequential because a host pause inside a parallel tool batch cannot be resumed safely.

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
  code-review/
    SKILL.md
  run/
    SKILL.md
  security-review/
    SKILL.md
  simplify/
    SKILL.md
  verify/
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

## Validating Locally

CI validates every push with [`pi-recipes-action`](https://github.com/introspection-org/pi-recipes-action). To run the same check before each commit, enable the bundled pre-commit hook once after cloning:

```bash
git config core.hooksPath .githooks   # or: npm install
```

Or run the check directly at any time:

```bash
npx -y -p @introspection-ai/pi-recipes@latest recipes check . --profile ci
```
