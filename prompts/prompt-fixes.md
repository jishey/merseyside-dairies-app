# Fix Prompt: Prototype Alignment + MVP Adjustments

Read CLAUDE.md and all files in .claude/rules/ before starting. Read the prototype `merseyside-dairies-app.jsx` for visual reference on every change below. The prototype is the source of truth -- if the built app doesn't match it, the built app is wrong.

## Part A: Fix What's Broken

### 1. Add "Drive Safe" Confirmation Screen (MISSING)

Create a new page at `src/app/headed-out/[id]/page.tsx`.

This screen shows after a milkman confirms their anomalies and taps "Yes, that's right -- Head Out" on the confirm-anomalies screen. Read the prototype's HeadedOutScreen component and match it exactly:

- Full-screen cream background
- Large animated green circle with white checkmark icon (CircleCheck from lucide-react), scale animation on mount
- Bold heading: "Clipboard Saved"
- Subheading: "Drive safe, {milkman name}!"
- After 3 seconds, automatically redirect to "/" (welcome screen)
- Also show a "Back to Home" button in case they don't want to wait

Update `src/app/confirm-anomalies/[id]/page.tsx` to redirect to `/headed-out/[id]` instead of `/` after the milkman confirms.

### 2. Fix Morning/Afternoon Tab Styling AND Behaviour (COMPLETELY WRONG)

In `src/components/milkman/ClipboardScreen.tsx`, TWO things are wrong with the morning/afternoon toggle:

**A) Styling is wrong.** Currently it's a harsh blue segmented control. Read the prototype's tab styling and match it exactly:

- Container: `background: '#FBF9F4'`, `padding: 3px`, `gap: 10px`, `borderRadius: 14px` (soft pill shape)
- Active tab button: `background: '#fff'`, `color: '#1E3A5F'`, subtle shadow `0 2px 6px rgba(0,0,0,0.08)`, `borderRadius: 11px`
- Inactive tab button: `background: 'transparent'`, `color: '#78716C'`, no shadow
- Font size: 16px, weight: 800
- No borders on the container or buttons
- Tab labels: "Morning Load" and "Back from Round" (NOT "Taking Out" -- the prototype says "Morning Load")

**B) Behaviour is wrong.** When "Back from Round" is active, the product cards must NOT show the "TAKING OUT" stepper. The whole point of the two tabs is:

- **"Morning Load" tab (morning):** Shows ONLY the Taking Out stepper for each product. This is what the milkman fills in before leaving the depot.
- **"Back from Round" tab (afternoon):** Does NOT show Taking Out at all. If they need to fix a morning mistake they tap back to the Morning Load tab. The afternoon tab shows ONLY:
  - **Brought Back** stepper (only if that product had out > 0, max clamped to the Taking Out value)
  - **Damaged / Lost** stepper (only if there's unaccounted product, i.e. out - back > 0, max clamped to out - back)
  - If a product has out = 0, show italic muted text "Nothing taken out -- nothing to bring back" instead of steppers

The Morning Load tab remains editable even in the afternoon -- if a milkman realises they made a mistake in the morning, they tap back to Morning Load and change it there. If they change a Taking Out value after the morning snapshot was taken, show a red EDITED badge on that product card.

Read the prototype's ClipboardScreen component carefully -- it conditionally renders different fields based on which tab is active. The built app is currently showing all three fields (Taking Out, Brought Back, Damaged/Lost) regardless of which tab is selected. This is wrong and must be fixed.

Also when switching to "Back from Round" for the first time, snapshot the current Taking Out values (this is the morning snapshot used for EDITED badge detection later).

### 3. Fix FLIP Corner (CUT OFF)

The "FLIP" text/corner on the clipboard is getting cut off in the top-right. In ClipboardScreen.tsx, make sure:

- The FLIP corner is fully visible and not clipped by overflow hidden on any parent
- It should be a small triangular fold in the top-right corner of the paper
- Tapping it navigates to `/history/[id]`
- Read the prototype for exact styling -- rotated 45 degree text, brown/tan colour

### 4. Fix Day Closed Warning

In `src/components/milkman/WelcomeScreen.tsx`:

- Change border from `1px solid #FCA5A5` to `2px solid #FCA5A5`
- Remove the extra subtitle text "Milkmen cannot access their clipboards" -- just show the main heading "Today's round is closed" with the icon, matching the prototype

## Part B: MVP Adjustments (Diverging From Prototype)

### 5. Remove "I'm New Here" / Setup Wizard

- In `src/components/milkman/WelcomeScreen.tsx`, remove the "I'm New Here" button completely
- Delete `src/components/milkman/SetupWizard.tsx`
- Delete `src/app/setup/page.tsx` if it exists
- Remove any imports referencing these deleted files
- New milkmen are only added by the admin (John) through the admin panel

### 6. Remove "Simulate Offline" Button

- In `src/components/milkman/WelcomeScreen.tsx`, remove the "Simulate Offline" button if present
- Remove `src/components/shared/OfflineDetector.tsx` if it exists and is not used elsewhere

### 7. Add PIN Change for Milkmen

Add a "Change your PIN" link on the headed-out/drive-safe screen (the new screen from step 1). Put it at the bottom, below the "Back to Home" button. Small, subtle text link in muted colour -- not a big button.

When tapped, show a simple inline flow (on the same page or a modal):
- "Enter current PIN" (4 digits via NumPad)
- "Enter new PIN" (4 digits via NumPad)
- "Confirm new PIN" (4 digits via NumPad)
- If current PIN is wrong, show error "Wrong PIN, try again"
- If new PIN and confirm don't match, show error "PINs don't match"
- If successful, update the milkmen table in Supabase and show "PIN changed" confirmation
- Then redirect to "/" after 2 seconds

### 8. Add PIN Management for Admin

In `src/app/admin/settings/page.tsx`, add a section where John can see all milkmen and reset their PINs:

- Show a list of all milkmen with their names
- Each has a "Reset PIN" button
- When clicked, show a simple form to enter a new 4-digit PIN for that milkman
- Update the milkmen table in Supabase
- Show confirmation "PIN updated for {name}"

## Part C: Verify Existing Prototype Features Work

Do NOT just skip this section. Open each file, read it, and verify the logic works correctly. If any of these are missing or broken, fix them to match the prototype.

### 9. EDITED Badge System

In ClipboardScreen.tsx, verify:
- When a milkman switches to afternoon mode ("Back from Round"), the morning "taking out" values are snapshotted
- If a milkman changes a "taking out" value after it was snapshotted, a red "EDITED" badge appears on that product card
- The badge disappears if the value is changed back to match the snapshot
- The badge is NOT a stored boolean -- it's computed by comparing current value to snapshot on every render
- Read lesson #3 in .claude/rules/lessons.md

### 10. Brought-Back Clamping

Verify that when taking-out is decreased, brought-back is clamped: `Math.min(currentBack, newOut)`. You should never be able to have brought-back greater than taking-out. Read lesson #4.

### 11. Anomaly Detection

Verify the anomaly system works:
- When a milkman enters a value that differs >25% from their 4-week same-day average, an amber anomaly warning appears
- Zero values are anomalies ONLY if the milkman has started (other products have out > 0). Read lesson #5.
- The confirm-anomalies screen shows before the milkman can head out if there are unconfirmed anomalies
- Anomalies must be individually confirmed by the milkman before proceeding

### 12. Headed Out Status

Verify:
- headed_out is per-milkman (not a global boolean). Read lesson #7.
- Dashboard clipboard count includes headed-out milkmen. Read lesson #6.

## Part D: Clean Up

### 13. Delete Unused Files

After all changes, check for orphaned imports or unused files. Delete anything no longer referenced.

### 14. Verify Build

Run `npx tsc --noEmit` and `npm run build`. Fix ALL errors before marking done.

## Important Notes

- Do NOT remove the date display on the welcome screen -- keep it
- Do NOT touch admin screens other than adding PIN management to settings
- The Stepper component local draft pattern must not be broken (read lesson #2)
- Test the full milkman flow works: Welcome -> Tap name -> PIN -> Clipboard -> Fill in numbers -> Confirm Anomalies -> Drive Safe -> Home
- Commit when done with a meaningful message
