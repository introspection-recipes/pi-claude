---
name: simplify
description: Review changed code for reuse, simplification, efficiency, and abstraction-level issues, then apply safe cleanup fixes. Do not use it to hunt correctness bugs.
---

# Simplify

Improve the quality of changed code without changing intended behavior. Correctness review belongs to the `code-review` skill.

## Gather the change

Use the full branch diff when available and include uncommitted changes. If there is no diff, use the files or target named by the user. Do not silently expand beyond that scope.

## Review from four independent angles

Launch four `general-purpose` agents concurrently when the agent tool is available. Give each the same diff and one angle. Ask for findings with `file`, `line`, a one-line summary, and the concrete maintenance or runtime cost.

1. **Reuse:** Find existing helpers, utilities, and abstractions that replace newly duplicated logic.
2. **Simplification:** Find redundant state, parameter sprawl, copy-paste variants, leaky abstractions, stringly typed code, unnecessary nesting, and comments that narrate what obvious code does.
3. **Efficiency:** Find duplicate computation or I/O, avoidable serialization, missed safe concurrency, hot-path bloat, recurring no-op updates, leaks, and overly broad reads.
4. **Altitude:** Find local special cases that should be expressed once at an existing boundary or abstraction, without inventing a speculative framework.

If delegation is unavailable, run the same four passes yourself.

## Apply

Deduplicate overlapping findings and apply each safe cleanup directly. Skip changes that could alter behavior, require broad out-of-scope work, or are false positives. Finish with a short summary of fixes and skips, or say the code was already clean.
