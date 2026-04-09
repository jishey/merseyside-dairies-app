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
