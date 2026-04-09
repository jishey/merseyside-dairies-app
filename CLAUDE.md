# Merseyside Dairies Clipboard App

## What This Is
Mobile-first web app replacing paper clipboards at a milk delivery depot in Merseyside, UK. 7 milkmen (all in their 60s) fill in daily delivery clipboards via PIN login. John Isherwood (owner) manages stock, reviews clipboards, and places supplier orders via admin login. Deployed on Vercel, custom domain planned: clipboard.merseysidedairies.co.uk

## About the User
Luke is building this for free for his mate John. Luke is NOT a developer. He writes prompts, Claude Code writes code. Explain everything in plain English, no jargon without explanation.

## Tech Stack
- **Framework**: Next.js 14+ (App Router) + TypeScript strict + Tailwind CSS
- **Database**: Supabase Postgres (eu-west-2 region, John's account jishey@gmail.com)
- **Icons**: lucide-react
- **Charts**: recharts (admin history page only)
- **Deployment**: Vercel
- **Mobile-first**: 430px max-width, 18px+ body text, 48px+ touch targets

## Prototype
The file `merseyside-dairies-app.jsx` in the project root is the single source of truth for all UX, logic, and styling. Read it before writing any code. The real app must look, feel, and behave identically to the prototype.

## Commands
```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build -- must pass before any PR
npx tsc --noEmit     # Type check -- run before marking complete
npm run test         # Run tests -- must pass before committing
```

## Critical Rules -- Read Every Session
1. **PLAN FIRST** -- Never write code without showing the plan and getting approval. List files to create/change, list dependencies, identify risks, show plan, WAIT for "go".
2. **Prototype is the source of truth** -- Every screen, interaction, and edge case must match the prototype exactly. When in doubt, read `merseyside-dairies-app.jsx`.
3. **Mobile-first** -- 430px max-width, 18px+ text, 48px+ touch targets. All users are older milkmen on a shared phone at the depot.
4. **Verify before done** -- Run `npx tsc --noEmit` and `npm run build`. Fix ALL errors before marking complete.
5. **No dead code** -- If it's not used, delete it.
6. **Types are the source of truth** -- All TypeScript interfaces in `types/database.ts`. Must match Supabase schema exactly.
7. **ZERO EMOJIS** -- Never use emojis anywhere. Use Lucide React icons or plain text symbols instead.
8. **Stepper local draft pattern** -- The Stepper component MUST use local draft state (onFocus clears, onChange updates draft only, onBlur commits). This prevents keystroke loss. See `.claude/rules/ui.md`.
9. **Shared components outside main function** -- Phone, Page, Btn, BackBtn must be defined as separate component files, never inside a page component. Prevents React remount flicker.
10. **Both themes NOT needed** -- This app is single-theme only (light/cream clipboard look). No dark mode.

## Users
- **Milkmen** (7): PIN login, fill in daily clipboards. No Supabase Auth -- PIN verified against DB, session in React state.
- **Admin (John)**: Username/password login, manages everything. Admin state in React context.

## Database
11 Supabase tables: milkmen, products, clipboard_entries, clipboard_status, absences, fridge_counts, stock_targets, orders, order_items, day_status, settings. See HANDOFF.md for full schema.

## Key Business Logic
- **Anomaly detection**: Flags when taking-out quantity differs >25% from 4-week same-day average. Only fires with 4+ weeks of data. Zero value IS an anomaly if milkman has started their clipboard.
- **Afternoon edit tracking**: Snapshot morning "out" values when switching to afternoon mode. Show EDITED badge if changed. Badge clears if value returns to morning snapshot.
- **Order calculator**: Uses TOMORROW's stock target (not today). Defaults to suggested amount, not 0.
- **Brought-back clamping**: When taking-out decreases, clamp brought-back to new out value.
- **Close day**: Soft lock -- milkmen can't edit, admin can reopen.

## Routing
```
/                    -> Welcome (milkman list)
/pin/[id]            -> PIN entry
/setup               -> New milkman setup
/clipboard/[id]      -> Today's clipboard
/history/[id]        -> Historical clipboard viewer
/summary/[id]        -> End-of-day summary
/admin               -> Admin login
/admin/dashboard     -> Admin dashboard
/admin/clipboards    -> All clipboards view
/admin/fridge        -> Fridge count
/admin/order         -> Order calculator
/admin/order/email   -> Order email draft
/admin/order/history -> Past orders
/admin/targets       -> Stock targets
/admin/products      -> Product management
/admin/history       -> Sales history & charts
/admin/settings      -> Settings + milkman management
```

## File Structure
```
src/
  app/
    page.tsx                  -> Welcome screen
    pin/[id]/page.tsx         -> PIN entry
    setup/page.tsx            -> New milkman setup
    clipboard/[id]/page.tsx   -> Today's clipboard
    history/[id]/page.tsx     -> Historical viewer
    summary/[id]/page.tsx     -> End-of-day summary
    admin/
      page.tsx                -> Admin login
      dashboard/page.tsx      -> Dashboard
      clipboards/page.tsx     -> All clipboards
      fridge/page.tsx         -> Fridge count
      order/page.tsx          -> Order calculator
      order/email/page.tsx    -> Email draft
      order/history/page.tsx  -> Order history
      targets/page.tsx        -> Stock targets
      products/page.tsx       -> Product management
      history/page.tsx        -> Sales history
      settings/page.tsx       -> Settings
    layout.tsx                -> Root layout
    globals.css               -> Global styles
  components/
    Phone.tsx                 -> 430px max-width wrapper
    Page.tsx                  -> Min-height + padding wrapper
    Btn.tsx                   -> Primary button (56px min-height)
    BackBtn.tsx               -> Blue text back button
    Stepper.tsx               -> +/- with local draft pattern
    NumPad.tsx                -> 3x4 PIN grid
    PinDots.tsx               -> 4-dot PIN display
    StatusBadge.tsx           -> Pill badge (submitted/progress/anomaly/not_started)
    BottomNav.tsx             -> Admin 5-tab nav
    ClipboardWrapper.tsx      -> Board + clip + paper metaphor
  lib/
    supabase/
      client.ts               -> Browser Supabase client
      server.ts               -> Server-side Supabase client
    anomaly.ts                -> Anomaly detection logic
    helpers.ts                -> dateStr, formatDate, timeNow, greeting
    types.ts                  -> Re-exports from types/database.ts
  types/
    database.ts               -> All TypeScript interfaces
  middleware.ts               -> (if needed)
```

## Detailed Rules
See `.claude/rules/` for focused rule files:
- `workflow.md` -- Plan-first protocol, verification checklist, communication style
- `lessons.md` -- Hard-won lessons from past sessions. Read before every task.
- `architecture.md` -- Error handling, state management, data flow
- `security.md` -- PIN auth, admin auth, RLS policies
- `ui.md` -- Clipboard metaphor, design tokens, animations, mobile-first
- `supabase.md` -- Database patterns, queries, migrations
- `testing.md` -- What to test, how to test

## Reference Documents
- `HANDOFF.md` -- Complete build specification with all 20 screens, business logic, edge cases
- `merseyside-dairies-app.jsx` -- Working prototype (2,273 lines) -- the visual and behavioural source of truth
- `BUILD-PROMPTS.md` -- 14 ordered build prompts
