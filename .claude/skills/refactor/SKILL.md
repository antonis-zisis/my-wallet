---
name: refactor
description: Produce a structured refactor plan for a file or directory against this project's architecture and testing rules. Read-only — outputs a plan, does not edit. Use when the user asks to plan a refactor, audit a file's structure, or check if a hook/component/resolver needs splitting.
disable-model-invocation: true
allowed-tools: Task
---

Invoke the `refactor-planner` subagent to plan the refactor.

Scope:

- `$ARGUMENTS` must be a path (file or directory) inside `apps/`. Pass it verbatim to the agent as its first user message.
- If `$ARGUMENTS` is empty, ask the user which file or directory to plan before invoking the agent.
- Extra text after the path (e.g. "focus on the analytics") is also passed verbatim as scope guidance.

Return the agent's plan as-is. The output format (`PLAN:` line + Violations / Splits / Extractions / Test plan / Order of operations / Risks) is designed to be read directly — do not re-summarise or filter.

If the plan ends with `clean`, a one-sentence acknowledgement is fine. Otherwise surface the plan verbatim so the user can approve it or tweak it before any edits happen.

The agent never edits files. After the user approves the plan, applying it is a separate step (Claude Code in normal mode, with the plan as context).
