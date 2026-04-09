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
