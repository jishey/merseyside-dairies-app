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
