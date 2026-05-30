#!/usr/bin/env bash

# Lint the edited file with eslint.
# Scopes to the single changed file (fast, focused signal).
# Routes output to stderr and exits 2 on lint errors so Claude sees and reacts.

set -uo pipefail

PROJECT_ROOT="${CLAUDE_PROJECT_DIR:-$(git -C "$(dirname "$0")" rev-parse --show-toplevel)}"

file=$(jq -r '.tool_input.file_path // empty' 2>/dev/null)
[[ -n "$file" ]] || exit 0
[[ "$file" =~ \.(ts|tsx|js|jsx)$ ]] || exit 0
[[ -f "$file" ]] || exit 0

# Run eslint directly on the single file.
# --max-warnings 0 makes warnings count as failures too; drop the flag if too strict.
output=$(pnpm --prefix "$PROJECT_ROOT" exec eslint --max-warnings 0 "$file" 2>&1)
status=$?

if [[ $status -ne 0 ]]; then
  echo "[lint-hook] eslint errors in $file:" >&2
  echo "$output" >&2
  exit 2
fi

exit 0
