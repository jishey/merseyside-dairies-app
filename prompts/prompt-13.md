## Prompt 13: Stock Targets + Product Management + History & Reporting

**Goal:** Build stock targets editor, product management CRUD, and the history/reporting screen with charts. The prototype file `merseyside-dairies-app.jsx` is the source of truth — look at SCREEN 14 (Order Targets), SCREEN 15 (Product Management), and SCREEN 16 (History & Reporting).

**Important context from previous prompts:**
- Admin auth, BottomNav exist
- stock_targets, products tables in Supabase
- recharts is installed as a dependency

**Instructions:**

1. **Create `src/app/admin/targets/page.tsx` (Stock Targets):**
   - Protected admin route
   - BackBtn → `/admin/settings`
   - "Stock Targets" heading — 32px, weight 800, colour `#1E3A5F`
   - "How much of each product do you want in the fridge each morning?" subtitle — 15px, colour `#64748B`, weight 600, margin-bottom 20px
   - **Day tabs** (horizontal scrollable row, gap 8px, overflow-x auto):
     - 6 tabs: Mon, Tue, Wed, Thu, Fri, Sat
     - Active tab: background `linear-gradient(135deg, #2563EB, #1D4ED8)`, white text, box-shadow `0 4px 12px rgba(37, 99, 235, 0.2)`, letter-spacing -0.01em
     - Inactive tab: white bg, border `2px solid #E2E8F0`, colour `#64748B`
     - All tabs: padding 10px 16px, border-radius 12px, weight 800, font 15px, flex-shrink 0
   - Product list for selected day (each with Stepper):
     - Same card style: `#F8FAFC` bg, border `#E2E8F0`, left border = product colour
     - Colour dot + name + size + Stepper
   - "Save Targets" button (green Btn with Check icon):
     - Upserts to stock_targets for selected day
     - Navigate back
   - BottomNav

2. **Create `src/app/admin/products/page.tsx` (Product Management):**
   - Protected admin route
   - BackBtn → `/admin/settings`
   - "Products" heading — 32px, weight 800

   - **Product list:**
     - Each product in a card: `#F8FAFC` bg, border `#E2E8F0`, left border 4px solid product colour
     - **View mode:** colour dot + name (18px, weight 800) + size (14px, `#64748B`) on left, "Edit" button on right
       - Edit button: padding 8px 14px, border-radius 10px, border `2px solid #E2E8F0`, white bg, font 13px, weight 700, with Edit3 icon
     - **Edit mode** (replaces view mode when Edit clicked):
       - Name input (full width, padding 12px, font 16px, border-radius 10px, border `2px solid #E2E8F0`, margin-bottom 10px)
       - Size input (same styling)
       - **Colour palette:** 8 circular buttons (40px), one for each colour from the handoff palette
         - Selected: `3px solid #1E293B`, ring shadow (`0 0 0 3px #fff, 0 0 0 5px {hex}`), white Check icon inside
         - Unselected: `3px solid #E2E8F0`
         - All: cursor pointer, transition all 0.2s
       - Two buttons flex row:
         - "Done" (green Btn with Check icon, flex 1)
         - "Delete" (red Btn with Trash2 icon, flex 1):
           - `confirm('Remove this product from all future clipboards?')`
           - Soft-delete: set active = false in Supabase

   - **Add Product section:**
     - Initially hidden, shown when "Add Product" button (green outline with Plus icon) is clicked
     - Green card: `#F0FDF4` bg, border `2px solid #86EFAC`, border-radius 12px, padding 16px
     - Name input, Size input (placeholder "Size (e.g. 1 Litre)"), Colour palette
     - "Add Product" button (green Btn with Check icon)
     - Inserts to products table in Supabase, refreshes the list
   - BottomNav

3. **Create `src/app/admin/history/page.tsx` (History & Reporting):**
   - Protected admin route
   - "History" heading — 32px, weight 800
   - **Daily/Weekly toggle** (same pill style as morning/afternoon toggle on clipboard):
     - Background `#F8FAFC`, border-radius 14px, padding 3px
     - "Daily" / "Weekly" tabs
     - Active: white bg, shadow, colour `#1E3A5F`
     - Inactive: transparent, colour `#64748B`

   - **Daily view:**
     - Date navigation (same arrows as historical clipboard — 48px, border-radius 12px)
     - Date display centred (20px, weight 800)
     - **3-card summary row** (CSS grid, 3 columns, gap 12px):
       - Taken Out: blue gradient (`#EFF6FF → #DBEAFE`), border `#93C5FD` — 32px number, `#1E40AF`, label "TAKEN OUT"
       - Returned: amber gradient (`#FFFBEB → #FEF3C7`), border `#FCD34D` — label "RETURNED"
       - Sold: green gradient (`#F0FDF4 → #DCFCE7`), border `#86EFAC` — label "SOLD"
       - Each card: padding 16px, border-radius 12px, text-align centre, 2px border
       - Labels: 13px, `#64748B`, weight 800, uppercase, letter-spacing 0.05em, margin-top 6px
     - **Per-product breakdown** (below the summary):
       - Rows: flex space-between, padding 12px 0, border-bottom `1px solid #E2E8F0`
       - Left: colour dot (10px) + name + size (15px, weight 700, `#1E293B`)
       - Right: "{X} sold" — 15px, weight 800, colour `#16A34A`
     - Data fetched: sum all milkmen's clipboard_entries for the selected date

   - **Weekly view:**
     - "Total Sold — Last 7 Days" heading — 18px, weight 800, colour `#1E293B`, letter-spacing -0.02em, margin-bottom 16px
     - recharts bar chart:
       ```jsx
       <ResponsiveContainer width="100%" height={280}>
         <BarChart data={weekData}>
           <XAxis dataKey="day" tick={{ fontSize: 14, fontWeight: 700 }} />
           <YAxis tick={{ fontSize: 14, fontWeight: 700 }} />
           <Tooltip />
           <Bar dataKey="sold" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
           <defs>
             <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
               <stop offset="0" stopColor="#2563EB" />
               <stop offset="1" stopColor="#1D4ED8" />
             </linearGradient>
           </defs>
         </BarChart>
       </ResponsiveContainer>
       ```
     - weekData: array of `{ day: 'Mon', sold: number }` for the last 7 days
     - Calculate sold = sum of (out - back - waste) across all milkmen for each day
   - BottomNav, active = 'history'

**Verification:**
- `npm run build` passes
- Stock targets save per day-of-week to Supabase
- Products can be added, edited (name, size, colour), and deleted
- Colour palette shows selected state correctly
- History daily view shows correct totals from Supabase
- Weekly bar chart renders with gradient bars
- All screens have working BottomNav

---
