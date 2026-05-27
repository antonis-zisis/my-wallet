---
name: security-review
description: Fast security review of the current changes (diff-scoped). Delegates to the security-reviewer agent. Use after finishing a feature, fixing a bug, or before committing, when you want a quick check that the change didn't introduce a vulnerability.
allowed-tools: Task
---

Invoke the `security-reviewer` subagent to review the current changes.

Scope:

- If `$ARGUMENTS` is empty, review all changed files (staged → unstaged → last commit, in that order — the agent handles this).
- If `$ARGUMENTS` is non-empty, treat it as scope guidance and pass it to the agent verbatim (e.g. "focus on apps/server/src/resolvers", "just the new mutation", "the last two commits").

Pass the scope guidance to the agent so it knows whether to override its default file-detection.

Return the agent's verdict as-is. Do not summarise or filter — the reviewer's output format is already concise. If the verdict line starts with `VERDICT: clean`, you can add a single sentence of acknowledgement; otherwise surface the findings verbatim so the user can act on them.
