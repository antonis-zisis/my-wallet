---
name: security-audit
description: Deep security audit of the project. Slow and thorough — runs scanners across the whole repo and triages findings. Use before releases, after large refactors, or when establishing a baseline. Not for routine post-edit review (use /review for that).
disable-model-invocation: true
allowed-tools: Task
---

Invoke the `security-auditor` subagent to perform a full security audit.

Scope:

- If `$ARGUMENTS` is empty, audit the whole repository.
- If `$ARGUMENTS` is non-empty, treat it as a scope restriction (e.g. "apps/server", "the GraphQL layer", "auth and validation only") and pass it to the agent.

Before delegating, briefly tell the user the audit is starting and that it will take several minutes — scanners need to run across the codebase and findings need to be triaged. This sets expectations so they don't think the session is stuck.

Return the agent's report as-is. The auditor's output format (Summary / Findings / Dismissed / Verified clear) is designed to be read directly — do not re-summarise or filter. If you need to add anything, add only a one-line pointer at the end suggesting next steps (e.g. "Run /review after applying fixes, or re-run /audit before release.").
