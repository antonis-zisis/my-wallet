#!/usr/bin/env bash

# Format the edited file with prettier.
# On success, silent (prettier --write fixes the file in place — no finding to report).
# On failure (syntax error, config problem), surface on stderr so Claude knows.

set -uo pipefail

PROJECT_ROOT="/home/antonis/source/my-wallet"

file=$(jq -r '.tool_input.file_path // empty' 2>/dev/null)
[[ -n "$file" ]] || exit 0
[[ "$file" =~ \.(ts|tsx)$ ]] || exit 0
[[ -f "$file" ]] || exit 0

output=$(pnpm --prefix "$PROJECT_ROOT" exec prettier --write "$file" 2>&1)
status=$?

if [[ $status -ne 0 ]]; then
  echo "[format-hook] prettier failed on $file:" >&2
  echo "$output" >&2
  # Exit 0, not 2: a formatting failure shouldn't block — but Claude should see it.
  # If you'd rather block on this (e.g. syntax errors), change to: exit 2
fi

exit 0
