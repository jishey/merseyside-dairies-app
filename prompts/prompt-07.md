## Prompt 7: Anomaly Detection + Confirm Flow

**Goal:** Add anomaly detection logic to the clipboard morning mode and build the anomaly confirmation screen. The prototype file `merseyside-dairies-app.jsx` is the source of truth — look at the `isAnomaly`, `getAverageData` functions and the `confirm-anomalies` screen section.

**Important context from previous prompts:**
- Shared components exist: Phone, Page, Btn, BackBtn, Stepper, NumPad, PinDots, StatusBadge, BottomNav
- ClipboardScreen.tsx exists with morning mode (product cards + Taking Out steppers)
- Helper functions exist in `src/lib/helpers/anomaly.ts` (isAnomaly, getAverageData)
- The Supabase `clipboard_entries` table has 90 days of historical seed data

**Instructions:**

1. **Add anomaly warnings to ClipboardScreen.tsx** (morning mode product cards):
   - For each product, fetch the last 4 same-day-of-week historical entries from Supabase using `getHistoricalEntries()` from queries.ts
   - Call `isAnomaly()` to check if the current "Taking Out" value is unusual
   - Track confirmed anomalies in component state: `confirmedAnomalies: Record<string, boolean>` keyed by `${milkmanId}-${productId}`
   - When a product IS an anomaly AND NOT confirmed:
     - Change the product card background to `#FEF3C7` (amber)
     - Change card border to `2px solid #F59E0B`
     - Show a warning box inside the card, below the stepper:
       - Background: `#FFF7ED`, border-radius: 8px, border: `1px solid #FBBF24`
       - Flex row: AlertTriangle icon (14px) + text on left, dismiss button on right
       - Text: `Avg ~{average} on {Dayname}s (last 4 weeks)` — font 14px, weight 600, color `#92400E`
       - "That's right" dismiss button: padding 8px 14px, border-radius 8px, border `2px solid #F59E0B`, background `#FEF3C7`, font weight 700, font 13px, color `#92400E`
       - Clicking "That's right" adds the key to confirmedAnomalies and removes the warning

2. **Update "Confirm & Head Out" button logic:**
   - When clicked, check for any products that are anomalies AND not confirmed
   - If unconfirmed anomalies exist: navigate to `/confirm-anomalies/[id]` (pass anomaly data via URL params or context)
   - If NO unconfirmed anomalies:
     - Save `morning_out` values to `clipboard_entries` for ALL products (this is the morning snapshot)
     - Create/update `clipboard_status` record: `headed_out = true`, `headed_out_at = now()`
     - Navigate to `/headed-out/[id]`

3. **Create `src/app/confirm-anomalies/[id]/page.tsx`:**
   - Full amber/yellow screen — Phone wrapper with bg `#FEF3C7`
   - No BottomNav, no BackBtn at top
   - Layout (all centred):
     - Warning icon: 90px circle, background `#FDE68A`, box-shadow `0 6px 16px rgba(245, 158, 11, 0.25)`, contains AlertTriangle 48px color `#D97706`
     - "Hold on, [Name]" heading — 26px, weight 800, color `#92400E`, letter-spacing -0.02em
     - "These amounts look unusual — are you sure?" — 17px, color `#A16207`, weight 600
   - List of anomaly products (white cards):
     - Each card: white bg, border-radius 14px, padding 16px 18px, border `2px solid #FBBF24`, box-shadow `0 2px 8px rgba(0,0,0,0.06)`
     - Product colour dot (14px) + name (17px, weight 800, `#1E293B`) + size (14px, `#78716C`, weight 600)
     - Below: "Taking **{value}** — avg ~{average} on {Dayname}s (last 4 wks)" — 15px, color `#92400E`, weight 600, with the value in font-size 20px bold
   - Two buttons at bottom:
     - "Yes, that's right — Head Out" (Btn, amber `#F59E0B`, with Check icon):
       - Confirms ALL anomalies
       - Saves morning_out snapshot to clipboard_entries
       - Sets headed_out in clipboard_status
       - Navigates to `/headed-out/[id]`
     - "Go Back & Fix" (Btn, outline, color `#92400E`, with ChevronLeft icon):
       - Navigates back to `/clipboard/[id]`

4. **Update the headed-out page** to actually save the morning snapshot and clipboard_status to Supabase before showing the confirmation.

**Anomaly detection rules (CRITICAL — these are battle-tested edge cases from the prototype):**
- Don't flag anomalies until 4 weeks of same-day data exist
- If the 4-week average is 0, don't flag
- Taking 0 when you normally take something IS an anomaly — but ONLY if the milkman has started filling in their clipboard (at least one other product has out > 0)
- Empty clipboards (all zeros, hasn't started yet) must NOT trigger anomalies
- The threshold is >25% deviation: `Math.abs(value - avg) / avg > 0.25`

**Verification:**
- `npm run build` passes
- Products with values >25% from the 4-week average show amber warnings
- "That's right" button dismisses individual anomaly warnings
- "Confirm & Head Out" with unconfirmed anomalies goes to the confirm screen
- "Confirm & Head Out" with no anomalies goes directly to headed-out
- The confirm-anomalies screen lists only the flagged products
- Morning snapshot (morning_out) values are saved to Supabase

---
