# Agents

Each `*.yaml` here is a Pi agent definition loaded via the `pi.agents` glob in `package.json`.

| Agent | Role | Model | Tools |
|---|---|---|---|
| `agent` | Default Claude Code main agent | opus | read, edit, write, grep, find, bash, todo_write, WebFetch, WebSearch |
| `Explore` | Fast read-only codebase search | haiku | read, grep, find, bash |
| `Plan` | Read-only architect / planning | inherit | read, grep, find, bash |
| `general-purpose` | Multi-step research and execution | inherit | full toolset |
| `verification` | Adversarial PASS/FAIL/PARTIAL verifier | inherit | read, grep, find, bash |
| `claude-code-guide` | Q&A on Claude Code / Agent SDK / Claude API | haiku | read, grep, find, WebFetch, WebSearch |
| `statusline-setup` | Configures the status line | sonnet | read, edit |

## Schema

```yaml
name: <agent name>            # also the subagent_type referenced by the agent tool
description: <when to use>     # surfaced to the parent agent for delegation decisions
model:                        # optional; omit to inherit the session/default model
  name: anthropic/claude-opus-4-6
  reasoning_effort: medium    # off | minimal | low | medium | high | xhigh
tools: [read, edit, write, grep, find, bash, todo_write]
skills: [simplify]            # skill names the agent may load
subagents: [Explore, Plan]    # subagents this agent may spawn (main agent only)
system_instructions:
  mode: replace | append      # replace = standalone prompt; append = add to SYSTEM.md
  content: |
    ...
```

The main `agent` uses `mode: append` so it inherits `SYSTEM.md` and adds role-specific guidance. The subagents use `mode: replace` because each ships a complete standalone system prompt.
