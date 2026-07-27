---
name: verify
description: Verify that a non-trivial code change works by exercising its real runtime surface and observing behavior, including at least one adversarial probe.
---

# Verify a change

Verification is runtime observation. Build and launch the app, drive the affected flow, and capture what happens. Tests and type checks are useful separate checks, but they do not substitute for this skill's end-to-end evidence.

Establish the complete change scope from the upstream branch diff, PR, uncommitted diff, or explicit user target. Identify the public surface that reaches the changed code: CLI, socket, UI, package export, agent behavior, or CI workflow. Internal import-and-call scripts are not end-to-end unless the project is itself a library and the import uses its public package boundary.

Use an existing project verification/run skill when present. Otherwise cold-start from project documentation and metadata. Do not exercise destructive publishing, deletion, messaging, or external writes without an explicitly safe target or dry-run.

Drive the smallest happy path that reaches the change, then probe an adjacent failure or boundary at the same surface: malformed or empty input, conflicting options, cancellation, repeated execution, stale state, concurrency, or another edge suggested by the diff.

Report:

- **Verdict:** PASS, FAIL, BLOCKED, or SKIP.
- **Claim:** What the change is supposed to do and any mismatch with the diff.
- **Method:** What was launched and how it was driven.
- **Steps:** Each real interaction and observed output, including at least one adversarial probe.
- **Findings:** Friction, surprises, environmental limitations, or defects noticed while running it.

PASS requires observed success at the real surface. FAIL means observed incorrect behavior or a material claim/diff mismatch. BLOCKED means the surface could not be reached and must name the exact obstacle. SKIP is only for a change with no runtime surface, such as docs-only or tests-only work.
