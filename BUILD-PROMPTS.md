# Merseyside Dairies — Build Prompts

This document contains 14 numbered prompts. Luke will paste each prompt into Claude Code one at a time, in order, and wait for completion before moving to the next. The **prototype file `merseyside-dairies-app.jsx` is the single source of truth** for all UI, logic, spacing, colours, and interactions. Every screen, every animation, every edge case is tested and iterated.

**Before You Start:**
1. Create a new Supabase project called "MerseysideDairies" in region eu-west-2
2. Note down the **Project URL** and **Anon Key** from the Supabase dashboard
3. Create a new folder for the project on your machine
4. Open Claude Code in that folder

---

## Prompt 1: Project Scaffolding

**Goal:** Set up the Next.js app structure, Tailwind config, global styles, and environment setup.

Create a new Next.js 14+ app with these specifications:

1. Run: `npx create-next-app@latest merseyside-dairies --typescript --tailwind --app --srcDir --skip-git --no-eslint`

2. Install dependencies:
   ```bash
   npm install @supabase/supabase-js @supabase/ssr lucide-react recharts
   npm install -D @types/node @types/react typescript
   ```

3. Create `.env.local` in the project root with these values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://lngshsqdnszrpkzzosdz.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuZ3Noc3FkbnN6cnBrenpvc2R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjU4NDksImV4cCI6MjA5MTMwMTg0OX0.Pl79pGD8JKDJvXb6-srCUs_0atSlgOGvL6Tn5DGySkQ
   ```

4. The project already has a `CLAUDE.md` and `.claude/rules/` directory with detailed rule files. Read `CLAUDE.md` and all files in `.claude/rules/` before proceeding. These contain:
   - `CLAUDE.md` -- main project instructions, tech stack, critical rules, file structure, routing
   - `.claude/rules/workflow.md` -- plan-first protocol, verification checklist
   - `.claude/rules/lessons.md` -- hard-won lessons from the prototype (bugs already fixed, do not regress)
   - `.claude/rules/architecture.md` -- error handling, state management, component patterns
   - `.claude/rules/security.md` -- PIN auth, admin auth, RLS policies
   - `.claude/rules/ui.md` -- clipboard metaphor, design tokens, animations, stepper pattern, mobile-first rules
   - `.claude/rules/supabase.md` -- database patterns, query conventions, migration rules
   - `.claude/rules/testing.md` -- what to test, testing strategy

5. Update `src/app/globals.css` with:
   ```css
   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

   * {
     box-sizing: border-box;
   }

   body {
     margin: 0;
     padding: 0;
     font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
     font-size: 16px;
     line-height: 1.5;
     color: #1E293B;
   }

   /* Hide stepper number input spinners */
   input.stepper-num::-webkit-outer-spin-button,
   input.stepper-num::-webkit-inner-spin-button {
     -webkit-appearance: none;
     margin: 0;
   }

   input.stepper-num {
     -moz-appearance: textfield;
     font-variant-numeric: tabular-nums;
   }

   /* Clipboard paper texture */
   .paper-bg {
     background: #FDF6E3;
     background-image:
       radial-gradient(ellipse at 20% 50%, rgba(255,248,230,0.6) 0%, transparent 50%),
       radial-gradient(ellipse at 80% 20%, rgba(255,245,220,0.4) 0%, transparent 50%);
   }

   /* Screen transitions */
   .screen-fade {
     animation: fadeIn 0.2s ease-out;
   }

   @keyframes fadeIn {
     from {
       opacity: 0;
       transform: translateY(8px);
     }
     to {
       opacity: 1;
       transform: translateY(0);
     }
   }

   /* Shake animation for PIN errors */
   @keyframes shake {
     0%, 100% {
       transform: translateX(0);
     }
     25% {
       transform: translateX(-8px);
     }
     75% {
       transform: translateX(8px);
     }
   }

   .shake {
     animation: shake 0.3s ease-in-out;
   }

   /* Milk gradient */
   .milk-gradient {
     background: linear-gradient(135deg, #1E3A5F 0%, #2563EB 50%, #1E3A5F 100%);
   }

   /* Global scrollbar */
   ::-webkit-scrollbar {
     width: 8px;
     height: 8px;
   }

   ::-webkit-scrollbar-track {
     background: #F8FAFC;
   }

   ::-webkit-scrollbar-thumb {
     background: #CBD5E1;
     border-radius: 4px;
   }

   ::-webkit-scrollbar-thumb:hover {
     background: #94A3B8;
   }
   ```

6. Update `src/app/layout.tsx`:
   ```typescript
   import type { Metadata, Viewport } from 'next'
   import './globals.css'

   export const metadata: Metadata = {
     title: 'Merseyside Dairies Clipboard',
     description: 'Depot clipboard app for milk delivery tracking',
   }

   export const viewport: Viewport = {
     width: 'device-width',
     initialScale: 1,
     maximumScale: 1,
     userScalable: false,
   }

   export default function RootLayout({
     children,
   }: {
     children: React.ReactNode
   }) {
     return (
       <html lang="en">
         <body>{children}</body>
       </html>
     )
   }
   ```

7. Create folder structure:
   ```
   src/
     app/
       layout.tsx
       page.tsx
       globals.css
     components/
       shared/
       milkman/
       admin/
     lib/
       supabase/
       helpers/
       utils.ts
     types/
       index.ts
   ```

8. Create `src/types/index.ts` with TypeScript types for all data models (milkmen, products, clipboard entries, clipboard status, absences, fridge counts, stock targets, orders, order items, day status, settings):
   ```typescript
   export interface Milkman {
     id: number
     name: string
     pin: string
     active: boolean
   }

   export interface Product {
     id: number
     name: string
     size: string
     color: string
     active: boolean
   }

   export interface ClipboardEntry {
     id: number
     milkmanId: number
     productId: number
     date: string
     out: number
     back: number
     waste: number
     morningOut?: number
   }

   export interface ClipboardStatus {
     id: number
     milkmanId: number
     date: string
     headedOut: boolean
     headedOutAt?: string
     submitted: boolean
     submittedAt?: string
   }

   export interface Absence {
     id: number
     milkmanId: number
     date: string
     coveringId?: number
   }

   export interface FridgeCount {
     id: number
     productId: number
     date: string
     quantity: number
     countedAt: string
   }

   export interface StockTarget {
     id: number
     productId: number
     dayOfWeek: string
     target: number
   }

   export interface Order {
     id: number
     date: string
     supplierEmail: string
     emailBody: string
     sentAt: string
   }

   export interface OrderItem {
     id: number
     orderId: number
     productId: number
     quantity: number
   }

   export interface DayStatus {
     id: number
     date: string
     closed: boolean
     closedAt?: string
   }

   export interface Settings {
     key: string
     value: string
   }
   ```

**Verification:**
- `npm run build` completes without errors
- `npm run dev` starts the dev server
- No TypeScript errors with `npx tsc --noEmit`
- `.env.local` file created with placeholder values
- Global CSS includes stepper styling, animations, and design tokens

---

## Prompt 2: Supabase Schema + Seed Data

**Goal:** Create the database schema, migrations, and seed data in Supabase.

1. Create `supabase/migrations/001_schema.sql` with the complete schema:
   ```sql
   -- Milkmen table
   CREATE TABLE milkmen (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     pin TEXT NOT NULL CHECK (pin ~ '^\d{4}$'),
     active BOOLEAN DEFAULT true,
     created_at TIMESTAMPTZ DEFAULT now(),
     sort_order INT DEFAULT 0
   );

   -- Products table
   CREATE TABLE products (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     size TEXT NOT NULL,
     color TEXT NOT NULL CHECK (color ~ '^#[0-9A-F]{6}$'),
     active BOOLEAN DEFAULT true,
     sort_order INT DEFAULT 0
   );

   -- Clipboard entries
   CREATE TABLE clipboard_entries (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     milkman_id UUID NOT NULL REFERENCES milkmen(id),
     product_id UUID NOT NULL REFERENCES products(id),
     date DATE NOT NULL,
     out INT DEFAULT 0,
     back INT DEFAULT 0,
     waste INT DEFAULT 0,
     morning_out INT,
     created_at TIMESTAMPTZ DEFAULT now(),
     updated_at TIMESTAMPTZ DEFAULT now(),
     UNIQUE(milkman_id, product_id, date)
   );

   -- Clipboard status
   CREATE TABLE clipboard_status (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     milkman_id UUID NOT NULL REFERENCES milkmen(id),
     date DATE NOT NULL,
     headed_out BOOLEAN DEFAULT false,
     headed_out_at TIMESTAMPTZ,
     submitted BOOLEAN DEFAULT false,
     submitted_at TIMESTAMPTZ,
     UNIQUE(milkman_id, date)
   );

   -- Absences
   CREATE TABLE absences (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     milkman_id UUID NOT NULL REFERENCES milkmen(id),
     date DATE NOT NULL,
     covering_id UUID REFERENCES milkmen(id),
     UNIQUE(milkman_id, date)
   );

   -- Fridge counts
   CREATE TABLE fridge_counts (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     product_id UUID NOT NULL REFERENCES products(id),
     date DATE NOT NULL,
     quantity INT DEFAULT 0,
     counted_at TIMESTAMPTZ,
     UNIQUE(product_id, date)
   );

   -- Stock targets
   CREATE TABLE stock_targets (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     product_id UUID NOT NULL REFERENCES products(id),
     day_of_week TEXT NOT NULL CHECK (day_of_week IN ('mon','tue','wed','thu','fri','sat')),
     target INT NOT NULL,
     UNIQUE(product_id, day_of_week)
   );

   -- Orders
   CREATE TABLE orders (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     date DATE NOT NULL,
     supplier_email TEXT,
     email_body TEXT,
     sent_at TIMESTAMPTZ
   );

   -- Order items
   CREATE TABLE order_items (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     order_id UUID NOT NULL REFERENCES orders(id),
     product_id UUID NOT NULL REFERENCES products(id),
     quantity INT NOT NULL
   );

   -- Day status
   CREATE TABLE day_status (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     date DATE NOT NULL UNIQUE,
     closed BOOLEAN DEFAULT false,
     closed_at TIMESTAMPTZ
   );

   -- Settings
   CREATE TABLE settings (
     key TEXT PRIMARY KEY,
     value TEXT
   );

   -- Indexes for performance
   CREATE INDEX idx_clipboard_entries_milkman_date ON clipboard_entries(milkman_id, date);
   CREATE INDEX idx_clipboard_entries_product_date ON clipboard_entries(product_id, date);
   CREATE INDEX idx_clipboard_status_milkman_date ON clipboard_status(milkman_id, date);
   CREATE INDEX idx_absences_date ON absences(date);
   CREATE INDEX idx_fridge_counts_date ON fridge_counts(date);
   CREATE INDEX idx_orders_date ON orders(date);
   ```

2. Create `scripts/seed.ts` to populate default data:
   ```typescript
   import { createClient } from '@supabase/supabase-js'

   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
   const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

   const supabase = createClient(supabaseUrl, supabaseServiceKey)

   const MILKMEN_DATA = [
     { name: 'Ian', pin: '1234', sort_order: 1 },
     { name: 'Gary', pin: '5678', sort_order: 2 },
     { name: 'Andy', pin: '9012', sort_order: 3 },
     { name: 'Joseph', pin: '3456', sort_order: 4 },
     { name: 'Tommy', pin: '7890', sort_order: 5 },
     { name: 'Reg', pin: '2345', sort_order: 6 },
     { name: 'Frank', pin: '6789', sort_order: 7 },
   ]

   const PRODUCTS_DATA = [
     { name: 'Blue Milk', size: '2 Litre', color: '#2563EB', sort_order: 1 },
     { name: 'Green Milk', size: '2 Litre', color: '#16A34A', sort_order: 2 },
     { name: 'Blue Milk', size: '1 Litre', color: '#2563EB', sort_order: 3 },
     { name: 'Green Milk', size: '1 Litre', color: '#16A34A', sort_order: 4 },
     { name: 'Blue Milk', size: 'Pint', color: '#2563EB', sort_order: 5 },
     { name: 'Green Milk', size: 'Pint', color: '#16A34A', sort_order: 6 },
   ]

   const STOCK_TARGETS = {
     mon: { 1: 45, 2: 40, 3: 28, 4: 25, 5: 15, 6: 12 },
     tue: { 1: 48, 2: 42, 3: 30, 4: 27, 5: 16, 6: 13 },
     wed: { 1: 42, 2: 38, 3: 26, 4: 23, 5: 14, 6: 11 },
     thu: { 1: 45, 2: 40, 3: 28, 4: 25, 5: 15, 6: 12 },
     fri: { 1: 55, 2: 48, 3: 35, 4: 30, 5: 19, 6: 15 },
     sat: { 1: 50, 2: 45, 3: 32, 4: 28, 5: 18, 6: 14 },
   }

   async function seed() {
     try {
       // Insert milkmen
       const { data: milkmenData, error: milkmenError } = await supabase
         .from('milkmen')
         .insert(MILKMEN_DATA)
         .select()

       if (milkmenError) throw milkmenError
       console.log('Inserted milkmen:', milkmenData)

       // Insert products
       const { data: productsData, error: productsError } = await supabase
         .from('products')
         .insert(PRODUCTS_DATA)
         .select()

       if (productsError) throw productsError
       console.log('Inserted products:', productsData)

       // Insert stock targets
       const targetsToInsert = []
       for (const [dayOfWeek, targets] of Object.entries(STOCK_TARGETS)) {
         for (const product of productsData) {
           targetsToInsert.push({
             product_id: product.id,
             day_of_week: dayOfWeek,
             target: targets[product.sort_order] || 40,
           })
         }
       }

       const { error: targetsError } = await supabase
         .from('stock_targets')
         .insert(targetsToInsert)

       if (targetsError) throw targetsError
       console.log('Inserted stock targets')

       // Insert default settings
       const { error: settingsError } = await supabase
         .from('settings')
         .insert([
           { key: 'supplier_email', value: 'supplier@dairy.co.uk' },
           { key: 'admin_username', value: 'john' },
           { key: 'admin_password', value: 'admin' },
         ])

       if (settingsError) throw settingsError
       console.log('Inserted settings')

       console.log('Seed completed successfully!')
     } catch (error) {
       console.error('Seed failed:', error)
       process.exit(1)
     }
   }

   seed()
   ```

3. Update `.env.local` to add the service role key (Luke will provide this from Supabase):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

4. Tell Luke:
   - Run the migration in the Supabase dashboard (SQL Editor), copy-paste the 001_schema.sql file
   - Add SUPABASE_SERVICE_ROLE_KEY to .env.local
   - Run `npx tsx scripts/seed.ts` to populate default data

**Verification:**
- Migration applies without errors in Supabase SQL Editor
- Seed script runs successfully: `npx tsx scripts/seed.ts`
- All 7 milkmen appear in the milkmen table
- All 6 products appear in the products table
- Stock targets populated for all products and days
- Settings table contains supplier_email, admin_username, admin_password

---

## Prompt 3: Data Layer + Helper Functions

**Goal:** Create Supabase client wrappers and helper utilities for dates, anomaly detection, order calculations, etc.

1. Create `src/lib/supabase/client.ts` (browser-side Supabase client):
   ```typescript
   import { createBrowserClient } from '@supabase/ssr'

   export const createClient = () =>
     createBrowserClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
     )
   ```

2. Create `src/lib/helpers/date.ts` with these functions:
   ```typescript
   // dateStr('2026-04-09') format for DB keys
   export function dateStr(d: Date): string {
     return d.toISOString().split('T')[0]
   }

   // Friendly format: "Thursday 9th April"
   export function formatDate(d: Date): string {
     const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
     const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
     const nth = (n: number) => {
       const s = n + (['st','nd','rd'][((n+90)%100-10)%10-1] || 'th')
       return String(s).slice(-2) === 'st' ? `${n}st` :
              String(s).slice(-2) === 'nd' ? `${n}nd` :
              String(s).slice(-2) === 'rd' ? `${n}rd` : `${n}th`
     }
     return `${days[d.getDay()]} ${nth(d.getDate())} ${months[d.getMonth()]}`
   }

   // Time format: "14:30"
   export function timeNow(): string {
     const d = new Date()
     return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
   }

   // Time-based greeting
   export function greeting(): string {
     const h = new Date().getHours()
     if (h < 12) return 'Good morning'
     if (h < 17) return 'Good afternoon'
     return 'Good evening'
   }

   // Get day of week: 'mon', 'tue', etc
   export function getDayOfWeek(d: Date): string {
     const days = ['sun','mon','tue','wed','thu','fri','sat']
     return days[d.getDay()]
   }

   // Get day of week for tomorrow
   export function getTomorrowDayOfWeek(): string {
     const d = new Date()
     d.setDate(d.getDate() + 1)
     return getDayOfWeek(d)
   }
   ```

3. Create `src/lib/helpers/anomaly.ts`:
   ```typescript
   // Returns { avg, weeks } where weeks = number of same-day-of-week data points
   export function getAverageData(
     history: Record<string, any>,
     milkmanId: number,
     productId: number,
     today: Date
   ): { avg: number; weeks: number } {
     const h = history[milkmanId]
     if (!h) return { avg: 0, weeks: 0 }

     const days = ['sun','mon','tue','wed','thu','fri','sat']
     const dow = days[today.getDay()]

     const sameDayEntries = Object.entries(h)
       .filter(([ds]) => {
         const d = new Date(ds + 'T00:00:00')
         return days[d.getDay()] === dow
       })
       .sort(([a], [b]) => b.localeCompare(a))
       .slice(0, 4)

     const vals = sameDayEntries.map(([, prods]: any) => prods[productId]?.out || 0)
     if (vals.length === 0) return { avg: 0, weeks: 0 }

     const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
     return { avg, weeks: vals.length }
   }

   // Check if a value is an anomaly
   export function isAnomaly(
     currentValue: number,
     average: number,
     weeks: number,
     hasStarted: boolean
   ): boolean {
     // Need at least 4 weeks of data
     if (weeks < 4) return false
     // Don't flag if average is 0
     if (average === 0) return false
     // Taking 0 is anomaly only if milkman has started
     if (currentValue === 0) return hasStarted
     // >25% difference from average is anomaly
     return Math.abs(currentValue - average) / average > 0.25
   }
   ```

4. Create `src/lib/helpers/clipboard.ts`:
   ```typescript
   export type MilkmanStatus = 'submitted' | 'anomaly' | 'progress' | 'not_started'

   // Calculate sold quantity
   export function calculateSold(out: number, back: number, waste: number): number {
     return out - back - waste
   }

   // Clamp brought-back to taking-out value
   export function clampBroughtBack(currentBack: number, newOut: number): number {
     return Math.min(currentBack, newOut)
   }

   // Determine milkman's status
   export function milkmanStatus(
     submitted: boolean,
     hasUnconfirmedAnomalies: boolean,
     hasData: boolean
   ): MilkmanStatus {
     if (submitted) return 'submitted'
     if (hasUnconfirmedAnomalies) return 'anomaly'
     if (hasData) return 'progress'
     return 'not_started'
   }
   ```

5. Create `src/lib/helpers/order.ts`:
   ```typescript
   // Calculate suggested order amount
   export function calculateSuggested(
     tomorrowTarget: number,
     inFridge: number,
     returned: number
   ): number {
     const onHand = inFridge + returned
     return Math.max(0, tomorrowTarget - onHand)
   }

   // Generate order email body
   export function generateOrderEmail(
     products: any[],
     quantities: Record<number, number>,
     supplierEmail: string
   ): string {
     const items = products
       .map(p => `- ${p.name} (${p.size}): ${quantities[p.id] || 0}`)
       .join('\n')

     return `Hi,

   Please find our order for delivery tomorrow morning:

   ${items}

   Thanks,
   John
   Merseyside Dairies`
   }
   ```

6. Create `src/lib/utils.ts` with utility functions:
   ```typescript
   // Standard utility functions like classNames, throttle, etc if needed
   export function classNames(...classes: (string | false | undefined)[]): string {
     return classes.filter(Boolean).join(' ')
   }
   ```

**Verification:**
- `npx tsc --noEmit` shows no TypeScript errors in helper files
- All helper functions have proper type annotations
- Date helpers format dates correctly (test manually)
- Anomaly detection logic matches the prototype's math

---

## Prompt 4: Shared UI Components

**Goal:** Build all reusable UI components that appear across the app.

Create these components in `src/components/shared/`:

1. **Phone.tsx** — Max-width 430px phone container
   ```typescript
   export interface PhoneProps {
     children: React.ReactNode
     bg?: string
   }

   export default function Phone({ children, bg = '#F8FAFC' }: PhoneProps) {
     return (
       <div style={{
         maxWidth: 430,
         margin: '0 auto',
         minHeight: '100vh',
         background: bg,
         position: 'relative',
         fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
         boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
         borderRadius: 24,
         overflow: 'hidden',
         border: '8px solid #f1f5f9',
       }}>
         {children}
       </div>
     )
   }
   ```

2. **Page.tsx** — Page wrapper with optional cream background
   ```typescript
   export interface PageProps {
     children: React.ReactNode
     cream?: boolean
     padBottom?: number
   }

   export default function Page({ children, cream = false, padBottom = 24 }: PageProps) {
     return (
       <div
         style={{
           minHeight: '100vh',
           padding: `24px 20px ${padBottom}px`,
           background: cream ? '#FDF6E3' : '#fff',
         }}
         className="screen-fade"
       >
         {children}
       </div>
     )
   }
   ```

3. **Btn.tsx** — Primary button with gradient backgrounds
   ```typescript
   export interface BtnProps {
     children: React.ReactNode
     onClick: () => void
     color?: string
     outline?: boolean
     disabled?: boolean
     full?: boolean
     style?: React.CSSProperties
   }

   export default function Btn({
     children,
     onClick,
     color = '#2563EB',
     outline = false,
     disabled = false,
     full = true,
     style = {},
   }: BtnProps) {
     const colorMap: Record<string, string> = {
       '#16A34A': 'linear-gradient(135deg, #16A34A, #15803D)',
       '#2563EB': 'linear-gradient(135deg, #2563EB, #1D4ED8)',
       '#DC2626': 'linear-gradient(135deg, #DC2626, #B91C1C)',
     }

     return (
       <button
         onClick={onClick}
         disabled={disabled}
         style={{
           width: full ? '100%' : 'auto',
           padding: '16px 24px',
           borderRadius: 14,
           fontSize: 18,
           fontWeight: 800,
           border: outline ? `2px solid ${color}` : 'none',
           background: outline ? 'transparent' : (disabled ? '#D1D5DB' : (colorMap[color] || color)),
           color: outline ? color : '#fff',
           cursor: disabled ? 'default' : 'pointer',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           gap: 8,
           minHeight: 56,
           boxShadow: outline ? 'none' : (disabled ? 'none' : `0 4px 12px ${color}33`),
           transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
           ...style,
         }}
       >
         {children}
       </button>
     )
   }
   ```

4. **BackBtn.tsx** — Blue back button with ChevronLeft icon
   ```typescript
   import { ChevronLeft } from 'lucide-react'

   export interface BackBtnProps {
     onClick: () => void
     label?: string
   }

   export default function BackBtn({ onClick, label = 'Back' }: BackBtnProps) {
     return (
       <button
         onClick={onClick}
         style={{
           display: 'flex',
           alignItems: 'center',
           gap: 6,
           background: 'none',
           border: 'none',
           color: '#2563EB',
           fontWeight: 800,
           fontSize: 17,
           cursor: 'pointer',
           padding: '8px 0',
           marginBottom: 20,
           transition: 'all 0.2s',
           letterSpacing: '-0.02em',
         }}
       >
         <ChevronLeft size={24} /> {label}
       </button>
     )
   }
   ```

5. **Stepper.tsx** — Number input with +/- buttons and local draft state pattern
   ```typescript
   export interface StepperProps {
     value: number
     onChange: (value: number) => void
     min?: number
     max?: number
     disabled?: boolean
   }

   export default function Stepper({
     value,
     onChange,
     min = 0,
     max = 999,
     disabled = false,
   }: StepperProps) {
     const [typing, setTyping] = React.useState(false)
     const [draft, setDraft] = React.useState('')

     return (
       <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
         <button
           disabled={disabled || value <= min}
           onClick={() => onChange(Math.max(min, value - 1))}
           style={{
             width: 48,
             height: 48,
             borderRadius: '50%',
             border: 'none',
             background: disabled ? '#F3F4F6' : 'linear-gradient(135deg, #f0f4f8, #ffffff)',
             fontSize: 24,
             fontWeight: 800,
             color: disabled ? '#9CA3AF' : '#1E293B',
             cursor: disabled ? 'default' : 'pointer',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             boxShadow: disabled ? 'none' : '0 2px 6px rgba(0,0,0,0.08)',
             transition: 'all 0.15s',
           }}
         >
           −
         </button>

         <input
           type="text"
           inputMode="numeric"
           pattern="[0-9]*"
           className="stepper-num"
           value={typing ? draft : value}
           disabled={disabled}
           onFocus={() => {
             setTyping(true)
             setDraft('')
           }}
           onChange={(e) => {
             const raw = e.target.value.replace(/[^0-9]/g, '')
             setDraft(raw)
           }}
           onBlur={() => {
             setTyping(false)
             if (draft === '') return
             const n = parseInt(draft, 10)
             if (!isNaN(n)) onChange(Math.max(min, Math.min(max, n)))
           }}
           onKeyDown={(e) => {
             if (e.key === 'Enter') e.currentTarget.blur()
           }}
           style={{
             width: 72,
             textAlign: 'center',
             fontSize: 28,
             fontWeight: 800,
             color: disabled ? '#9CA3AF' : '#1E293B',
             background: disabled ? '#F3F4F6' : (typing ? '#F0FDF4' : '#fff'),
             border: typing ? '2px solid #2563EB' : '2px solid #E2E8F0',
             borderRadius: 10,
             padding: '8px 6px',
             outline: 'none',
             transition: 'all 0.15s',
             boxShadow: typing ? '0 0 0 3px rgba(37, 99, 235, 0.1)' : 'none',
           }}
         />

         <button
           disabled={disabled}
           onClick={() => onChange(Math.min(max, value + 1))}
           style={{
             width: 48,
             height: 48,
             borderRadius: '50%',
             border: 'none',
             background: disabled ? '#F3F4F6' : 'linear-gradient(135deg, #f0f4f8, #ffffff)',
             fontSize: 24,
             fontWeight: 800,
             color: disabled ? '#9CA3AF' : '#1E293B',
             cursor: disabled ? 'default' : 'pointer',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             boxShadow: disabled ? 'none' : '0 2px 6px rgba(0,0,0,0.08)',
             transition: 'all 0.15s',
           }}
         >
           +
         </button>
       </div>
     )
   }
   ```

6. **NumPad.tsx** — 3x4 grid numeric keypad
   ```typescript
   import { X } from 'lucide-react'

   export interface NumPadProps {
     onPress: (key: number) => void
     onDelete: () => void
   }

   export default function NumPad({ onPress, onDelete }: NumPadProps) {
     const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del']

     return (
       <div style={{
         display: 'grid',
         gridTemplateColumns: 'repeat(3, 1fr)',
         gap: 12,
         maxWidth: 300,
         margin: '0 auto',
       }}>
         {keys.map((k, i) => {
           if (k === '') return <div key={i} />

           return (
             <button
               key={i}
               onClick={() => (k === 'del' ? onDelete() : onPress(Number(k)))}
               style={{
                 height: 64,
                 borderRadius: 12,
                 fontSize: 28,
                 fontWeight: 800,
                 border: 'none',
                 background: k === 'del' ? 'linear-gradient(135deg, #FEE2E2, #FECACA)' : '#fff',
                 color: k === 'del' ? '#DC2626' : '#1E293B',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 cursor: 'pointer',
                 boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                 transition: 'all 0.15s',
               }}
             >
               {k === 'del' ? <X size={28} /> : k}
             </button>
           )
         })}
       </div>
     )
   }
   ```

7. **PinDots.tsx** — 4 filled/unfilled dots for PIN entry
   ```typescript
   export interface PinDotsProps {
     length: number
     filled: number
   }

   export default function PinDots({ length, filled }: PinDotsProps) {
     return (
       <div style={{
         display: 'flex',
         gap: 16,
         justifyContent: 'center',
         margin: '24px 0',
       }}>
         {Array.from({ length }).map((_, i) => (
           <div
             key={i}
             style={{
               width: 24,
               height: 24,
               borderRadius: '50%',
               background: i < filled ? '#2563EB' : '#E2E8F0',
               border: 'none',
               transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
               transform: i < filled ? 'scale(1.1)' : 'scale(1)',
             }}
           />
         ))}
       </div>
     )
   }
   ```

8. **StatusBadge.tsx** — Status pill badge
   ```typescript
   export interface StatusBadgeProps {
     status: 'submitted' | 'progress' | 'anomaly' | 'not_started'
   }

   export default function StatusBadge({ status }: StatusBadgeProps) {
     const colors: Record<string, { bg: string; text: string; border: string }> = {
       submitted: { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' },
       progress: { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
       anomaly: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
       not_started: { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1' },
     }

     const labels: Record<string, string> = {
       submitted: 'Submitted',
       progress: 'In Progress',
       anomaly: 'Has Anomalies',
       not_started: 'Not Started',
     }

     const c = colors[status]

     return (
       <span
         style={{
           padding: '6px 14px',
           borderRadius: 20,
           fontSize: 12,
           fontWeight: 800,
           background: c.bg,
           color: c.text,
           border: `1px solid ${c.border}`,
           letterSpacing: '0.05em',
           textTransform: 'uppercase',
         }}
       >
         {labels[status]}
       </span>
     )
   }
   ```

9. **BottomNav.tsx** — Fixed navigation bar (admin only)
   ```typescript
   import { Home, ClipboardList, Calculator, Clock, Settings as SettingsIcon } from 'lucide-react'

   export interface BottomNavProps {
     active: string
     onNav: (id: string) => void
   }

   export default function BottomNav({ active, onNav }: BottomNavProps) {
     const items = [
       { icon: Home, label: 'Home', id: 'dashboard' },
       { icon: ClipboardList, label: 'Clipboards', id: 'clipboards' },
       { icon: Calculator, label: 'Order', id: 'order' },
       { icon: Clock, label: 'History', id: 'history' },
       { icon: SettingsIcon, label: 'Settings', id: 'settings' },
     ]

     return (
       <div
         style={{
           position: 'fixed',
           bottom: 0,
           left: '50%',
           transform: 'translateX(-50%)',
           width: '100%',
           maxWidth: 430,
           background: '#fff',
           borderTop: '1px solid #E2E8F0',
           display: 'flex',
           zIndex: 50,
           boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
         }}
       >
         {items.map(({ icon: Icon, label, id }) => (
           <button
             key={id}
             onClick={() => onNav(id)}
             style={{
               flex: 1,
               padding: '10px 0',
               display: 'flex',
               flexDirection: 'column',
               alignItems: 'center',
               gap: 2,
               border: 'none',
               background: active === id ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
               cursor: 'pointer',
               color: active === id ? '#2563EB' : '#94A3B8',
               transition: 'all 0.2s',
               borderRadius: active === id ? '12px 12px 0 0' : '0',
             }}
           >
             <Icon size={24} strokeWidth={active === id ? 2.5 : 2} />
             <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.05em' }}>
               {label}
             </span>
           </button>
         ))}
       </div>
     )
   }
   ```

**Verification:**
- `npm run build` passes
- `npm run dev` shows no component errors
- `npx tsc --noEmit` reports no type errors
- All components use proper TypeScript interfaces

---

## Prompt 5: Welcome Screen + PIN Entry + Setup

**Goal:** Build the three initial screens milkmen see: welcome list, PIN entry, and new milkman setup.

1. Create `src/components/milkman/WelcomeScreen.tsx`:
   ```typescript
   'use client'

   import { useState } from 'react'
   import { User, AlertTriangle } from 'lucide-react'
   import Phone from '@/components/shared/Phone'
   import Page from '@/components/shared/Page'
   import Btn from '@/components/shared/Btn'
   import { formatDate, greeting } from '@/lib/helpers/date'
   import StatusBadge from '@/components/shared/StatusBadge'

   export interface WelcomeScreenProps {
     milkmen: Array<{ id: number; name: string }>
     absences: Record<number, { coveringId?: number; coveringName?: string }>
     dayClosed: boolean
     onSelectMilkman: (id: number) => void
     onNewMilkman: () => void
     onAdminLogin: () => void
   }

   export default function WelcomeScreen({
     milkmen,
     absences,
     dayClosed,
     onSelectMilkman,
     onNewMilkman,
     onAdminLogin,
   }: WelcomeScreenProps) {
     return (
       <Phone bg="#fff">
         <Page>
           {/* Gradient header */}
           <div style={{
             background: 'linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)',
             borderRadius: 20,
             padding: '32px 24px',
             textAlign: 'center',
             marginBottom: 32,
             boxShadow: '0 8px 24px rgba(30, 58, 95, 0.15)',
           }}>
             <img
               src="https://merseysidedairies.co.uk/wp-content/uploads/2016/04/Merseyside_Dairies_Logo_PNG.png"
               alt="Merseyside Dairies"
               style={{ height: 80, margin: '0 auto 16px' }}
             />
             <h1 style={{
               fontSize: 32,
               fontWeight: 800,
               color: '#fff',
               letterSpacing: '-0.02em',
               margin: 0,
             }}>
               {greeting()}!
             </h1>
             <p style={{
               fontSize: 16,
               color: 'rgba(255,255,255,0.9)',
               margin: '8px 0 0',
             }}>
               {formatDate(new Date())}
             </p>
             <p style={{
               fontSize: 18,
               fontWeight: 600,
               color: 'rgba(255,255,255,0.95)',
               margin: '16px 0 0',
             }}>
               Tap your name to get started
             </p>
           </div>

           {/* Day closed warning */}
           {dayClosed && (
             <div style={{
               background: '#FEE2E2',
               border: '1px solid #FCA5A5',
               borderRadius: 12,
               padding: 16,
               marginBottom: 24,
               display: 'flex',
               gap: 12,
               alignItems: 'flex-start',
             }}>
               <AlertTriangle size={24} color="#DC2626" style={{ marginTop: 2, flexShrink: 0 }} />
               <div>
                 <p style={{
                   fontSize: 16,
                   fontWeight: 800,
                   color: '#DC2626',
                   margin: 0,
                   letterSpacing: '-0.02em',
                 }}>
                   Today's round is closed
                 </p>
                 <p style={{
                   fontSize: 14,
                   color: '#991B1B',
                   margin: '4px 0 0',
                 }}>
                   Milkmen cannot access their clipboards.
                 </p>
               </div>
             </div>
           )}

           {/* Milkman list */}
           <div style={{ marginBottom: 32 }}>
             {milkmen.map((m) => {
               const isAbsent = absences[m.id]
               return (
                 <button
                   key={m.id}
                   onClick={() => !dayClosed && !isAbsent && onSelectMilkman(m.id)}
                   disabled={dayClosed || isAbsent}
                   style={{
                     width: '100%',
                     background: isAbsent ? '#F1F5F9' : '#fff',
                     border: `2px solid ${isAbsent ? '#94A3B8' : '#E2E8F0'}`,
                     borderLeft: isAbsent ? '4px solid #94A3B8' : `4px solid ${m.id % 2 === 0 ? '#2563EB' : '#16A34A'}`,
                     borderRadius: 14,
                     padding: '16px 20px',
                     marginBottom: 12,
                     display: 'flex',
                     alignItems: 'center',
                     gap: 16,
                     cursor: dayClosed || isAbsent ? 'default' : 'pointer',
                     transition: 'all 0.2s',
                     opacity: dayClosed || isAbsent ? 0.6 : 1,
                   }}
                 >
                   <div style={{
                     width: 40,
                     height: 40,
                     borderRadius: '50%',
                     background: m.id % 2 === 0 ? '#2563EB' : '#16A34A',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     color: '#fff',
                     fontWeight: 800,
                     fontSize: 18,
                   }}>
                     <User size={20} />
                   </div>
                   <div style={{ flex: 1, textAlign: 'left' }}>
                     <p style={{
                       fontSize: 20,
                       fontWeight: 800,
                       color: isAbsent ? '#94A3B8' : '#1E293B',
                       margin: 0,
                       letterSpacing: '-0.02em',
                     }}>
                       {m.name}
                     </p>
                     {isAbsent && (
                       <p style={{
                         fontSize: 14,
                         color: '#64748B',
                         margin: '4px 0 0',
                       }}>
                         Off today — covered by {absences[m.id].coveringName || 'John'}
                       </p>
                     )}
                   </div>
                 </button>
               )
             })}
           </div>

           {/* Bottom buttons */}
           <div style={{ marginBottom: 24 }}>
             <Btn onClick={onNewMilkman} color="#2563EB" outline>
               I'm New Here
             </Btn>
           </div>

           <div style={{ textAlign: 'center', marginTop: 16 }}>
             <button
               onClick={onAdminLogin}
               style={{
                 background: 'none',
                 border: 'none',
                 color: '#2563EB',
                 fontSize: 16,
                 fontWeight: 800,
                 cursor: 'pointer',
                 textDecoration: 'underline',
                 transition: 'all 0.2s',
               }}
             >
               Admin Login
             </button>
           </div>
         </Page>
       </Phone>
     )
   }
   ```

2. Create `src/components/milkman/PinEntry.tsx`:
   ```typescript
   'use client'

   import { useState, useEffect } from 'react'
   import Phone from '@/components/shared/Phone'
   import Page from '@/components/shared/Page'
   import BackBtn from '@/components/shared/BackBtn'
   import NumPad from '@/components/shared/NumPad'
   import PinDots from '@/components/shared/PinDots'

   export interface PinEntryProps {
     milkman: { id: number; name: string; pin: string }
     onBack: () => void
     onCorrect: () => void
   }

   export default function PinEntry({ milkman, onBack, onCorrect }: PinEntryProps) {
     const [pinEntry, setPinEntry] = useState('')
     const [pinError, setPinError] = useState(false)
     const [shaking, setShaking] = useState(false)

     useEffect(() => {
       if (pinEntry.length === 4) {
         if (pinEntry === milkman.pin) {
           onCorrect()
         } else {
           setPinError(true)
           setShaking(true)
           setTimeout(() => {
             setPinEntry('')
             setPinError(false)
             setShaking(false)
           }, 400)
         }
       }
     }, [pinEntry, milkman.pin, onCorrect])

     return (
       <Phone bg="#F8FAFC">
         <Page>
           <BackBtn onClick={onBack} />

           <div style={{
             textAlign: 'center',
             marginBottom: 40,
             animation: shaking ? 'shake 0.3s ease-in-out' : 'none',
           }}>
             <h1 style={{
               fontSize: 48,
               fontWeight: 800,
               color: '#1E3A5F',
               margin: 0,
               letterSpacing: '-0.02em',
             }}>
               {milkman.name}
             </h1>
             <p style={{
               fontSize: 16,
               color: '#78716C',
               marginTop: 12,
               fontWeight: 600,
             }}>
               Enter your PIN
             </p>
           </div>

           <PinDots length={4} filled={pinEntry.length} />

           {pinError && (
             <div style={{
               background: '#FEE2E2',
               border: '1px solid #FCA5A5',
               borderRadius: 10,
               padding: 12,
               textAlign: 'center',
               marginBottom: 24,
               color: '#DC2626',
               fontWeight: 800,
               fontSize: 14,
             }}>
               That's not right, try again
             </div>
           )}

           <div style={{ marginTop: 40 }}>
             <NumPad
               onPress={(k) => pinEntry.length < 4 && setPinEntry(pinEntry + k)}
               onDelete={() => setPinEntry(pinEntry.slice(0, -1))}
             />
           </div>
         </Page>
       </Phone>
     )
   }
   ```

3. Create `src/components/milkman/SetupWizard.tsx`:
   ```typescript
   'use client'

   import { useState } from 'react'
   import Phone from '@/components/shared/Phone'
   import Page from '@/components/shared/Page'
   import Btn from '@/components/shared/Btn'
   import BackBtn from '@/components/shared/BackBtn'
   import NumPad from '@/components/shared/NumPad'
   import PinDots from '@/components/shared/PinDots'

   export interface SetupWizardProps {
     onBack: () => void
     onComplete: (name: string, pin: string) => void
   }

   export default function SetupWizard({ onBack, onComplete }: SetupWizardProps) {
     const [step, setStep] = useState(1) // 1=name, 2=pin, 3=confirm
     const [name, setName] = useState('')
     const [pin, setPin] = useState('')
     const [pinConfirm, setPinConfirm] = useState('')
     const [error, setError] = useState('')

     const handleNextName = () => {
       if (name.trim()) {
         setStep(2)
         setError('')
       }
     }

     const handleNextPin = () => {
       if (pin.length === 4) {
         setStep(3)
         setError('')
       }
     }

     const handleConfirmPin = () => {
       if (pin === pinConfirm) {
         onComplete(name, pin)
       } else {
         setError("PINs don't match. Try again.")
         setPinConfirm('')
       }
     }

     return (
       <Phone bg="#F8FAFC">
         <Page>
           <BackBtn onClick={onBack} label="Back" />

           {step === 1 && (
             <div>
               <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1E3A5F', marginBottom: 24, letterSpacing: '-0.02em' }}>
                 What's your name?
               </h1>
               <input
                 type="text"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 placeholder="Enter your name"
                 style={{
                   width: '100%',
                   padding: 16,
                   fontSize: 18,
                   borderRadius: 12,
                   border: '2px solid #E2E8F0',
                   marginBottom: 24,
                   fontFamily: 'inherit',
                 }}
               />
               <Btn onClick={handleNextName} disabled={!name.trim()}>
                 Next
               </Btn>
             </div>
           )}

           {step === 2 && (
             <div>
               <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1E3A5F', marginBottom: 24, letterSpacing: '-0.02em' }}>
                 Choose a 4-digit PIN, {name}
               </h1>
               <div style={{ textAlign: 'center', marginBottom: 40 }}>
                 <PinDots length={4} filled={pin.length} />
               </div>
               <NumPad
                 onPress={(k) => pin.length < 4 && setPin(pin + k)}
                 onDelete={() => setPin(pin.slice(0, -1))}
               />
               <div style={{ marginTop: 40, display: 'flex', gap: 12 }}>
                 <Btn onClick={() => setStep(1)} color="#2563EB" outline>
                   Back
                 </Btn>
                 <Btn onClick={handleNextPin} disabled={pin.length !== 4}>
                   Next
                 </Btn>
               </div>
             </div>
           )}

           {step === 3 && (
             <div>
               <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1E3A5F', marginBottom: 24, letterSpacing: '-0.02em' }}>
                 Confirm your PIN
               </h1>
               <div style={{ textAlign: 'center', marginBottom: 40 }}>
                 <PinDots length={4} filled={pinConfirm.length} />
               </div>

               {error && (
                 <div style={{
                   background: '#FEE2E2',
                   border: '1px solid #FCA5A5',
                   borderRadius: 10,
                   padding: 12,
                   textAlign: 'center',
                   marginBottom: 24,
                   color: '#DC2626',
                   fontWeight: 800,
                   fontSize: 14,
                 }}>
                   {error}
                 </div>
               )}

               <NumPad
                 onPress={(k) => pinConfirm.length < 4 && setPinConfirm(pinConfirm + k)}
                 onDelete={() => setPinConfirm(pinConfirm.slice(0, -1))}
               />
               <div style={{ marginTop: 40, display: 'flex', gap: 12 }}>
                 <Btn onClick={() => setStep(2)} color="#2563EB" outline>
                   Back
                 </Btn>
                 <Btn onClick={handleConfirmPin} disabled={pinConfirm.length !== 4} color="#16A34A">
                   Create My Clipboard
                 </Btn>
               </div>
             </div>
           )}
         </Page>
       </Phone>
     )
   }
   ```

4. Create `src/app/page.tsx` (Welcome screen entry point):
   ```typescript
   'use client'

   import { useState, useEffect } from 'react'
   import WelcomeScreen from '@/components/milkman/WelcomeScreen'
   import PinEntry from '@/components/milkman/PinEntry'
   import SetupWizard from '@/components/milkman/SetupWizard'
   import { createClient } from '@/lib/supabase/client'

   type Screen = 'welcome' | 'pin' | 'setup'

   export default function Home() {
     const [screen, setScreen] = useState<Screen>('welcome')
     const [milkmen, setMilkmen] = useState<Array<{ id: number; name: string; pin: string }>>([])
     const [selectedMilkmanId, setSelectedMilkmanId] = useState<number | null>(null)
     const [absences, setAbsences] = useState<Record<number, any>>({})
     const [dayClosed, setDayClosed] = useState(false)

     const supabase = createClient()

     // Load milkmen on mount
     useEffect(() => {
       loadMilkmen()
       loadAbsences()
       loadDayStatus()
     }, [])

     const loadMilkmen = async () => {
       // TODO: Load from Supabase when implemented
       setMilkmen([])
     }

     const loadAbsences = async () => {
       // TODO: Load from Supabase
       setAbsences({})
     }

     const loadDayStatus = async () => {
       // TODO: Load from Supabase
       setDayClosed(false)
     }

     const handleSelectMilkman = (id: number) => {
       setSelectedMilkmanId(id)
       setScreen('pin')
     }

     const handleNewMilkman = () => {
       setScreen('setup')
     }

     const handleAdminLogin = () => {
       // TODO: Navigate to admin login
     }

     const handlePinCorrect = () => {
       // TODO: Navigate to clipboard
     }

     const handleSetupComplete = (name: string, pin: string) => {
       // TODO: Save new milkman and navigate to clipboard
       setScreen('welcome')
     }

     if (screen === 'pin' && selectedMilkmanId) {
       const milkman = milkmen.find((m) => m.id === selectedMilkmanId)
       if (!milkman) return null
       return (
         <PinEntry
           milkman={milkman}
           onBack={() => setScreen('welcome')}
           onCorrect={handlePinCorrect}
         />
       )
     }

     if (screen === 'setup') {
       return (
         <SetupWizard
           onBack={() => setScreen('welcome')}
           onComplete={handleSetupComplete}
         />
       )
     }

     return (
       <WelcomeScreen
         milkmen={milkmen}
         absences={absences}
         dayClosed={dayClosed}
         onSelectMilkman={handleSelectMilkman}
         onNewMilkman={handleNewMilkman}
         onAdminLogin={handleAdminLogin}
       />
     )
   }
   ```

**Verification:**
- `npm run build` passes
- Welcome screen displays with all milkmen
- PIN entry accepts 4 digits and shows correct/error states
- Setup wizard navigates through 3 steps
- No TypeScript errors

---

## Prompt 6: Clipboard Screen — Morning Mode

**Goal:** Build the core clipboard screen with morning mode, stepper interactions, and data persistence.

1. Create `src/components/milkman/ClipboardScreen.tsx`:
   ```typescript
   'use client'

   import { useState } from 'react'
   import Phone from '@/components/shared/Phone'
   import Page from '@/components/shared/Page'
   import Btn from '@/components/shared/Btn'
   import BackBtn from '@/components/shared/BackBtn'
   import Stepper from '@/components/shared/Stepper'
   import { formatDate } from '@/lib/helpers/date'
   import { LogOut } from 'lucide-react'

   export interface ClipboardScreenProps {
     milkman: { id: number; name: string }
     products: Array<{ id: number; name: string; size: string; color: string }>
     data: Record<number, { out: number; back: number; waste: number }>
     onDataChange: (productId: number, field: string, value: number) => void
     onHeadOut: () => void
     onLogout: () => void
     onFlip: () => void
   }

   export default function ClipboardScreen({
     milkman,
     products,
     data,
     onDataChange,
     onHeadOut,
     onLogout,
     onFlip,
   }: ClipboardScreenProps) {
     const today = new Date()
     const hasData = products.some((p) => (data[p.id]?.out || 0) > 0)

     return (
       <Phone bg="#E8E0D0">
         <div style={{ padding: '0 12px', paddingBottom: 120 }}>
           {/* Clipboard clip */}
           <div style={{
             width: 80,
             height: 32,
             background: 'linear-gradient(135deg, #78716C, #57534E, #78716C)',
             borderRadius: '0 0 12px 12px',
             border: '3px solid #57534E',
             margin: '8px auto 0',
             boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1), 0 4px 8px rgba(0,0,0,0.2)',
             position: 'relative',
             zIndex: 10,
           }} />

           {/* Clipboard paper */}
           <div
             style={{
               background: '#FDF6E3',
               borderRadius: '0 0 16px 16px',
               padding: '24px 18px 28px',
               boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
               marginTop: -8,
               minHeight: '80vh',
               position: 'relative',
               backgroundImage:
                 'radial-gradient(ellipse at 20% 50%, rgba(255,248,230,0.6) 0%, transparent 50%),' +
                 'radial-gradient(ellipse at 80% 20%, rgba(255,245,220,0.4) 0%, transparent 50%)',
             }}
             className="screen-fade"
           >
             {/* Folded corner */}
             <div
               onClick={onFlip}
               style={{
                 position: 'absolute',
                 top: 0,
                 right: 0,
                 width: 48,
                 height: 48,
                 background: 'linear-gradient(135deg, #F5E6D3, #E8DCC8)',
                 clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
                 cursor: 'pointer',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 zIndex: 20,
               }}
             >
               <div
                 style={{
                   fontSize: 9,
                   fontWeight: 800,
                   color: '#92400E',
                   transform: 'rotate(45deg) translateX(8px)',
                   whiteSpace: 'nowrap',
                 }}
               >
                 FLIP
               </div>
             </div>

             {/* Header */}
             <div style={{ marginBottom: 28, paddingRight: 48 }}>
               <h1
                 style={{
                   fontSize: 28,
                   fontWeight: 800,
                   color: '#1E3A5F',
                   margin: 0,
                   letterSpacing: '-0.02em',
                 }}
               >
                 {milkman.name}'s Clipboard
               </h1>
               <p style={{ fontSize: 16, color: '#78716C', margin: '8px 0 0', fontWeight: 600 }}>
                 {formatDate(today)}
               </p>
             </div>

             {/* Product cards */}
             {products.map((product) => {
               const productData = data[product.id] || { out: 0, back: 0, waste: 0 }
               return (
                 <div
                   key={product.id}
                   style={{
                     background: '#FFFBF0',
                     borderRadius: 12,
                     padding: 16,
                     marginBottom: 16,
                     border: '1px solid #E8DCC8',
                     borderLeft: `4px solid ${product.color}`,
                   }}
                 >
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                     <div
                       style={{
                         width: 16,
                         height: 16,
                         borderRadius: '50%',
                         background: product.color,
                       }}
                     />
                     <div>
                       <p style={{ fontSize: 18, fontWeight: 800, color: '#1E3A5F', margin: 0 }}>
                         {product.name}
                       </p>
                       <p style={{ fontSize: 14, color: '#78716C', margin: '2px 0 0' }}>
                         {product.size}
                       </p>
                     </div>
                   </div>

                   <label style={{ fontSize: 14, fontWeight: 800, color: '#57534E', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 12 }}>
                     Taking Out
                   </label>

                   <Stepper
                     value={productData.out}
                     onChange={(v) => onDataChange(product.id, 'out', v)}
                   />
                 </div>
               )
             })}

             {/* Action button */}
             <div style={{ marginTop: 32, marginBottom: 16 }}>
               <Btn
                 onClick={onHeadOut}
                 color="#16A34A"
                 disabled={!hasData}
               >
                 Confirm & Head Out
               </Btn>
             </div>

             {/* Logout button */}
             <Btn onClick={onLogout} outline color="#78716C" style={{ marginBottom: 16 }}>
               <LogOut size={20} /> Log Out
             </Btn>
           </div>
         </div>
       </Phone>
     )
   }
   ```

2. Create `src/app/clipboard/[id]/page.tsx`:
   ```typescript
   'use client'

   import { useState, useEffect } from 'react'
   import ClipboardScreen from '@/components/milkman/ClipboardScreen'
   import { createClient } from '@/lib/supabase/client'

   export default function ClipboardPage({ params }: { params: { id: string } }) {
     const [milkman, setMilkman] = useState<any>(null)
     const [products, setProducts] = useState<any[]>([])
     const [data, setData] = useState<Record<number, any>>({})

     const supabase = createClient()
     const milkmanId = parseInt(params.id, 10)

     useEffect(() => {
       loadData()
     }, [])

     const loadData = async () => {
       // TODO: Load from Supabase
     }

     const handleDataChange = async (productId: number, field: string, value: number) => {
       setData((prev) => ({
         ...prev,
         [productId]: { ...prev[productId], [field]: value },
       }))
       // TODO: Save to Supabase (debounced)
     }

     const handleHeadOut = () => {
       // TODO: Navigate to anomaly check or headed-out screen
     }

     const handleLogout = () => {
       // TODO: Navigate to welcome
     }

     const handleFlip = () => {
       // TODO: Navigate to history
     }

     if (!milkman || products.length === 0) {
       return <div>Loading...</div>
     }

     return (
       <ClipboardScreen
         milkman={milkman}
         products={products}
         data={data}
         onDataChange={handleDataChange}
         onHeadOut={handleHeadOut}
         onLogout={handleLogout}
         onFlip={handleFlip}
       />
     )
   }
   ```

**Verification:**
- Clipboard displays with all products
- Stepper +/- buttons work without app flicker
- Stepper tap-to-type works (focus clears, blur commits)
- "Confirm & Head Out" button disabled until data entered
- Data persists when navigating away and back

---

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
