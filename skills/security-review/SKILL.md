---
name: security-review
description: Perform a focused, read-only security review of pending code changes and report only concrete, exploitable vulnerabilities with high confidence.
---

# Security review

Review only security implications introduced by the requested diff. Do not modify files.

First understand the repository's trust boundaries, authentication model, validation libraries, and established secure patterns. Then trace changed data from untrusted inputs to sensitive sinks.

Prioritize concrete injection, path traversal, unsafe deserialization, authentication or authorization bypass, privilege escalation, credential exposure, cryptographic misuse, XSS through explicitly unsafe rendering, and sensitive-data leakage.

Exclude style concerns, generic hardening advice, dependency-version findings, denial of service and resource exhaustion, documentation and test-only files, and issues without a specific attacker-controlled path. Environment variables and CLI flags are trusted unless this project explicitly treats them as untrusted.

For every candidate, attempt to disprove it by checking upstream validation, framework escaping, authorization middleware, call sites, and actual reachability. Report only high-confidence findings.

Each finding must include file and line, severity, category, description, concrete exploit scenario, confidence, and a focused remediation. If nothing qualifies, say that no high-confidence vulnerabilities were found and state what was not verified dynamically.
