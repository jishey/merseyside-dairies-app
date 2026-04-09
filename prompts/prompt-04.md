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
