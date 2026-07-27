---
name: run
description: Launch and drive the project's real runtime surface. Use when asked to run, start, or screenshot the app, or to demonstrate a change outside tests.
---

# Run the app

Running means launching the actual application and interacting with the interface a user or consumer meets—not merely running tests or importing an internal function.

First look for a project-specific run or verification skill and follow it. Otherwise infer the supported launch path from the README, package scripts, Makefile, or equivalent project metadata.

Match the runtime surface:

- CLI: invoke the public command with representative input; capture stdout, stderr, and exit status.
- Server/API: start it safely, wait for readiness, call the affected endpoint, and inspect the response body.
- TUI: drive the terminal interaction and capture the resulting pane.
- GUI/web app: launch it, navigate and interact through an available browser or UI tool, and inspect a screenshot when visual behavior matters.
- Library/SDK: import the public package entrypoint from a consumer context and exercise the public API.

Launching without interaction proves only that the entrypoint resolves. Drive at least one meaningful flow. Keep long-lived processes isolated and clean them up. If setup required non-obvious commands, environment, or drivers, recommend capturing the working procedure as a project skill.
