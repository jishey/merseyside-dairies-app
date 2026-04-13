# Merseyside Dairies -- Full Project Handoff

There are TWO separate projects in this folder. Read the whole doc before starting anything.


---

## Project 1: The Marketing Website (merseysidedairies.co.uk)

### What It Is
A single-file HTML redesign of John's business website. One file, 868 lines, all CSS inline, no frameworks, no build step, no JavaScript (yet). Lives in this repo as `merseyside-dairies-redesign.html`, deployed to cPanel as `/public_html/index.html`.

### Current State -- DONE
- Full site redesign live at merseysidedairies.co.uk
- Sections: nav, hero with stats row, products grid (6 items), "how it works" steps, about/trade panels, delivery area, contact/footer
- Mobile hamburger menu -- full-screen overlay with close button and teal CTA
- Hero stats row fixed to stay on one line on mobile
- Favicon and apple-touch-icon added

### Outstanding Fixes (do these first)

**Fix 1 -- Move inline onclick handlers into a script block (Priority: Medium)**

The mobile menu buttons use `onclick="..."` directly in the HTML (8 instances, lines 592-608). They all add/remove the `open` class on `#mobileMenu`. This works fine now, but would break under a Content Security Policy.

The fix: strip all `onclick` attributes and add a `<script>` block before `</body>` that attaches the same behaviour with `addEventListener`. After the fix, zero `onclick` attributes should remain in the file.

**Fix 2 -- Download external assets and host locally (Priority: Medium)**

The site depends on external servers for images, fonts, and the logo. If any go down, the site breaks.

Assets to make local:
- Google Fonts (DM Sans) -- lines 9-10 -- download .woff2 files + CSS to `/fonts/`
- Unsplash images (8 total) -- lines 150, 654, 661, 668, 675, 682, 689, 751, 760 -- download to `/images/`
- Logo PNG (4 references) -- lines 7, 8, 582, 825 -- hosted on old WordPress install -- download to `/images/`

Target file structure on cPanel after fix:
```
/public_html/
  index.html
  images/
    hero-bg.jpg
    milk.jpg
    bread.jpg
    eggs.jpg
    cheese.jpg
    juice.jpg
    cereal.jpg
    doorstep.jpg
    cafe.jpg
    logo.png
  fonts/
    dm-sans-regular.woff2
    dm-sans-500.woff2
    dm-sans-600.woff2
    dm-sans-700.woff2
    dm-sans.css
```

### How to Upload to cPanel

Hosted on cPanel (LayerIP). Upload via Chrome MCP -- Luke logs into cPanel File Manager in Chrome, then you POST file content to the Fileman API using JavaScript.

**Method:** Base64 chunked transfer
1. Encode file as base64 in the sandbox
2. Split into ~8KB chunks
3. Send each chunk to browser via Chrome MCP `javascript_tool`, building up `window._b64`
4. Decode with `atob()` and POST to Fileman `save_file_content` endpoint

**cPanel details** (session token expires each login -- Luke will need to log in fresh):
- Host: hosting09.layerip.com:2083
- Home dir: `/home/merseysi/public_html/`
- API endpoint: `/cpsessXXXXXXXXXX/execute/Fileman/save_file_content`
- Params: `dir=/public_html`, `file=index.html`, `from_charset=UTF-8`, `to_charset=UTF-8`, `content=<file content>`

For Fix 2, you'll also need to create `/images/` and `/fonts/` directories and upload each asset file individually.

### Rules for the Website File
- Single HTML file. All CSS in `<style>`, all JS (if any) in `<script>` before `</body>`
- No frameworks or libraries
- CSS variables defined in `:root` -- use them
- Mobile-first, test at 640px and below
- Zero emojis


---

## Project 2: The Clipboard App (clipboard.merseysidedairies.co.uk)

### What It Is
A Next.js web app replacing paper clipboards at John's milk depot. 7 milkmen (all in their 60s) fill in daily delivery clipboards on a shared phone via PIN login. John (admin) manages stock, reviews clipboards, and places supplier orders.

### Tech Stack
- Next.js 14+ (App Router) + TypeScript strict + Tailwind CSS
- Supabase Postgres (eu-west-2, John's account jishey@gmail.com)
- Lucide React icons, Recharts for admin charts
- Deployment target: Vercel, domain clipboard.merseysidedairies.co.uk

### Current State -- ALL 14 PROMPTS BUILT
Every screen from BUILD-PROMPTS.md has been built. The app has:

**Milkman screens:**
- Welcome screen (milkman list)
- PIN entry + setup
- Clipboard screen (morning + afternoon modes)
- Anomaly detection + confirm flow
- Headed out confirmation
- Historical clipboard viewer
- End-of-day summary

**Admin screens:**
- Admin login
- Dashboard
- All clipboards view
- Fridge count
- Order calculator + email draft + order history
- Stock targets
- Product management
- Sales history + charts
- Settings + milkman management

**Shared components (10):**
Phone, Page, Btn, BackBtn, Stepper, NumPad, PinDots, StatusBadge, BottomNav, OfflineDetector

**Libs:**
- `lib/helpers/` -- date.ts, anomaly.ts, clipboard.ts, order.ts
- `lib/auth/` -- admin-context.tsx
- `lib/supabase/` -- client.ts, server.ts

**Database:** 11 Supabase tables, 2 migration files, RLS enabled on all tables

### What's NOT Done Yet
- No unit tests written (testing.md says anomaly detection, order calc, helpers all need tests)
- Not deployed to Vercel yet
- Custom domain (clipboard.merseysidedairies.co.uk) not configured
- No idea if `npm run build` currently passes -- needs checking
- The app hasn't been tested by John or the milkmen yet

### Key Documentation
- `CLAUDE.md` -- full project instructions, critical rules, file structure, routing
- `.claude/rules/` -- 8 rule files (workflow, lessons, architecture, security, ui, supabase, testing, playwright)
- `BUILD-PROMPTS.md` -- all 14 build prompts (completed)
- `HANDOFF.md` -- complete build spec with all 20 screens, business logic, edge cases
- `merseyside-dairies-app.jsx` -- working prototype (2,273 lines) -- the visual source of truth

### Key Business Logic to Know
- Anomaly detection: flags when quantity differs >25% from 4-week same-day average (only with 4+ weeks data)
- Zero values ARE anomalies, but only if the milkman has started their clipboard
- Order calculator uses TOMORROW's stock target, not today
- Brought-back is clamped to taking-out value
- Stepper uses local draft pattern (onFocus clears, onChange updates draft, onBlur commits)

### Commands
```bash
npm run dev          # Dev server on localhost:3000
npm run build        # Production build -- must pass
npx tsc --noEmit     # Type check
npm run test         # Vitest (no tests written yet)
```


---

## About Luke (the User)

- Founder of Fluxr Legal (a separate SaaS project, also in this workspace)
- Building the Merseyside Dairies projects for free for his mate John
- NOT a developer -- explain everything in plain English
- He writes prompts, Claude Code writes code. Never write code directly in Cowork -- produce detailed implementation prompts for Luke to paste into Claude Code
- Never rate effort as "Low" -- minimum is Medium
- Give him what he asks for directly, don't redirect or tell him where to find things
- Don't guess at external service details -- if unsure, ask
- Zero emojis everywhere, always


---

## Does CLAUDE.md Need Updating?

No. The existing CLAUDE.md is comprehensive and accurate for the clipboard app. The `.claude/rules/` files are all up to date. The website is a separate thing that doesn't use any of the clipboard app's tooling -- this handoff doc covers what a new agent needs for the website work.

If the website grows beyond a single HTML file in future, it might be worth adding a section to CLAUDE.md or creating a separate `WEBSITE.md`. But not yet.
