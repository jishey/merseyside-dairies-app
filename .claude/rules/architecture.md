# Architecture Rules

## Critical Rules (Apply to Every File)
- TypeScript strict mode -- no `any` types, no implicit returns
- One component per file -- each component does one thing well
- No dead code -- if it's not used, delete it
- All types in `types/database.ts` -- must match Supabase schema exactly

## Data Flow
- All data comes from Supabase via `lib/supabase/client.ts` (client components) or `lib/supabase/server.ts` (server components/API routes)
- No mock data in production code
- Milkman auth state: React context (no persistent login -- they share a device)
- Admin auth state: React context
- URL params for navigation (which milkman, which date)

## Error Handling
- Use Result pattern where possible: `{ data, error }` not try/catch everywhere
- Every Supabase query checks for errors
- User-facing errors are friendly and simple ("Something went wrong, try again")
- Never expose stack traces or internal paths to the client
- Government APIs / external services: N/A for this project

## State Management
- Server state: Supabase (standard queries, no real-time subscriptions needed)
- Client state: React useState/useReducer for UI state
- No global state library -- React Context for auth state, lift state to nearest common parent for everything else
- URL state for navigation: which milkman (`/clipboard/[id]`), which admin page

## Component Architecture
- **Shared components** (Phone, Page, Btn, BackBtn, Stepper, NumPad, PinDots, StatusBadge, BottomNav, ClipboardWrapper) live in `src/components/`
- **Page components** live in `src/app/` following Next.js App Router conventions
- Shared components are NEVER defined inside page component functions -- this causes remount flicker
- Each page component imports what it needs from `src/components/`

## Performance
- This is a simple app used on depot WiFi -- no heavy optimisation needed
- Keep bundle size small (no unnecessary libraries)
- Stepper local draft pattern prevents unnecessary re-renders during typing
- Images: only the logo, loaded from merseysidedairies.co.uk

## File Organisation
- One component per file, named after the component (PascalCase)
- Utility functions in `lib/helpers.ts`
- Anomaly detection logic in `lib/anomaly.ts`
- Supabase clients in `lib/supabase/`
- All types in `types/database.ts`
