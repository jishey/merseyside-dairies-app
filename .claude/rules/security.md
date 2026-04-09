# Security Rules

## Overview
This is a single-company internal tool used at a milk depot. Security is moderate -- no sensitive personal data, no financial transactions, no multi-tenant isolation. But basic hygiene still applies.

## API Keys & Secrets
- NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY: these are public (by design in Supabase)
- SUPABASE_SERVICE_ROLE_KEY: if used, server-side only (API routes). Never in client code.
- All secrets in .env.local (gitignored)
- .env files MUST be in .gitignore

## Authentication

### Milkman Auth (PIN-based)
- No Supabase Auth -- milkmen share a physical device at the depot
- PIN verified against the milkmen table
- Session stored in React state/context only (no localStorage, no cookies)
- When app reloads or milkman logs out, they must re-authenticate
- PINs are 4 digits, stored in the database
- No rate limiting on PIN attempts needed (physical depot access required)

### Admin Auth
- Username/password stored in settings table (simple for v1)
- Admin state in React context
- Admin-only routes check for admin context -- redirect to login if missing
- Future: upgrade to proper Supabase Auth with email/password

## Row Level Security (RLS)
- RLS enabled on all tables as good practice
- Since this is single-company (no firm_id / tenant separation), RLS policies are simpler:
  - Anon role can SELECT from milkmen, products, settings (needed for PIN login and welcome screen)
  - Anon role can INSERT/UPDATE clipboard_entries, clipboard_status (milkmen filling in clipboards)
  - Admin operations (managing milkmen, products, settings, closing days) should use service role key via API routes where possible
- RLS is a safety net, not the primary auth mechanism for this app

## Input Validation
- Validate PIN is exactly 4 digits
- Validate stepper values are non-negative integers
- Validate product names/sizes are non-empty strings
- Clamp brought-back to taking-out value (business rule, not security, but enforced)
- No file uploads in this app
- No user-generated HTML content

## What This App Does NOT Need
- Multi-tenant isolation (single company)
- MFA (depot phone, not personal accounts)
- Session expiry (no persistent sessions)
- Audit logging (simple clipboard app)
- OWASP LLM protections (no AI)
- Content Security Policy headers (no user HTML)
- Rate limiting (physical access only)
