## Prompt 12: Order Calculator + Email + Order History

**Goal:** Build the order calculator, email draft, and order history screens. The prototype file `merseyside-dairies-app.jsx` is the source of truth — look at SCREEN 12 (Order Calculator), SCREEN 13 (Order Email Draft), and SCREEN 17 (Order History).

**Important context from previous prompts:**
- Admin auth, dashboard, BottomNav exist
- stock_targets, fridge_counts, orders, order_items tables in Supabase
- Order helper functions in `src/lib/helpers/order.ts`

**Instructions:**

1. **Create `src/app/admin/order/page.tsx` (Order Calculator):**
   - Protected admin route
   - "Order Calculator" heading — 32px, weight 800, colour `#1E3A5F`
   - Fetch: products, stock_targets, today's fridge_counts, all clipboard_entries for today (to sum returned)

   - Per-product cards:
     - White bg, border-radius 12px, padding 16px, left border 4px solid product colour, border `2px solid #E2E8F0`, box-shadow `0 2px 4px rgba(0,0,0,0.04)`
     - Product header: colour dot + name + size (18px, weight 800, `#1E3A5F`)
     - **Info grid** (2x2 CSS grid, gap 6px, font 14px, colour `#64748B`, weight 600):
       - "Tomorrow's Target: **{X}**" — looked up from stock_targets for **TOMORROW's day of week** (NOT today!)
       - "In Fridge: **{X}**" — from fridge_counts
       - "Returned: **{X}**" — SUM of ALL milkmen's brought-back values for this product today
       - "On Hand: **{X}**" — In Fridge + Returned
       - Bold values in colour `#1E293B`
     - **Blue highlight box** (centre): background `#EFF6FF`, padding 10px, border-radius 10px, border `2px solid #BFDBFE`
       - "Need to order: {X}" — 15px, weight 800, colour `#1E40AF`, centred
       - Calculated: `max(0, tomorrowTarget - onHand)`
     - **"Your Order:" label + Stepper:**
       - Flex space-between, font 16px, weight 800, `#1E293B`
       - **CRITICAL:** Default value is the suggested amount, NOT 0
       - Pattern: `orderData[productId] ?? suggested` — only store an override when the user manually changes the stepper

   - "Generate Order Email" button (blue Btn with Mail icon):
     - Generate the email text and navigate to `/admin/order/email`
   - "Add / Remove Products" button (grey outline Btn with Package icon) → `/admin/products`
   - BottomNav, active = 'order'

2. **Create `src/app/admin/order/email/page.tsx` (Order Email Draft):**
   - Protected admin route
   - BackBtn → `/admin/order`
   - "Order Email" heading — 32px, weight 800, colour `#1E3A5F`
   - "To: {supplier email}" display: background `#F8FAFC`, padding 14px, border-radius 12px, border `2px solid #E2E8F0`, text 15px weight 800 `#1E293B` uppercase letter-spacing 0.05em
   - Editable textarea:
     - Min-height 300px, border `2px solid #E2E8F0`, border-radius 12px, padding 16px
     - Font 15px, family monospace, line-height 1.6, weight 500, colour `#1E293B`
     - Pre-filled with generated order email (exact format from prototype):
       ```
       Hi,

       Please find our order for delivery tomorrow morning:

       - Blue Milk (2 Litre): {qty}
       - Green Milk (2 Litre): {qty}
       ...

       Thanks,
       John
       Merseyside Dairies
       ```
   - Two buttons:
     - "Send Order" (green Btn with Mail icon):
       - Saves to `orders` table (date, supplier_email, email_body, sent_at)
       - Saves each item to `order_items` table (order_id, product_id, quantity)
       - Shows confirmation screen (replaces the form):
         - Green checkmark circle (100px, `#DCFCE7`, box-shadow)
         - "Order sent!" — 28px, weight 800, colour `#166534`
         - "{email} at {HH:MM}" — 16px, colour `#64748B`, weight 600
         - "Done" button (blue Btn) → `/admin/dashboard`
     - "Redraft" (grey outline Btn with RefreshCw icon) → `/admin/order`

3. **Create `src/app/admin/order/history/page.tsx` (Order History):**
   - "Order History" heading — 32px, weight 800, colour `#1E3A5F`
   - Fetch all orders from Supabase, ordered by date desc
   - List of order cards:
     - Background `#F8FAFC`, border-radius 12px, padding 16px, border `2px solid #E2E8F0`
     - Header row: date (16px, weight 800, `#1E3A5F`) + time (13px, `#64748B`, weight 600)
     - "To: {email}" — 13px, colour `#64748B`
     - Items list in white card (border-radius 8px, padding 10px):
       - Per product: name + size on left, quantity bold on right — font 12px
       - Only show items with quantity > 0
   - **Empty state** (when no orders): Mail icon 48px centred grey, "No orders sent yet" — 16px, weight 600
   - BottomNav, active = 'history'

**Verification:**
- `npm run build` passes
- Order calculator uses TOMORROW's target (not today's)
- Order defaults to suggested amount (not 0)
- Order stepper only stores override when manually changed
- Email pre-populates with correct quantities
- Send saves to orders + order_items in Supabase
- Order history shows past orders with details
- Empty state shows when no orders exist

---
