## Prompt 8: Afternoon Mode + Summary + Submit

**Goal:** Add afternoon mode to the clipboard and build the end-of-day summary screen. The prototype file `merseyside-dairies-app.jsx` is the source of truth — look at the afternoon section of SCREEN 4 (clipboard) and SCREEN 7 (summary).

**Important context from previous prompts:**
- ClipboardScreen.tsx has morning mode with anomaly detection
- clipboard_entries has `morning_out` column for afternoon edit tracking
- clipboard_status has `headed_out` and `submitted` columns

**Instructions:**

1. **Update ClipboardScreen.tsx to add afternoon mode:**

   - **Morning/Afternoon toggle** (already exists as UI, now make functional):
     - "Back from Round" tab becomes enabled when at least one product has out > 0
     - When switching to afternoon for the first time, if no morning_out snapshot exists in the DB, save current out values as morning_out
     - Track the current mode in state: `morningMode: boolean`

   - **Auto-detect mode on login:**
     - When the clipboard page loads, check clipboard_status for today
     - If `headed_out = true` AND `morning_out` values exist in clipboard_entries → start in afternoon mode
     - Otherwise → start in morning mode

   - **Afternoon product cards show three fields:**

     a. **TAKING OUT** — still editable via Stepper
        - Compare current `out` value to `morning_out` value from the DB
        - If different → show red **"EDITED"** badge inline next to the "TAKING OUT" label
          - Badge styling: font 11px, weight 800, white text `#fff`, background `#DC2626`, padding 2px 8px, border-radius 4px, margin-left 8px
        - Below the stepper: "Was {morning_out} this morning" in red italic — font 13px, color `#DC2626`, font-style italic, weight 600, margin 6px 0 0
        - **CRITICAL:** If the value is changed BACK to the morning_out value, the EDITED badge disappears. It's a live comparison, not a permanent flag.

     b. **BROUGHT BACK** — Stepper with `max` clamped to current Taking Out value
        - Label: "BROUGHT BACK" — same 14px uppercase style as Taking Out
        - Only shows if out > 0
        - **CRITICAL clamping:** When Taking Out decreases, Brought Back must be automatically clamped:
          ```
          const clampedBack = Math.min(currentBack, newOutValue)
          ```
          This means if someone had out=40, back=5, then changes out to 3, back automatically becomes 3.

     c. **DAMAGED / LOST** — Stepper with max clamped to `out - back`
        - Label: "DAMAGED / LOST" — font 12px, weight 700, color `#94A3B8`, uppercase, letter-spacing 0.05em
        - Only shows when `out - back > 0` (there are unaccounted items)
        - Max value: `out - back`

     d. **Zero case:** If out = 0 for a product, show: "Nothing taken out — nothing to bring back" — font 14px, color `#9CA3AF`, italic, weight 500, margin-top 10px

   - **Action button in afternoon mode:**
     - "End of Day — Submit" (green Btn) → navigates to `/summary/[id]`

2. **Create `src/app/summary/[id]/page.tsx` (End-of-Day Summary):**
   - Uses Phone wrapper with bg `#fff`, Page component with `cream` prop
   - BackBtn → back to `/clipboard/[id]`
   - "Your Day, [Name]" heading — 32px, weight 800, color `#1E3A5F`, letter-spacing -0.02em
   - Formatted date below — 16px, color `#78716C`, weight 600

   - **Product summary cards** (one per product):
     - Calculate: `sold = out - back - waste`
     - Card backgrounds:
       - If EDITED (out !== morning_out): `#FEE2E2` bg, border `2px solid #FCA5A5`
       - If anomaly: `#FEF3C7` bg, border `2px solid #F59E0B`
       - Normal: `#FFFBF0` bg, border `1px solid #E8DCC8`
     - Left border: 4px solid product colour (always)
     - Product header: colour dot + name + size + EDITED badge if applicable
     - Values row: "Out: **{X}** Back: **{Y}**" + "Damaged: **{Z}**" (if > 0, in amber) + "Sold: **{W}**" (green if positive, red if negative)
       - Font 17px, weight 700, color `#1E3A5F`, flex wrap, gap 20px
     - EDITED note: "Morning value was {X}, changed to {Y} after round" — font 13px, color `#DC2626`, italic, weight 600

   - **"Confirm & Submit" button** (green Btn with Check icon):
     - Saves all clipboard_entries to Supabase (final values)
     - Updates clipboard_status: `submitted = true`, `submitted_at = now()`
     - After saving, replaces the summary with a confirmation screen:

   - **Confirmation screen** (replaces the summary, not a new route):
     - Centered layout, screen-fade animation
     - Green checkmark: 100px circle, bg `#DCFCE7`, box-shadow `0 6px 16px rgba(22, 163, 74, 0.2)`, Check icon 56px green
     - "All done for today, [Name]." — 32px, weight 800, color `#166534`
     - "See you tomorrow!" — 18px, color `#6B7280`, weight 500
     - "Back to Start" button (blue Btn with LogOut icon) → navigates to `/`

**Verification:**
- `npm run build` passes
- Afternoon toggle only enables after entering morning data
- Re-logging in after heading out lands in afternoon mode
- EDITED badge appears when Taking Out differs from morning snapshot
- EDITED badge disappears when value matches morning snapshot again
- Brought Back clamps when Taking Out decreases
- Damaged/Lost only shows when out > back
- Summary shows correct calculated values
- Submit saves to Supabase and shows confirmation

---
