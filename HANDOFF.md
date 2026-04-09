# Merseyside Dairies Clipboard App — Build Handoff

## Overview

Build a **Next.js (App Router)** web app with **Supabase** backend, deployed to **Vercel**. This replaces paper clipboards at a dairy delivery depot in Merseyside, UK.

**The prototype file `merseyside-dairies-app.jsx` (in this same folder) is the single source of truth for all UX, logic, and styling.** Read it in full before writing any code. Every screen, every interaction, every edge case has been tested and iterated with the client. The real app must look, feel, and behave identically to the prototype.

---

## Users

Two user types:

1. **Milkmen** (7 users, all in their 60s) — fill in daily delivery clipboards via PIN login
2. **Admin (John)** — manages stock, reviews clipboards, places supplier orders via username/password login

### Default Milkmen
| Name | PIN |
|------|-----|
| Ian | 1234 |
| Gary | 5678 |
| Andy | 9012 |
| Joseph | 3456 |
| Tommy | 7890 |
| Reg | 2345 |
| Frank | 6789 |

### Default Admin
- Username: `john`
- Password: `admin` (placeholder — implement proper auth for production)

John can add/remove milkmen from Settings.

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Database & Auth:** Supabase (project "MerseysideDairies", region eu-west-2, org id: `lirdonrohyblvydhwzrg`)
- **Styling:** Tailwind CSS — but replicate the EXACT colours, spacing, and feel from the prototype's inline styles
- **Icons:** lucide-react
- **Charts:** recharts (admin history page, weekly bar chart)
- **Deployment:** Vercel
- **Mobile-first:** 430px max-width, 18px+ body text, 48px+ touch targets

---

## Design System

### Key Design Tokens

**The prototype is the definitive reference.** Copy styles exactly from `merseyside-dairies-app.jsx`.

| Token | Value | Usage |
|-------|-------|-------|
| Max width | 430px | Phone container |
| Font family | -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif | Everything |
| Primary blue | #2563EB | Buttons, links, Blue Milk |
| Primary green | #16A34A | Confirm buttons, Green Milk |
| Dark navy | #1E3A5F | Headings, clipboard header gradient |
| Cream paper | #FDF6E3 | Clipboard background |
| Clipboard board | #E8E0D0 | Behind the clipboard paper |
| Error red | #DC2626 | Errors, EDITED badges, delete actions |
| Warning amber | #F59E0B / #FEF3C7 | Anomaly warnings |
| Body bg | #F8FAFC | Admin pages |
| Text primary | #1E293B | Body text |
| Text muted | #64748B | Secondary text |
| Text subtle | #78716C | Clipboard dates, labels |
| Border | #E2E8F0 | Card borders |
| Font weight (heavy) | 800 | Most text — the app uses bold weights throughout |
| Letter spacing | -0.02em | Headings |
| Border radius (cards) | 12-16px | Cards, buttons |
| Border radius (buttons) | 14px | Primary buttons |
| Touch target min | 48px | All tappable elements |
| Stepper button | 48px circle | Plus/minus buttons |
| Button min height | 56px | Primary action buttons |

### Product Colour Palette
Admin can assign colours to products from this palette:

| Name | Hex |
|------|-----|
| Blue | #2563EB |
| Green | #16A34A |
| Red | #DC2626 |
| Orange | #EA580C |
| Yellow | #CA8A04 |
| Purple | #7C3AED |
| Pink | #DB2777 |
| Teal | #0D9488 |

### Animations
- `screen-fade`: fadeIn 0.2s ease-out (translateY 8px → 0, opacity 0 → 1)
- `shake`: PIN error shake animation (translateX -8px → 8px, 0.3s)
- PIN dots: scale(1.1) with cubic-bezier(0.34, 1.56, 0.64, 1) transition when filled
- All buttons: transition all 0.2s

### Logo
- URL: `https://merseysidedairies.co.uk/wp-content/uploads/2016/04/Merseyside_Dairies_Logo_PNG.png`
- Used in welcome header and admin login header
- Height: 80px (welcome), 70px (admin login)

---

## Default Products

Ordered by size then colour:

| ID | Name | Size | Colour |
|----|------|------|--------|
| 1 | Blue Milk | 2 Litre | #2563EB |
| 4 | Green Milk | 2 Litre | #16A34A |
| 2 | Blue Milk | 1 Litre | #2563EB |
| 5 | Green Milk | 1 Litre | #16A34A |
| 3 | Blue Milk | Pint | #2563EB |
| 6 | Green Milk | Pint | #16A34A |

---

## Database Schema

Design these Supabase tables:

### `milkmen`
- `id` (uuid, PK)
- `name` (text, not null)
- `pin` (text, not null, 4 digits)
- `active` (boolean, default true)
- `created_at` (timestamptz)
- `sort_order` (int) — display order on welcome screen

### `products`
- `id` (uuid, PK)
- `name` (text, not null)
- `size` (text, not null) — e.g. "2 Litre", "1 Litre", "Pint"
- `color` (text, not null) — hex colour code
- `active` (boolean, default true)
- `sort_order` (int) — display order

### `clipboard_entries`
- `id` (uuid, PK)
- `milkman_id` (uuid, FK → milkmen)
- `product_id` (uuid, FK → products)
- `date` (date, not null)
- `out` (int, default 0) — quantity taken out
- `back` (int, default 0) — quantity brought back
- `waste` (int, default 0) — damaged/lost
- `morning_out` (int, nullable) — snapshot of `out` when they headed out (for afternoon edit tracking)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)
- Unique constraint: (milkman_id, product_id, date)

### `clipboard_status`
- `id` (uuid, PK)
- `milkman_id` (uuid, FK → milkmen)
- `date` (date, not null)
- `headed_out` (boolean, default false) — true when milkman confirms and heads out
- `headed_out_at` (timestamptz, nullable)
- `submitted` (boolean, default false) — true when end-of-day submitted
- `submitted_at` (timestamptz, nullable)
- Unique constraint: (milkman_id, date)

### `absences`
- `id` (uuid, PK)
- `milkman_id` (uuid, FK → milkmen) — who is off
- `date` (date, not null)
- `covering_id` (uuid, nullable, FK → milkmen) — who covers their round (null = John covers)
- Unique constraint: (milkman_id, date)

### `fridge_counts`
- `id` (uuid, PK)
- `product_id` (uuid, FK → products)
- `date` (date, not null)
- `quantity` (int, default 0)
- `counted_at` (timestamptz)
- Unique constraint: (product_id, date)

### `stock_targets`
- `id` (uuid, PK)
- `product_id` (uuid, FK → products)
- `day_of_week` (text, not null) — 'mon','tue','wed','thu','fri','sat'
- `target` (int, not null) — how many should be in the fridge that morning
- Unique constraint: (product_id, day_of_week)

### `orders`
- `id` (uuid, PK)
- `date` (date, not null)
- `supplier_email` (text)
- `email_body` (text)
- `sent_at` (timestamptz)

### `order_items`
- `id` (uuid, PK)
- `order_id` (uuid, FK → orders)
- `product_id` (uuid, FK → products)
- `quantity` (int)

### `day_status`
- `id` (uuid, PK)
- `date` (date, not null, unique)
- `closed` (boolean, default false)
- `closed_at` (timestamptz, nullable)

### `settings`
- `key` (text, PK) — e.g. 'supplier_email'
- `value` (text)

Seed the `settings` table with `supplier_email` = `supplier@dairy.co.uk`.

---

## Screens — Milkman Flow

Reference the prototype for exact layouts. Below documents the logic and behaviour.

### 1. Welcome Screen (`/`)
- Gradient header (#1E3A5F → #2563EB) with logo, time-based greeting (`Good morning` / `Good afternoon` / `Good evening`), "Tap your name to get started"
- List of milkmen as cards, each with:
  - Coloured avatar circle (alternating blue/green)
  - Name in bold
  - If absent: greyed out, "Off today — covered by [Name]" subtitle
  - Left border colour alternates blue/green
- If day is closed: red warning banner "Today's round is closed", all milkman buttons disabled
- Bottom buttons: "I'm New Here" (outline) and "Admin Login" (text link)
- "Simulate Offline" button (demo only — remove in production or keep behind a flag)

### 2. First-Time Setup (`/setup`)
Three steps:
1. **Name** — text input "What's your name?", Next button (disabled if empty)
2. **PIN** — "Choose a 4-digit PIN, [Name]", 4 pin dots + numpad, Next button (disabled until 4 digits)
3. **Confirm** — "Confirm your PIN", if mismatch shows "PINs don't match. Try again." in red box
   - "Create My Clipboard" button (disabled until PINs match)
   - On success → add new milkman to DB, navigate back to welcome screen
   - New milkman appears immediately on the welcome list and can log in straight away

### 3. PIN Entry (`/pin`)
- Large name display (48px, 800 weight)
- "Enter your PIN" subtitle
- 4 pin dots with fill animation
- Numpad (1-9, 0, delete)
- On correct PIN: navigate to clipboard
  - If milkman already headed out today AND has morning snapshot → go to afternoon mode
  - Otherwise → go to morning mode
- On wrong PIN: shake animation, "That's not right, try again", clear after 400ms

### 4. Clipboard — Today (`/clipboard`)
**THE CORE SCREEN.** Clipboard metaphor with:
- Board background (#E8E0D0)
- Metal clip graphic at top (gradient grey, rounded bottom corners)
- Paper background (#FDF6E3) with subtle radial gradients
- Folded corner (top-right) → navigates to History when tapped, says "FLIP" rotated 45°

**Header:** "[Name]'s Clipboard" + formatted date

**Morning/Afternoon Toggle:**
- Two-tab pill: "Morning Load" | "Back from Round"
- "Back from Round" disabled until at least one product has an out value > 0
- Switching to afternoon takes a snapshot of all morning "out" values

**Product Cards (one per product):**
- Left border = product colour
- Product colour dot + name + size
- **Morning mode:**
  - "TAKING OUT" label + Stepper (value, +/-, tap-to-type)
  - Anomaly warning if value differs >25% from 4-week same-day average (see Anomaly Detection below)
  - "That's right" dismiss button on anomaly
- **Afternoon mode:**
  - "TAKING OUT" — still editable, shows "EDITED" red badge if changed from morning snapshot, with "Was [X] this morning" note
  - "BROUGHT BACK" — Stepper, max clamped to taking-out value
  - "DAMAGED / LOST" — only shows if out - back > 0, max clamped to out - back
  - If out = 0: "Nothing taken out — nothing to bring back"

**CRITICAL — Stepper Component Pattern:**
The stepper uses a local draft state pattern to avoid keystroke loss:
- `onFocus`: clear display, set typing mode, show empty input
- `onChange`: update local draft only (no state commit)
- `onBlur`: commit draft to real state, exit typing mode
- `onKeyDown Enter`: blur the input
- Display: typing ? draft : value
- Input mode: `inputMode="numeric"` + `pattern="[0-9]*"`
- Input styling: green border (#2563EB) when focused, green background (#F0FDF4)

**CRITICAL — When Taking Out decreases, clamp Brought Back:**
```
const clampedBack = Math.min(cur.back || 0, newOutValue);
```

**Action Buttons:**
- Morning: "Confirm & Head Out" (green) → checks for anomalies first
- Afternoon: "End of Day — Submit" → goes to summary screen

**Logout button** at bottom (full-width, grey outline, flex-centered icon + text)

### 5. Confirm Anomalies (`/confirm-anomalies`)
- Amber/yellow full-screen
- Warning icon in circle
- "Hold on, [Name]" heading
- "These amounts look unusual — are you sure?"
- List of anomaly products with current value vs average
- "Yes, that's right — Head Out" button (amber)
- "Go Back & Fix" button (outline)

### 6. Headed Out Confirmation (`/headed-out`)
- Board background
- Green checkmark in circle
- "Clipboard Saved"
- "Drive safe, [Name]!"
- "When you're back, log in again to fill in what you brought back."
- "Done" button → back to welcome

### 7. Historical Clipboard (accessed via FLIP corner)
- Same clipboard metaphor (clip, paper)
- Date navigation: left/right arrows with date in centre
- "Read only" label
- Product cards showing: Out, Back, Damaged (if >0), Sold (calculated)
- "Back to Today" button
- Cannot navigate forward past yesterday (offset minimum = 1)

### 8. End-of-Day Summary
- "[Your Day, [Name]]" heading + date
- Product summary cards showing: Out, Back, Damaged (if >0), Sold
- EDITED badge on any afternoon-edited products with "Morning value was X, changed to Y after round"
- Anomaly products highlighted in amber
- "Confirm & Submit" button → sets submitted = true, shows "All done for today" confirmation
- Confirmation: green checkmark, "All done for today, [Name]", "See you tomorrow!", "Back to Start" button

---

## Screens — Admin Flow

### 9. Admin Login (`/admin`)
- Gradient header with logo + "Admin Login"
- Username input (defaultValue "john")
- Password input (defaultValue "admin")
- "Log In" button
- "(Demo: tap Log In to enter)" note — remove in production, implement real auth
- "Back to Milkman View" link

### 10. Admin Dashboard
- "Morning, John" heading + date
- Absence banner (purple) if anyone is off, showing who and who covers
- 4-card grid (2×2):
  1. **Clipboards In** (blue gradient): X/Y count, where X = milkmen who have headed out OR submitted, Y = working milkmen (excluding absent)
  2. **Anomalies** (amber gradient): count of milkmen with unconfirmed anomalies
  3. **Fridge Count** (purple gradient): "Done at HH:MM" or "Not yet entered"
  4. **Today's Order** (green gradient): "Sent" or "Not yet placed"
- **Close Day** button (red gradient) — appears when at least 1 milkman submitted AND day not yet closed
  - Confirms with dialog: "Close the day? Milkmen will no longer be able to edit their clipboards."
  - Shows "Closed at HH:MM" + "Reopen Day" button when closed
- "Order History" link button
- **Bottom nav bar** (5 tabs): Home, Clipboards, Order, History, Settings

### 11. Fridge Count (`/admin/fridge`)
- "Fridge Count" heading
- "Count what's left after the lads have loaded" subtitle
- Product list with Steppers
- "Save Fridge Count" button → saves + navigates back to dashboard

### 12. All Clipboards View (`/admin/clipboards`)
- "Today's Clipboards" heading
- Accordion list of working milkmen (excludes absent)
- Each shows name + StatusBadge (Submitted / In Progress / Has Anomalies / Not Started)
- Expand to see all products with: Out, Back, Damaged, Sold
- EDITED badges visible here too with morning value notes
- **Daily Totals** section at bottom (dark navy #1E3A5F background):
  - Per-product row: Out | Back | Waste | Sold

### Status Badge Logic (`milkmanStatus` helper)
This function determines the status of each milkman and is used on the admin dashboard and clipboards view:
```
function milkmanStatus(milkmanId):
  if submitted → return "submitted" (green badge)
  if any product has unconfirmed anomaly → return "anomaly" (amber badge)
  if any product has out > 0 → return "progress" (blue badge)
  else → return "not_started" (grey badge)
```
**CRITICAL:** The check for anomalies uses the same `isAnomaly` function, so empty clipboards (all zeros, hasn't started) will correctly show "Not Started" rather than "Has Anomalies".

### 13. Order Calculator (`/admin/order`)
- "Order Calculator" heading
- Per-product cards showing:
  - **Tomorrow's Target** — looked up from stock_targets for TOMORROW's day of week (not today)
  - **In Fridge** — from fridge count
  - **Returned** — sum of all milkmen's brought-back for this product
  - **On Hand** = In Fridge + Returned
  - **Need to order** = max(0, Tomorrow's Target - On Hand) — shown in blue highlight box
  - **Your Order** — Stepper, defaults to the suggested amount (not 0!)
- "Generate Order Email" button → goes to email draft
- "Add / Remove Products" button → goes to product management

**CRITICAL — Order defaults to suggested, not 0:**
```
const current = orderData[p.id] ?? suggested;
```
If John hasn't touched the stepper, it shows the calculated suggestion. Only if he manually adjusts it does it store his override.

### 14. Order Email Draft (`/admin/order/email`)
- "Order Email" heading
- "To: [supplier email]" display
- Editable textarea with pre-generated email:
  ```
  Hi,

  Please find our order for delivery tomorrow morning:

  - Blue Milk (2 Litre): [qty]
  - Green Milk (2 Litre): [qty]
  ...

  Thanks,
  John
  Merseyside Dairies
  ```
- "Send Order" button → saves to order history, shows confirmation
- "Redraft" button → back to calculator
- Confirmation: green checkmark, "Order sent!", "[email] at HH:MM", "Done" button

### 15. Stock Targets (`/admin/targets`)
- "Stock Targets" heading
- **"How much of each product do you want in the fridge each morning?"** subtitle
- Day tabs: Mon, Tue, Wed, Thu, Fri, Sat (scrollable)
- Products with Steppers for each day
- "Save Targets" button

### 16. Product Management (`/admin/products`)
- "Products" heading
- List of products with Edit button
- Edit mode: name input, size input, colour palette (8 circles), Done/Delete buttons
- Add Product: name input, size input, colour palette, "Add Product" button
- Colour palette: 8 circular buttons, selected shows checkmark + ring shadow

### 17. History & Reporting (`/admin/history`)
- "History" heading
- Daily/Weekly toggle
- **Daily view:**
  - Date navigation (left/right arrows)
  - 3-card summary: Taken Out / Returned / Sold
  - Per-product breakdown showing sold count
- **Weekly view:**
  - "Total Sold — Last 7 Days" heading
  - Bar chart (recharts BarChart with gradient blue bars, rounded top corners)

### 18. Order History (`/admin/order-history`)
- "Order History" heading
- List of past orders: date, time, supplier email, itemised quantities
- Empty state: mail icon + "No orders sent yet"

### 19. Settings (`/admin/settings`)
- "Settings" heading
- Supplier Email input
- Quick Links: Stock Targets, Manage Products
- **Manage Milkmen** section:
  - List of milkmen with name, PIN visible, Remove button
  - Remove confirms: "Remove [Name]? This cannot be undone."
  - Add Milkman: name + PIN inputs, Add/Cancel buttons
- Version footer: "v1.0.0 — Merseyside Dairies Clipboard"
- Log Out button (red)

### 20. No WiFi Screen
- Centered: WifiOff icon (80px), "Looks like you're not connected", "Pop back on the depot WiFi and try again.", "Try Again" button
- In production: detect actual offline status with `navigator.onLine` + event listeners

---

## Critical Business Logic

### Anomaly Detection

Flags when a milkman's taking-out quantity differs >25% from their 4-week same-day average.

```
function isAnomaly(milkmanId, productId, value):
  1. Get last 4 same-day-of-week entries from history
  2. If fewer than 4 weeks of data → return false (don't flag)
  3. If average is 0 → return false
  4. If value is 0:
     - Check if milkman has started their clipboard (any product has out > 0)
     - If started → flag it (taking 0 when you normally take some IS an anomaly)
     - If not started → don't flag (empty clipboard, haven't begun)
  5. If |value - avg| / avg > 0.25 → flag as anomaly
```

**Key edge cases:**
- Empty clipboards don't trigger anomalies (the milkman hasn't started yet)
- Taking 0 of something you normally take IS an anomaly (but only if you've started filling in other products)
- The system doesn't activate until 4 weeks of same-day data exists
- Anomalies can be individually confirmed/dismissed per product

### Afternoon Edit Tracking

When a milkman switches to "Back from Round" mode:
1. Snapshot all current "out" values as `morning_out`
2. If they change "Taking Out" in afternoon, compare new value to snapshot
3. If different → show red "EDITED" badge + "Was [X] this morning"
4. If they change it back to the original value → badge disappears (not permanent)

### Order Calculator Logic

```
For each product:
  inFridge = fridge count for today
  returned = SUM of all milkmen's brought-back values
  onHand = inFridge + returned

  tomorrowDow = day of week for TOMORROW (not today!)
  target = stock target for tomorrowDow for this product

  suggested = max(0, target - onHand)
  displayed = user's manual override ?? suggested
```

### Close Day

- Soft lock: when closed, milkmen cannot access their clipboards (welcome screen shows warning, buttons disabled)
- Can be reopened by admin ("Reopen Day" button)
- Records the time it was closed

### Absences & Round Coverage

- Admin marks a milkman as off for the day
- Assigns a covering milkman (another milkman or "John" himself — John normally does the round when someone is off)
- **UI needed (not in prototype — must be built):** Add an absence management UI in the admin area (e.g. on the dashboard or settings page) where John can:
  - See list of milkmen and toggle someone as "off today"
  - Select who covers their round (dropdown of other milkmen + "John" option)
  - Clear the absence (mark them back as working)
- Absent milkmen are greyed out on welcome screen with "Off today — covered by [Name]"
- Absent milkmen excluded from clipboard totals and dashboard counts
- The covering milkman puts two lots of milk on their own clipboard (no special app logic needed — they just enter higher numbers)
- Multi-day absences: John should be able to set absences for future dates too

### Dashboard Clipboard Count

```
confirmedCount = milkmen who have (headedOut OR submitted) — excluding absent
workingMilkmen = total milkmen minus absent ones
Display: confirmedCount / workingMilkmen
```
This means a milkman counts as "in" as soon as they hit "Confirm & Head Out", not just at end-of-day submit.

---

## Component Architecture (Critical Patterns)

### Phone/Page/Btn/BackBtn — MUST be outside the main component

In the prototype, these were moved outside the main function to prevent React remount flicker. In Next.js, define them as proper shared components:

- `Phone` — max-width 430px wrapper with shadow, border radius, font family
- `Page` — min-height 100vh padding wrapper, optional cream background
- `Btn` — primary button with gradient backgrounds, min-height 56px
- `BackBtn` — blue text button with ChevronLeft icon

### Stepper — local draft state pattern

```
function Stepper({ value, onChange, min=0, max=999, disabled }):
  const [typing, setTyping] = useState(false)
  const [draft, setDraft] = useState('')

  onFocus → setTyping(true), setDraft('')
  onChange → update draft only (strip non-digits)
  onBlur → setTyping(false), commit clamped value
  Enter key → blur

  Display: typing ? draft : value
```

### NumPad
- 3×4 grid: 1-9, empty, 0, delete
- Delete button: red gradient background, X icon
- Each key: 64px height, 28px font, 800 weight

### PinDots
- 4 circles, 24px, filled = #2563EB with scale(1.1), unfilled = #E2E8F0

### StatusBadge
- Pill shape (borderRadius: 20)
- Colours per status: submitted (green), progress (blue), anomaly (amber), not_started (grey)
- All caps, 12px, 800 weight, letter-spacing 0.05em

### BottomNav (admin only)
- Fixed bottom, 5 tabs: Home, Clipboards, Order, History, Settings
- Active tab: blue text, bold stroke, subtle blue background
- Inactive: grey (#94A3B8)

---

## Formatting Helpers

```javascript
// Date string for DB keys: "2026-04-09"
function dateStr(d) { return d.toISOString().split('T')[0]; }

// Friendly display: "Thursday 9th April"
function formatDate(d) { ... with ordinal suffix (st/nd/rd/th) }

// Current time: "14:30"
function timeNow() { ... }

// Time-based greeting
function greeting() {
  if hour < 12 → "Good morning"
  if hour < 17 → "Good afternoon"
  else → "Good evening"
}
```

---

## Global Styles

```css
* { box-sizing: border-box; }
body { margin: 0; }

/* Hide number input spinners */
input.stepper-num::-webkit-outer-spin-button,
input.stepper-num::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
input.stepper-num { -moz-appearance: textfield; font-variant-numeric: tabular-nums; }

/* Clipboard paper texture */
.paper-bg {
  background: #FDF6E3;
  background-image:
    radial-gradient(ellipse at 20% 50%, rgba(255,248,230,0.6) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(255,245,220,0.4) 0%, transparent 50%);
}

/* Screen transitions */
.screen-fade { animation: fadeIn 0.2s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
```

---

## Edge Cases & Bugs We Already Fixed (Do Not Regress)

1. **Stepper flicker:** Components like Phone, Page, Btn defined inside the main component caused full remount on every state change. Always define shared components outside / as separate files.

2. **Keystroke loss in text inputs:** Controlled inputs (`value={state}`) cause keystroke loss in some renderers. Use `defaultValue` for text inputs, local draft pattern for Steppers.

3. **EDITED badge was permanent:** Must compare current value to snapshot, not just set a boolean. If value returns to morning snapshot, badge clears.

4. **Brought-back exceeds taking-out:** When taking-out decreases, clamp brought-back: `Math.min(currentBack, newOut)`.

5. **Zero values not flagged as anomalies:** If a milkman normally takes 40 of something and enters 0, that IS an anomaly — but only if they've started filling in their clipboard.

6. **False anomalies on empty clipboards:** Admin dashboard showed anomalies for milkmen who hadn't started yet. Added `hasStarted` check.

7. **Dashboard showing 0/7 after milkman confirmed:** Was only counting `submitted` (end-of-day). Changed to count `headedOut || submitted`.

8. **headedOut was a single boolean:** Must be per-milkman object, not a global boolean.

9. **Order email showing 0 for all items:** `orderData[p.id]` returned `undefined` (not 0) when John hadn't touched steppers. Fixed fallback: `orderData[p.id] ?? suggested`.

10. **Order calculator using today's target:** Should use TOMORROW's target since the order is for tomorrow's delivery.

11. **milkmen state declared after reference:** The `milkmen` useState must be declared before any useMemo/useCallback that references it.

---

## Supabase Project

A project has been started but may need to be created fresh:
- **Org:** luke-fluxr's Org (id: `lirdonrohyblvydhwzrg`)
- **Project name:** MerseysideDairies
- **Region:** eu-west-2
- **Cost:** $0/month (free tier)

Create the project if it doesn't exist, then apply migrations for the schema above.

---

## Auth Strategy

### Milkman Auth (PIN-based)
- No Supabase Auth for milkmen — they share a device at the depot
- PIN verified client-side against stored PINs from the milkmen table
- Session stored in React state (or context) — no persistent login
- When they log out or the app reloads, they need to tap name + enter PIN again

### Admin Auth
- Could use Supabase Auth with email/password, or keep it simple with a settings-based password for now
- Admin state stored in React context
- Bottom nav only appears for admin

---

## Routing Suggestion

```
/                    → Welcome (milkman list)
/pin/[id]            → PIN entry for milkman
/setup               → New milkman setup
/clipboard/[id]      → Today's clipboard
/history/[id]        → Historical clipboard viewer
/summary/[id]        → End-of-day summary
/admin               → Admin login
/admin/dashboard     → Admin dashboard
/admin/clipboards    → All clipboards view
/admin/fridge        → Fridge count entry
/admin/order         → Order calculator
/admin/order/email   → Order email draft
/admin/order/history → Past orders
/admin/targets       → Stock targets
/admin/products      → Product management
/admin/history       → Sales history & charts
/admin/settings      → Settings + milkman management
```

---

## Build Order Recommendation

1. **Supabase project + schema** — create project, apply migrations, seed default data
2. **Shared components** — Phone, Page, Btn, BackBtn, Stepper, NumPad, PinDots, StatusBadge, BottomNav
3. **Welcome + PIN + Setup** — basic milkman flow
4. **Clipboard screen** — the core UX, morning mode with stepper interactions
5. **Anomaly detection + Confirm & Head Out flow**
6. **Afternoon mode** — edit tracking, brought-back, waste
7. **Summary + Submit**
8. **Historical clipboard viewer**
9. **Admin login + dashboard**
10. **Fridge count + Order calculator + Email**
11. **Stock targets + Product management**
12. **History & reporting (with recharts)**
13. **Settings + Milkman management**
14. **Absences & round coverage**
15. **Close/reopen day**
16. **Deploy to Vercel**

---

## Testing Checklist

- [ ] Milkman can tap name, enter PIN, see clipboard
- [ ] Wrong PIN shows shake + error, clears after 400ms
- [ ] Stepper +/- works without app flicker
- [ ] Stepper tap-to-type works (focus clears, type number, blur commits)
- [ ] Morning → Afternoon toggle only enabled after entering data
- [ ] Afternoon shows "EDITED" badge only when value differs from morning snapshot
- [ ] Brought-back clamped to taking-out value
- [ ] Waste only shows when out - back > 0
- [ ] Anomaly detection only fires after 4 weeks of data
- [ ] Zero value flagged as anomaly only if milkman has started clipboard
- [ ] Confirm & Head Out → anomaly check → drive safe screen
- [ ] Re-login after headed out → afternoon mode automatically
- [ ] End of day summary shows all products correctly
- [ ] Admin dashboard counts headed-out milkmen (not just submitted)
- [ ] Fridge count saves correctly
- [ ] Order calculator uses TOMORROW's target
- [ ] Order defaults to suggested amount (not 0)
- [ ] Order email populated with correct quantities
- [ ] Stock targets editable per day of week
- [ ] Products can be added/removed with colour palette
- [ ] Milkmen can be added/removed from settings
- [ ] Absences properly exclude milkman from counts
- [ ] Close day prevents milkman access, reopen restores it
- [ ] All text is 18px+ for readability
- [ ] All touch targets are 48px+
- [ ] App works on mobile viewport (430px max)
