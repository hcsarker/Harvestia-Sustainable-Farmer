# Supabase Deploy Notes (RLS + Edge Function)

This project ships with Postgres-ready SQL for Row Level Security (RLS) and policies, but some workspace parsers flag RLS/Policy DDL. Apply the DDL in your Supabase project using the SQL editor.

## 1) Extensions

Enable the `pgcrypto` extension:

- Go to Supabase Console → Database → Extensions
- Search for `pgcrypto` and enable it

## 2) Create tables (migrations)

- Run the base migrations from `supabase/migrations/20250916120000_backend_expansion.sql` (already parser-friendly).

## 3) Enable RLS + Policies

Open `supabase/migrations/20250916121500_rls_and_policies.sql` and copy the statements into Supabase SQL Editor, then:

- Uncomment the lines to:
  - `alter table ... enable row level security;`
  - `drop policy if exists ...;`
  - `create policy ...;`
- Execute the script. This will:
  - Allow public SELECT on `nasa_data_cache` but only service role can INSERT/UPDATE/DELETE
  - Allow users to read/write only their own rows in `story_progress`, `quiz_attempts`, `simulation_runs`, `simulation_weeks`, `user_achievements`, `user_certificates`
  - Expose read-only `achievements` and `certificates` to the public; service role can write
  - Restrict `rate_limits` writes to service role and allow users to read their own rows

If you prefer, you can paste and run the policies table-by-table.

## 4) Install CLI (optional) and link project

If you want to deploy from your local environment instead of the Dashboard UI, install the Supabase CLI and link your project.

Install (one option):

```bash
npm i -g supabase
```

Authenticate and link:

```bash
supabase login
supabase link --project-ref <your-project-ref>
```

## 5) Edge Function env vars

Set environment variables for your Edge Functions (`nasa-data`, `quiz-handler`, and `admin-quiz`):

- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY ← required for privileged writes (cache, rate limits, admin CRUD)
- ADMIN_EMAILS ← required by admin-quiz (comma-separated emails allowed to perform admin actions)

Deploy/redeploy the functions after setting envs.

### Set envs (CLI)

You can set these via the Supabase UI or CLI. Example with CLI (adjust project ref):

```bash
# Minimal for public-only flows
supabase functions secrets set \
  SUPABASE_URL=your-url \
  SUPABASE_ANON_KEY=your-anon \
  --project-ref your-project-ref

# With privileged operations
supabase functions secrets set \
  SUPABASE_URL=your-url \
  SUPABASE_ANON_KEY=your-anon \
  SUPABASE_SERVICE_ROLE_KEY=your-service \
  --project-ref your-project-ref

# Admin allow list for admin-quiz
supabase functions secrets set \
  ADMIN_EMAILS="admin1@example.com,admin2@example.com" \
  --project-ref your-project-ref
```

### Redeploy the edge function

From repo root:

```bash
supabase functions deploy nasa-data --project-ref your-project-ref
supabase functions deploy quiz-handler --project-ref your-project-ref
supabase functions deploy admin-quiz --project-ref your-project-ref
```

## 6) Quick verification

- Health check endpoints:

```bash
curl -s https://<your-ref>.supabase.co/functions/v1/nasa-data | jq
curl -s -H "Content-Type: application/json" -d '{"action":"ping"}' https://<your-ref>.supabase.co/functions/v1/quiz-handler | jq
curl -s -H "Authorization: Bearer <anon-or-service>" -H "apikey: <anon-or-service>" -H "Content-Type: application/json" -d '{"action":"ping"}' https://<your-ref>.supabase.co/functions/v1/admin-quiz | jq

For admin-quiz, also set:

- ADMIN_EMAILS: comma-separated admin emails that are allowed to perform quiz CRUD via the function
```

Should return something like:

```json
{ "ok": true, "env": { "url": true, "anon": true, "service": true } }
```

- Invoke POWER fetch (replace ref and keys):

```bash
curl -s \
  -H "Authorization: Bearer <anon-or-service-key>" \
  -H "apikey: <anon-or-service-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "dataType": "NASA_POWER",
    "latitude": 23.8103,
    "longitude": 90.4125
  }' \
  https://<your-ref>.supabase.co/functions/v1/nasa-data | jq '.parameters, .data.daily_data[0:2]'
```

- First call should fetch from NASA POWER and cache a row in `nasa_data_cache` with a 6‑hour expiry
- Subsequent calls should hit the cache until `expires_at`

## 7) Notes

- Service role bypasses RLS. We use it server-side only (edge function) for operational tables like `nasa_data_cache` and `rate_limits`.
- Clients should not write to those tables directly; they read data via the edge function.
- Keep `RLS` enabled on user tables to protect user data.

## 8) Troubleshooting

- If you see 500 from the function, hit the health endpoint to confirm envs are present.
- If POWER calls rate-limit, ensure `rate_limits` policies are applied and the function is authorized with the service role.
- If cache reads fail for anon clients, confirm public SELECT policy on `nasa_data_cache` is in place.
