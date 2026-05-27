#!/usr/bin/env bash

# Fast security check on the edited file.
# Runs semgrep + gitleaks on the single changed file.
#
# Exit policy:
#   - semgrep findings → surface on stderr, exit 0 (don't block — too noisy)
#   - gitleaks findings → surface on stderr, exit 2 (block — committed secrets are unrecoverable)
#   - tool missing or other error → log on stderr, exit 0
#
# This is the cheapest layer of the security stack:
#   - hook (this file)         → every edit, single file, deterministic only
#   - security-reviewer agent  → on demand, diff-scoped, triages
#   - security-auditor agent   → on demand, whole repo, deep analysis

set -uo pipefail

PROJECT_ROOT="/home/antonis/source/my-wallet"

file=$(jq -r '.tool_input.file_path // empty' 2>/dev/null)
[[ -n "$file" ]] || exit 0

# Only scan source files. Skip docs, configs, lockfiles, tests.
[[ "$file" =~ \.(ts|tsx|js|jsx)$ ]] || exit 0
[[ "$file" =~ \.(test|spec)\.(ts|tsx|js|jsx)$ ]] && exit 0
[[ "$file" =~ /__tests__/ ]] && exit 0
[[ "$file" =~ /node_modules/ ]] && exit 0
[[ "$file" =~ /dist/ ]] && exit 0
[[ "$file" =~ /build/ ]] && exit 0

[[ -f "$file" ]] || exit 0

secret_found=0
sast_found=0

# ---- gitleaks (secret scan — BLOCKING on hit) ----
if command -v gitleaks >/dev/null 2>&1; then
  gitleaks_out=$(
    gitleaks detect \
      --no-banner \
      --no-git \
      --source "$file" \
      --report-format json \
      --report-path /dev/stdout \
      2>/dev/null
  )
  if [[ -n "$gitleaks_out" && "$gitleaks_out" != "[]" && "$gitleaks_out" != "null" ]]; then
    echo "[security-hook] SECRET DETECTED in $file — blocking." >&2
    echo "$gitleaks_out" >&2
    echo "[security-hook] Remove the secret, rotate it if it was ever real, and add to .env (gitignored)." >&2
    secret_found=1
  fi
else
  echo "[security-hook] gitleaks not installed — skipping secret scan. Install: brew install gitleaks." >&2
fi

# ---- semgrep (SAST — non-blocking) ----
if command -v semgrep >/dev/null 2>&1; then
  semgrep_out=$(
    semgrep \
      --config p/security-audit \
      --config p/typescript \
      --config p/react \
      --severity ERROR --severity WARNING \
      --quiet --error \
      --timeout 10 \
      "$file" 2>/dev/null
  )
  if [[ -n "$semgrep_out" ]]; then
    echo "[security-hook] semgrep findings in $file (non-blocking — review or run /review):" >&2
    echo "$semgrep_out" >&2
    sast_found=1
  fi
else
  echo "[security-hook] semgrep not installed — skipping SAST. Install: brew install semgrep (or pipx install semgrep)." >&2
fi

# Block on secrets only.
if [[ $secret_found -eq 1 ]]; then
  exit 2
fi

exit 0
