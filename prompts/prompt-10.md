## Prompt 10: Admin Login + Dashboard

**Goal:** Build the admin login screen and the main admin dashboard with the 4-card status grid and close/reopen day functionality. The prototype file `merseyside-dairies-app.jsx` is the source of truth — look at SCREEN 8 (Admin Login) and SCREEN 9 (Admin Dashboard).

**Important context from previous prompts:**
- Shared components exist: Phone, Page, Btn, BackBtn, BottomNav
- settings table has admin_username and admin_password
- clipboard_status, absences, fridge_counts, orders, day_status tables all exist and have data

**Instructions:**

1. **Create admin auth context** (`src/lib/auth/admin-context.tsx`):
   - React context that stores `isAdmin: boolean`
   - Provide `login(username, password)` and `logout()` functions
   - Check credentials against the `settings` table (admin_username, admin_password)
   - Store admin state in sessionStorage so it persists during the session but not across tabs
   - Wrap the app layout with this provider

2. **Create `src/app/admin/page.tsx` (Admin Login):**
   - Gradient header: same as welcome screen (`linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)`), border-radius 20px, padding 28px 24px
   - Logo: same URL, height 70px, centred
   - "Admin Login" heading — 32px, weight 800, white, below the logo
   - Username input: default value "john", label "USERNAME" (16px, weight 700, `#64748B`, uppercase, letter-spacing 0.05em)
   - Password input: default value "admin", label "PASSWORD", show/hide toggle using Eye/EyeOff icons
   - Input styling: full width, padding 16px, font 18px, border-radius 12px, border `2px solid #E2E8F0`, weight 600
   - "Log In" button (blue Btn with Lock icon)
   - "(Demo: tap Log In to enter)" note — 13px, `#9CA3AF`, centred, weight 600
   - "Back to Milkman View" link — blue text, centred, 17px, weight 700, below everything
   - On successful login: set admin context, navigate to `/admin/dashboard`

3. **Create `src/app/admin/dashboard/page.tsx`:**
   - Protected route — redirect to `/admin` if not admin
   - Fetch: all milkmen, all clipboard_statuses for today, absences for today, fridge_counts for today, orders for today, day_status for today
   - Background: `#F8FAFC`, padding `24px 20px 100px` (room for BottomNav)

   - **Header:**
     - "Morning, John" — 32px, weight 800, colour `#1E3A5F`, letter-spacing -0.02em
     - Formatted date — 16px, colour `#64748B`, weight 600, margin-top 6px

   - **Absence banner** (only if anyone is absent today):
     - Background `#F3E8FF`, border `2px solid #E9D5FF`, border-radius 12px, padding 14px
     - "OFF TODAY: {Name} (-> {Cover}), ..." — 13px, weight 800, colour `#6B21A8`

   - **4-card grid** (CSS Grid, 2 columns, gap 14px):
     Each card: padding 20px, border-radius 16px, 2px border, text-align left, cursor pointer, transition all 0.2s, box-shadow with colour tint

     a. **Clipboards In** (blue):
        - Background: `linear-gradient(135deg, #EFF6FF, #DBEAFE)`, border `#93C5FD`
        - ClipboardList icon 32px colour `#2563EB`
        - Count: `{confirmedCount}/{workingMilkmen}` — 32px, weight 800, colour `#1E3A5F`
        - **CRITICAL:** confirmedCount = milkmen who have `headed_out = true` OR `submitted = true` (NOT just submitted!)
        - workingMilkmen = total active milkmen minus absent ones
        - Label: "Clipboards In" (or "Confirmed (X finished)" if any submitted) — 13px, `#64748B`, weight 800, uppercase
        - Clicking → `/admin/clipboards`

     b. **Anomalies** (amber):
        - Background: `linear-gradient(135deg, #FFFBEB, #FEF3C7)`, border `#FCD34D`
        - AlertTriangle icon 32px colour `#D97706`
        - Count of milkmen with unconfirmed anomalies — 32px, weight 800, colour `#92400E`
        - Label: "Anomalies" — 14px, `#64748B`, weight 800, uppercase
        - Clicking → `/admin/clipboards`

     c. **Fridge Count** (purple):
        - Background: `linear-gradient(135deg, #F5F3FF, #EDE9FE)`, border `#C4B5FD`
        - Package icon 32px colour `#7C3AED`
        - Text: "Done at {HH:MM}" or "Not yet entered" — 18px, weight 800, colour `#5B21B6`
        - Label: "Fridge Count" — 14px, `#64748B`, weight 800, uppercase
        - Clicking → `/admin/fridge`

     d. **Today's Order** (green):
        - Background: `linear-gradient(135deg, #F0FDF4, #DCFCE7)`, border `#86EFAC`
        - Mail icon 32px colour `#16A34A`
        - Text: "Sent" or "Not yet placed" — 18px, weight 800, colour `#166534`
        - Label: "Today's Order" — 14px, `#64748B`, weight 800, uppercase
        - Clicking → `/admin/order`

   - **Close Day button** (below the grid, only visible when at least 1 milkman submitted AND day not closed):
     - Full width, background `linear-gradient(135deg, #FCA5A5, #F87171)`, white text, border-radius 12px, padding 16px, font 16px, weight 800
     - Check icon inline + "Close Day"
     - Box-shadow: `0 4px 12px rgba(220, 38, 38, 0.3)`
     - On click: show a `confirm()` dialog: "Close the day? Milkmen will no longer be able to edit their clipboards."
     - If confirmed: update `day_status` table (closed = true, closed_at = now)

   - **When day is closed:** show "Closed at {HH:MM}" text (13px, `#64748B`, weight 700) + "Reopen Day" button (blue outline, border `#CBD5E1`, font 14px, weight 700)
     - Reopen: sets closed = false in day_status

   - **"Order History" link** — full width, margin-top 12px, border `2px solid #E2E8F0`, blue text, border-radius 10px, padding 12px, font 14px, weight 700 → `/admin/order/history`

   - **BottomNav** at bottom, active tab = 'dashboard'

**Verification:**
- `npm run build` passes
- Admin login works with john/admin credentials
- Dashboard shows correct counts (headed_out + submitted, not just submitted)
- Fridge count and order status reflect real Supabase data
- Close day saves to day_status and blocks milkman access on welcome screen
- Reopen day restores access
- All 4 cards are clickable and navigate correctly
- BottomNav switches between admin screens

---
