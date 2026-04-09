# Supabase Rules

## Project Details
- **Project**: MerseysideDairies
- **Region**: eu-west-2 (London)
- **Account**: John Isherwood (jishey@gmail.com)
- **URL**: https://lngshsqdnszrpkzzosdz.supabase.co
- **Free tier**: $0/month

## Client Setup
- `lib/supabase/client.ts` -- browser client using `createBrowserClient` from `@supabase/ssr`
- `lib/supabase/server.ts` -- server client using `createServerClient` from `@supabase/ssr` (for API routes and server components)
- Use the browser client for all client components (milkman clipboard, admin pages)
- Use the server client for API routes only

## Auth Strategy
This app does NOT use Supabase Auth. Authentication is handled at the application level:
- Milkmen: PIN checked against milkmen table
- Admin: password checked against settings table
- All database queries use the anon key with RLS policies controlling access

## Query Patterns
- Always check for errors: `const { data, error } = await supabase.from('table').select()`
- Use `.single()` when expecting exactly one row
- Use `.maybeSingle()` when the row might not exist
- Always handle the error case before using data
- Use `.eq()`, `.gte()`, `.lte()` for filtering -- never string interpolation in queries
- Use `.upsert()` for clipboard entries (unique constraint on milkman_id + product_id + date)

## Table Conventions
- All tables use uuid primary keys (auto-generated)
- Timestamps are `timestamptz` (with timezone)
- Dates are `date` type (no time component) for clipboard_entries, absences, etc.
- Boolean fields default to false
- Unique constraints enforce one clipboard entry per milkman per product per day

## Migrations
- One migration file per prompt/feature
- Migration files go in `supabase/migrations/` directory
- Name format: `YYYYMMDDHHMMSS_description.sql`
- Always test migrations locally before applying
- Seed data (7 milkmen, 6 products, default settings) goes in the initial migration

## RLS Policies
Basic policies for a single-company app:
- `milkmen`: SELECT for anon (welcome screen needs it), INSERT/UPDATE via API routes
- `products`: SELECT for anon, INSERT/UPDATE/DELETE via API routes
- `clipboard_entries`: SELECT/INSERT/UPDATE for anon (milkmen fill these in directly)
- `clipboard_status`: SELECT/INSERT/UPDATE for anon
- `fridge_counts`: SELECT/INSERT/UPDATE for anon (admin fills in, but no auth distinction at DB level)
- `stock_targets`: SELECT for anon, INSERT/UPDATE via API routes
- `orders`, `order_items`: SELECT/INSERT for anon
- `day_status`: SELECT/INSERT/UPDATE for anon
- `settings`: SELECT for anon, UPDATE via API routes
- `absences`: SELECT/INSERT/UPDATE/DELETE for anon

## Common Pitfalls
1. **Don't forget .eq() filters.** A bare `.select()` returns all rows. Always filter by date, milkman_id, etc.
2. **Date strings must match format.** Use `YYYY-MM-DD` format for date columns. The `dateStr()` helper in `lib/helpers.ts` produces this.
3. **Upsert needs the conflict columns.** For clipboard_entries: `.upsert(data, { onConflict: 'milkman_id,product_id,date' })`.
4. **Stock targets use day abbreviations.** 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' -- lowercase, 3 letters.
5. **Order calculator queries TOMORROW's day.** Calculate tomorrow's date first, then look up targets for that day of week.
