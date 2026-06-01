---
name: branch-review
description: Review the current branch (or a single file) against this project's house rules and architectural patterns. Manual gate before merge; delegates to the branch-reviewer agent.
disable-model-invocation: true
allowed-tools: Task
---

Invoke the `branch-reviewer` subagent to review the change.

Scope:

- If `$ARGUMENTS` is empty, review the whole branch against `main` and end with a verdict.
- If `$ARGUMENTS` is a path or file, treat it as a single-file audit (report-only, no verdict).
- Any other text is also passed verbatim as scope guidance (e.g. "focus on apps/server", "just the new resolver").

Return the agent's report as-is. The output format (`VERDICT:` line + Issues) is designed to be read directly — do not re-summarise or filter. If the verdict is `approve`, a single sentence of acknowledgement is fine; otherwise surface the findings verbatim so the user can act on them.
