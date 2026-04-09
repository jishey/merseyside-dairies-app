## Prompt 14: Settings + Milkman Management + Absences + Final Polish

**Goal:** Build the settings page with milkman management and absence management, add offline detection, and do a final verification pass. The prototype file `merseyside-dairies-app.jsx` is the source of truth — look at SCREEN 18 (Settings). The absence management UI is new (mentioned in HANDOFF.md but not fully in the prototype) and needs to be built.

**Important context from previous prompts:**
- All other screens and components exist
- milkmen, absences, settings tables in Supabase
- Admin auth context exists

**Instructions:**

1. **Create `src/app/admin/settings/page.tsx`:**
   - Protected admin route
   - "Settings" heading — 32px, weight 800, colour `#1E3A5F`, margin-bottom 28px

   - **Supplier Email section:**
     - Label "SUPPLIER EMAIL" (16px, weight 800, `#64748B`, uppercase, letter-spacing 0.05em, margin-bottom 10px)
     - Input: full width, padding 16px, font 16px, border-radius 12px, border `2px solid #E2E8F0`, weight 600
     - Auto-save on blur to settings table

   - **Quick Links section** (margin-bottom 32px, padding-bottom 24px, border-bottom `2px solid #E2E8F0`):
     - "Quick Links" sub-heading — 20px, weight 800, `#1E293B`, margin-bottom 14px
     - "Stock Targets" button (blue outline Btn with Calculator icon) → `/admin/targets`
     - "Manage Products" button (blue outline Btn with Package icon) → `/admin/products`

   - **Manage Milkmen section:**
     - "Manage Milkmen" sub-heading — 20px, weight 800, `#1E293B`, margin-bottom 14px
     - List of milkmen:
       - Each row: `#F8FAFC` bg, padding 14px 16px, border-radius 10px, border `2px solid #E2E8F0`
       - Left: name (18px, weight 800, `#1E293B`) + "PIN: {XXXX}" below (12px, `#64748B`, weight 600)
       - Right: "Remove" button:
         - Padding 6px 12px, border-radius 8px, border `2px solid #FCA5A5`, bg `#FEE2E2`, colour `#DC2626`, weight 800, font 12px
         - Trash2 icon + "Remove"
         - On click: `confirm('Remove {Name}? This cannot be undone.')`
         - Soft-delete: set active = false in Supabase, refresh list
     - **"Add Milkman" button** (below the list):
       - Dashed border: full width, border `2px dashed #93C5FD`, bg `#EFF6FF`, colour `#2563EB`, weight 800, font 14px, border-radius 10px, padding 12px
       - Plus icon + "Add Milkman"
       - On click: expands to show add form
     - **Add form** (replaces the button when active):
       - Background `#F8FAFC`, padding 14px, border-radius 10px, border `2px solid #E2E8F0`
       - Name input: placeholder "Name", full width, padding 8px, border-radius 6px, border `1px solid #CBD5E1`, font 14px, margin-bottom 10px
       - PIN input: placeholder "PIN (4 digits)", same styling, margin-bottom 10px
       - Two buttons flex row:
         - "Add" (green bg `#16A34A`, white text, Check icon) — flex 1
         - "Cancel" (grey bg `#E2E8F0`, grey text `#64748B`, X icon) — flex 1
       - On Add: insert to milkmen table, refresh list, clear form, hide add form

   - **Absence Management section** (NEW — must be designed and built):
     - "Today's Absences" sub-heading — 20px, weight 800, `#1E293B`, margin-top 32px, margin-bottom 14px
     - For each active milkman, show a row:
       - Background `#F8FAFC`, padding 14px 16px, border-radius 10px, border `2px solid #E2E8F0`, margin-bottom 8px
       - Name on the left (16px, weight 700)
       - Right side:
         - If NOT absent: "Mark Off" button (amber outline, small: padding 6px 14px, border-radius 8px, border `2px solid #FCD34D`, bg `#FEF3C7`, colour `#92400E`, weight 700, font 13px)
         - If absent:
           - "Covered by:" label + select dropdown showing other milkmen + "John" option
           - "Clear" button (grey outline, small) to remove the absence
     - When marking off: insert to absences table with today's date, default covering_id = null (John covers)
     - When selecting a cover: update the covering_id in absences table
     - When clearing: delete from absences table

   - **Version footer:**
     - "v1.0.0 — Merseyside Dairies Clipboard" — 13px, colour `#9CA3AF`, weight 800, uppercase, letter-spacing 0.05em, centred, margin-bottom 32px

   - **"Log Out" button** (red Btn with LogOut icon):
     - Clears admin auth context
     - Navigates to `/`

   - Padding bottom 100px for BottomNav
   - BottomNav, active = 'settings'

2. **Add offline detection** (global, affects all screens):
   - Create a component `src/components/shared/OfflineDetector.tsx`:
     - Uses `navigator.onLine` state + `online`/`offline` event listeners
     - When offline, renders the No WiFi screen:
       - Full-screen centred layout, screen-fade animation
       - WifiOff icon: 80px (use lucide-react WifiOff), colour `#64748B`
       - Circle behind icon: 100px, border-radius 50%, background `rgba(100,116,139,0.08)`, margin-bottom 24px
       - "Looks like you're not connected" — 28px, weight 800, colour `#1E293B`, letter-spacing -0.02em
       - "Pop back on the depot WiFi and try again." — 18px, colour `#64748B`, line-height 1.6
       - "Try Again" button (blue Btn, margin-top 32px) — calls `window.location.reload()`
     - When online, renders children normally
   - Wrap the app layout with this component

3. **Final verification pass:**
   - Run `npx tsc --noEmit` — fix ALL TypeScript errors
   - Run `npm run build` — must pass cleanly
   - Check these critical flows work end-to-end:
     - Milkman: welcome → PIN → clipboard (morning) → head out → re-login → clipboard (afternoon) → summary → submit → back to welcome
     - Admin: login → dashboard shows counts → fridge count → view clipboards → order calculator → send order → check history → settings
     - Anomaly flow: enter unusual values → see warnings → confirm or fix
     - Absences: mark someone off → welcome shows them greyed out → dashboard excludes them from counts
     - Close day: close → milkmen blocked → reopen → milkmen can access again
     - Products: add, edit colour/name/size, delete
     - Milkmen: add, remove
   - Check all text is 18px+ for readability
   - Check all touch targets are 48px+
   - Check the app works at 430px width (mobile viewport)

**Verification:**
- `npx tsc --noEmit` — zero TypeScript errors
- `npm run build` — clean build, no warnings
- Full milkman flow works end-to-end
- Full admin flow works end-to-end
- Absences properly exclude milkmen from counts and totals
- Offline screen appears when WiFi is disconnected
- All data persists in Supabase across page reloads
- The app looks and behaves identically to the prototype

---

**End of BUILD-PROMPTS.md**

These 14 prompts build the app in strict dependency order. Paste each one into Claude Code, wait for verification to pass, then move to the next. The prototype file `merseyside-dairies-app.jsx` is always the source of truth — if anything in these prompts conflicts with the prototype, the prototype wins.
