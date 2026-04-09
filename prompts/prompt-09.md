## Prompt 9: Historical Clipboard

**Goal:** Build the historical clipboard viewer, accessed by tapping the folded "FLIP" corner on the clipboard. The prototype file `merseyside-dairies-app.jsx` is the source of truth — look at SCREEN 5 (Historical Clipboard).

**Important context from previous prompts:**
- The clipboard screen has a folded corner in the top-right that says "FLIP"
- clipboard_entries table has 90 days of seeded history
- Shared components: Phone, Btn, BackBtn all exist

**Instructions:**

1. **Create `src/app/history/[id]/page.tsx`:**
   - Same clipboard metaphor as the main clipboard (board background, clip, paper) — reuse the visual structure from ClipboardScreen
   - Board background: `#E8E0D0`
   - Clipboard clip at top (same as main clipboard)
   - Paper section with cream background and radial gradient texture
   - **NO folded corner on this view** (it's already flipped)

2. **Date navigation** (inside the paper, at the top):
   - Flex row: left arrow | date display | right arrow
   - Arrow buttons: 48px square, border-radius 12px, border `2px solid #E2E8F0`, white bg, box-shadow `0 2px 4px rgba(0,0,0,0.06)`
   - ChevronLeft / ChevronRight icons, 24px, color `#1E293B`
   - Date display centred: formatted date (22px, weight 800, color `#1E3A5F`, letter-spacing -0.02em)
   - Below date: "Read only" label — 13px, color `#78716C`, weight 600, uppercase, letter-spacing 0.05em
   - **Navigation rules:**
     - Start at offset = 1 (yesterday)
     - Left arrow: offset + 1 (go further back in time)
     - Right arrow: offset - 1 (go forward) — **DISABLED when offset = 1** (can never see today, minimum is yesterday)
     - Disabled arrow: background `#F3F4F6`, icon colour `#D1D5DB`, cursor default

3. **Product cards** (read-only, below the navigation):
   - Fetch clipboard_entries from Supabase for the selected date and milkman
   - If data exists: show product cards with:
     - Same card style as clipboard: `#FFFBF0` bg, border `1px solid #E8DCC8`, left border 4px solid product colour
     - Product header: colour dot (12px) + name (17px, weight 800, `#1E3A5F`) + size in parentheses
     - Values row (flex, gap 18px, font 16px, weight 600, color `#57534E`):
       - "Out: **{X}**"
       - "Back: **{Y}**"
       - "Damaged: **{Z}**" (only if > 0, colour `#F59E0B`)
       - "Sold: **{W}**" (colour `#16A34A`)
     - No steppers — this is read-only
   - If NO data: show centred message "No data for this day (Sunday or no record)" — font 18px, colour `#9CA3AF`, padding 40px, weight 500

4. **"Back to Today" button** at the bottom (blue Btn with ChevronLeft icon) → navigates to `/clipboard/[id]`

**Verification:**
- `npm run build` passes
- Clicking FLIP corner on clipboard navigates to history
- Yesterday's data loads from Supabase
- Can navigate back through dates
- Cannot navigate forward past yesterday
- Days with no data show the "No data" message
- "Back to Today" returns to the clipboard

---
