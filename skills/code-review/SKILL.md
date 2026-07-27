---
name: code-review
description: Review a diff for concrete correctness bugs and regressions. Use when the user asks for code review; do not apply fixes unless requested.
---

# Code review

Review the requested PR, branch, path, or working-tree diff. This is correctness review, not cleanup—that belongs to `simplify`.

## Establish scope

Prefer the full upstream branch diff. If no upstream exists, use the repository's default branch or the explicit target. Include uncommitted changes when the range diff is empty or the user asks to review current work. Read every hunk and the enclosing functions.

## Finder passes

For a non-trivial diff, run independent `general-purpose` review agents concurrently, partitioned by these angles. Otherwise perform the passes directly.

1. **Line-by-line:** For every changed line, identify the input, state, timing, or platform that could make it wrong. Check conditions, boundaries, nullability, async ordering, error paths, escaping, and copy-paste mistakes.
2. **Removed behavior:** For every deleted or replaced guard, validation, fallback, or test-covered behavior, locate where its invariant is re-established.
3. **Cross-file contracts:** Trace changed functions to callers and callees. Check preconditions, return shapes, exceptions, ordering, and compatibility.
4. **Language pitfalls:** Check the established traps of the language and framework used by the changed code.
5. **Wrappers and adapters:** When a cache, proxy, decorator, or adapter changes, verify that every method forwards to the correct instance and preserves the wrapped contract.

For each candidate, verify it against the actual code and remove speculative, pre-existing, stylistic, or test-only complaints. Findings need a realistic failure scenario; a theoretical possibility is not enough.

## Output

Lead with findings ordered by severity. Each finding must include the file and line, the broken behavior, and a concise reproduction or failure scenario. Then list unresolved questions and a short review summary. If there are no findings, say so and mention any verification gap. Do not edit code or post comments unless the user asked.
