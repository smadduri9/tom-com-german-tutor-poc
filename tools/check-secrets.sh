#!/usr/bin/env bash
# Blocks commits that would expose secrets or internal files.
# Used as a git pre-commit hook and in CI. Usage: tools/check-secrets.sh [--all]
#   (default) checks staged files; --all checks every tracked file.
set -euo pipefail

if [ "${1:-}" = "--all" ]; then
  files=$(git ls-files)
else
  files=$(git diff --cached --name-only --diff-filter=ACM)
fi
[ -z "$files" ] && exit 0

fail=0

# 1. Forbidden paths
bad_paths=$(printf '%s\n' "$files" | grep -E '(^|/)\.env($|\.)|(^|/)internal/|\.(pem|key|p8|p12|jks|keystore)$|google-services\.json$|GoogleService-Info\.plist$|service-account.*\.json$' | grep -v '\.env\.example$' || true)
if [ -n "$bad_paths" ]; then
  echo "BLOCKED: these files must never be committed:"
  printf '  %s\n' $bad_paths
  fail=1
fi

# 2. Secret-looking content (Google keys, private keys, GitHub/OpenAI/Anthropic/AWS tokens)
pattern='AIza[0-9A-Za-z_-]{35}|-----BEGIN [A-Z ]*PRIVATE KEY-----|gh[pousr]_[0-9A-Za-z]{36}|sk-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16}'
while IFS= read -r f; do
  [ -f "$f" ] || continue
  case "$f" in *.mp3|*.png|*.jpg|*.jpeg|*.ttf|*.otf) continue ;; esac
  if grep -EqI "$pattern" "$f"; then
    echo "BLOCKED: secret-like value found in $f (value not shown)"
    fail=1
  fi
done <<< "$files"

if [ "$fail" -ne 0 ]; then
  echo "Remove the file/value (and add it to .gitignore) before committing."
  exit 1
fi
echo "check-secrets: OK"
