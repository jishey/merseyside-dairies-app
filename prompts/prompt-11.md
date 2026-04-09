## Prompt 11: Fridge Count + All Clipboards View

**Goal:** Build the fridge count entry screen and the all-clipboards accordion view for admin. The prototype file `merseyside-dairies-app.jsx` is the source of truth — look at SCREEN 10 (Fridge Stock Entry) and SCREEN 11 (All Clipboards View).

**Important context from previous prompts:**
- Admin auth context and dashboard exist
- BottomNav, Stepper, StatusBadge components exist
- fridge_counts and clipboard_entries tables in Supabase

**Instructions:**

1. **Create `src/app/admin/fridge/page.tsx`:**
   - Protected admin route
   - BackBtn → `/admin/dashboard`
   - "Fridge Count" heading — 32px, weight 800, colour `#1E3A5F`
   - "Count what's left after the lads have loaded" subtitle — 16px, colour `#64748B`, weight 600, margin-bottom 24px
   - Product list with Stepper for each:
     - Card: background `#F8FAFC`, border-radius 12px, padding 16px, border `2px solid #E2E8F0`, left border 4px solid product colour
     - Product header: colour dot (12px) + name + size (18px, weight 800, `#1E3A5F`)
     - Stepper below
   - "Save Fridge Count" button (green Btn with Check icon):
     - Upserts to fridge_counts table for each product (today's date)
     - Records `counted_at` timestamp
     - Navigates back to `/admin/dashboard`
   - Padding bottom 100px for BottomNav
   - BottomNav at bottom

2. **Create `src/app/admin/clipboards/page.tsx`:**
   - Protected admin route
   - "Today's Clipboards" heading — 32px, weight 800, colour `#1E3A5F`, margin-bottom 24px
   - Fetch: all milkmen, all clipboard_entries for today, all clipboard_statuses for today, absences for today
   - Calculate milkmanStatus for each using the helper function

   - **Accordion list** of working milkmen (EXCLUDE absent milkmen):
     - Each accordion item: white bg, border-radius 12px, overflow hidden, border `2px solid #E2E8F0`, box-shadow `0 2px 4px rgba(0,0,0,0.04)`
     - Header row (clickable): padding 16px 20px, flex space-between
       - Milkman name: 20px, weight 800, colour `#1E3A5F`
       - StatusBadge component showing their status
     - Expanded content (background `#F8FAFC`, padding 0 20px 16px):
       - One row per product:
         - Product colour dot (10px) + name + size (16px, weight 700, `#1E293B`)
         - Values on the right: "Out: {X} Back: {Y}" + "Damaged: {Z}" (if > 0, amber 13px) + "Sold: {W}" (green)
         - Font 15px, weight 700
         - If EDITED (out !== morning_out): show red "EDITED" badge (same style as clipboard) + "Morning value was {X}, changed to {Y} after round" note in red italic
         - Rows separated by `border-bottom: 1px solid #E2E8F0`
         - Anomaly/edited rows get slightly highlighted background and left border

   - **Daily Totals section** at bottom:
     - Dark navy background `#1E3A5F`, border-radius 14px, padding 18px, box-shadow `0 6px 16px rgba(30, 58, 95, 0.15)`
     - "DAILY TOTALS" heading — 16px, weight 800, white, uppercase, letter-spacing 0.05em, margin-bottom 14px
     - Per-product row (flex space-between, padding 8px 0, border-bottom `1px solid rgba(255,255,255,0.1)`):
       - Left: colour dot (8px) + name + size — colour `#CBD5E1`
       - Right: "Out: {X} | Back: {Y} | Waste: {Z} | Sold: {W}" — white, font 14px, weight 700
     - Sum across ALL working milkmen (exclude absent)

   - Padding bottom 100px for BottomNav
   - BottomNav at bottom, active tab = 'clipboards'

**Verification:**
- `npm run build` passes
- Fridge count saves to Supabase and dashboard updates to "Done at HH:MM"
- Clipboards view shows all working milkmen with correct statuses
- Expanding an accordion shows product breakdown
- EDITED badges appear for afternoon-edited products
- Daily totals sum correctly
- Absent milkmen are excluded from both the list and the totals

---
