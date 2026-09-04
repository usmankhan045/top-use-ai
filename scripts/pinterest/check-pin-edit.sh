#!/usr/bin/env bash
# PostToolUse hook: validate a Pinterest batch file after it is written.
#
# Reads the hook payload on stdin, and only acts when the edited file is a pin
# batch. Anything else exits silently so the hook is invisible during normal
# work. A rule violation is reported back to the model as additionalContext so
# it can fix the file rather than moving on.
set -uo pipefail

payload=$(cat)
file=$(printf '%s' "$payload" | jq -r '.tool_response.filePath // .tool_input.file_path // empty' 2>/dev/null)

case "$file" in
  *PINTEREST-BATCH-*.md) ;;
  *) exit 0 ;;
esac

repo=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
out=$(node "$repo/scripts/pinterest/validate-pins.js" "$file" 2>&1)

if [ $? -eq 0 ]; then
  exit 0
fi

# jq -Rs turns the report into a JSON string safely, whatever it contains.
printf '%s' "$out" | jq -Rs '{
  systemMessage: "Pin validation failed. See the report above.",
  hookSpecificOutput: {
    hookEventName: "PostToolUse",
    additionalContext: ("The pin file you just wrote violates docs/PINTEREST-PLAYBOOK.md. Fix these before continuing:\n\n" + . )
  }
}'
