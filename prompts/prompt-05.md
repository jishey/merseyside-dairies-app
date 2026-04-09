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
