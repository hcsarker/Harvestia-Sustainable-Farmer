#!/usr/bin/env bash
set -euo pipefail

# Generates Supabase TS types into src/integrations/supabase/types.generated.ts
# Requires: supabase CLI installed and SUPABASE_URL + SUPABASE_ANON_KEY or service role envs.

OUT="src/integrations/supabase/types.generated.ts"
mkdir -p "$(dirname "$OUT")"

if ! command -v supabase >/dev/null 2>&1; then
  echo "ERROR: supabase CLI not found. Install: https://supabase.com/docs/reference/cli" >&2
  exit 1
fi

echo "Generating types → $OUT"
# Example command; adjust schema filters as needed.
supabase gen types typescript \
  --project-id "${SUPABASE_PROJECT_ID:-}" \
  --schema public > "$OUT.tmp"

mv "$OUT.tmp" "$OUT"
echo "Done."
