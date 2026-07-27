# Claude Template

A starter template inspired by Claude Code.

## Quickstart

Install Pi and the Recipes extension once per machine:

```bash
pi install npm:@introspection-ai/recipes
```

Then clone and run the recipe:

```bash
git clone https://github.com/introspection-recipes/pi-claude
cd pi-claude
pi --recipe . --agent agent
```

`WebSearch` additionally requires `PARALLEL_API_KEY`.

## What's included

| Path | Purpose |
| --- | --- |
| `SYSTEM.md` | Shared Claude-style coding behavior |
| `agents/agent.yaml` | Lead coding agent and its tool surface |
| `agents/*.yaml` | Explore, plan, general-purpose, verification, Claude guide, and status-line subagents |
| `extensions/claude-tools.ts` | Structured user questions, plan approval, and task tools |
| `extensions/web-tools.ts` | `WebFetch` and Parallel-backed `WebSearch` |
| `skills/` | Simplify, code review, security review, run, and verify workflows |

Current Claude Code uses `TaskCreate`, `TaskGet`, `TaskList`, and `TaskUpdate`
instead of `TodoWrite` by default. User questions and approvals use the
[portable Recipes interaction contract](https://pi.recipes/docs/interactions).

Prompt and skill behavior is adapted from the
[Piebald Claude Code system prompt snapshot](https://github.com/Piebald-AI/claude-code-system-prompts).

## Make it yours

Everything is ordinary source that can be edited directly. Start with:

- `SYSTEM.md` for shared behavior.
- `agents/agent.yaml` for models, tools, skills, and subagents.
- `agents/*.yaml` for specialized agent behavior.
- `skills/` for reusable workflows.
- `extensions/` for tools and runtime hooks.

Validate changes with:

```bash
npm run check
```

Recipe format, agent, MCP, interaction, and deployment documentation is at
[pi.recipes/docs](https://pi.recipes/docs).
