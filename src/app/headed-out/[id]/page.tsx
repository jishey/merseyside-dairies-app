'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Phone from '@/components/shared/Phone'
import Btn from '@/components/shared/Btn'
import NumPad from '@/components/shared/NumPad'
import PinDots from '@/components/shared/PinDots'
import { createClient } from '@/lib/supabase/client'
import { Check, LogOut } from 'lucide-react'

type PinStep = 'current' | 'new' | 'confirm'

export default function HeadedOutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: milkmanId } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [milkmanName, setMilkmanName] = useState('')
  const [milkmanPin, setMilkmanPin] = useState('')
  const [showPinChange, setShowPinChange] = useState(false)
  const [pinStep, setPinStep] = useState<PinStep>('current')
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinSuccess, setPinSuccess] = useState(false)

  useEffect(() => {
    loadMilkman()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-redirect after 3 seconds (only if not changing PIN)
  useEffect(() => {
    if (showPinChange || pinSuccess) return
    const timer = setTimeout(() => {
      router.push('/')
    }, 3000)
    return () => clearTimeout(timer)
  }, [router, showPinChange, pinSuccess])

  const loadMilkman = async () => {
    const { data } = await supabase
      .from('milkmen')
      .select('name, pin')
      .eq('id', milkmanId)
      .single()

    if (data) {
      setMilkmanName(data.name)
      setMilkmanPin(data.pin)
    }
  }

  const handlePinPress = (key: number) => {
    setPinError('')
    if (pinStep === 'current' && currentPin.length < 4) {
      const next = currentPin + String(key)
      setCurrentPin(next)
      if (next.length === 4) {
        if (next !== milkmanPin) {
          setPinError('Wrong PIN, try again')
          setTimeout(() => setCurrentPin(''), 300)
        } else {
          setTimeout(() => setPinStep('new'), 200)
        }
      }
    } else if (pinStep === 'new' && newPin.length < 4) {
      setNewPin(newPin + String(key))
    } else if (pinStep === 'confirm' && confirmPin.length < 4) {
      const next = confirmPin + String(key)
      setConfirmPin(next)
      if (next.length === 4) {
        if (next !== newPin) {
          setPinError("PINs don't match")
          setTimeout(() => {
            setConfirmPin('')
            setNewPin('')
            setPinStep('new')
          }, 1000)
        } else {
          savePinChange(next)
        }
      }
    }
  }

  const handlePinDelete = () => {
    setPinError('')
    if (pinStep === 'current') setCurrentPin(currentPin.slice(0, -1))
    else if (pinStep === 'new') setNewPin(newPin.slice(0, -1))
    else setConfirmPin(confirmPin.slice(0, -1))
  }

  const savePinChange = async (pin: string) => {
    await supabase
      .from('milkmen')
      .update({ pin })
      .eq('id', milkmanId)

    setPinSuccess(true)
    setTimeout(() => router.push('/'), 2000)
  }

  // PIN change success
  if (pinSuccess) {
    return (
      <Phone bg="#E8E0D0">
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          textAlign: 'center',
        }} className="screen-fade">
          <div style={{
            width: 110,
            height: 110,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #DCFCE7, #BBF7D0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 28,
            boxShadow: '0 8px 24px rgba(22, 163, 74, 0.2)',
          }}>
            <Check size={56} color="#16A34A" />
          </div>
          <h2 style={{
            fontSize: 30,
            fontWeight: 800,
            color: '#166534',
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}>
            PIN Changed
          </h2>
          <p style={{ fontSize: 18, color: '#57534E', fontWeight: 600 }}>
            Your new PIN is set, {milkmanName}.
          </p>
        </div>
      </Phone>
    )
  }

  // PIN change flow
  if (showPinChange) {
    const titles: Record<PinStep, string> = {
      current: 'Enter current PIN',
      new: 'Enter new PIN',
      confirm: 'Confirm new PIN',
    }
    const activeDots = pinStep === 'current' ? currentPin.length
      : pinStep === 'new' ? newPin.length
      : confirmPin.length

    return (
      <Phone bg="#E8E0D0">
        <div style={{
          minHeight: '100vh',
          padding: '60px 24px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }} className="screen-fade">
          <h2 style={{
            fontSize: 24,
            fontWeight: 800,
            color: '#1E3A5F',
            letterSpacing: '-0.02em',
            marginBottom: 32,
            textAlign: 'center',
          }}>
            {titles[pinStep]}
          </h2>

          <div style={{ marginBottom: 40 }}>
            <PinDots length={4} filled={activeDots} />
          </div>

          {pinError && (
            <div style={{
              background: '#FEE2E2',
              border: '2px solid #FCA5A5',
              borderRadius: 10,
              padding: 12,
              marginBottom: 24,
              textAlign: 'center',
              width: '100%',
            }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#DC2626', margin: 0 }}>
                {pinError}
              </p>
            </div>
          )}

          <NumPad onPress={handlePinPress} onDelete={handlePinDelete} />

          {pinStep === 'new' && newPin.length === 4 && (
            <div style={{ marginTop: 32, width: '100%' }}>
              <Btn onClick={() => setPinStep('confirm')} color="#2563EB">
                Next
              </Btn>
            </div>
          )}

          <button
            onClick={() => {
              setShowPinChange(false)
              setCurrentPin('')
              setNewPin('')
              setConfirmPin('')
              setPinStep('current')
              setPinError('')
            }}
            style={{
              marginTop: 24,
              background: 'none',
              border: 'none',
              color: '#78716C',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </Phone>
    )
  }

  // Main "Drive Safe" screen
  return (
    <Phone bg="#E8E0D0">
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        textAlign: 'center',
      }} className="screen-fade">
        <div style={{
          width: 110,
          height: 110,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #DCFCE7, #BBF7D0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 28,
          boxShadow: '0 8px 24px rgba(22, 163, 74, 0.2)',
        }}>
          <Check size={56} color="#16A34A" />
        </div>

        <h2 style={{
          fontSize: 30,
          fontWeight: 800,
          color: '#166534',
          letterSpacing: '-0.02em',
          marginBottom: 8,
        }}>
          Clipboard Saved
        </h2>

        <p style={{ fontSize: 20, color: '#57534E', fontWeight: 600, lineHeight: 1.5 }}>
          Drive safe, {milkmanName}!
        </p>

        <p style={{ fontSize: 16, color: '#78716C', marginTop: 8, fontWeight: 500 }}>
          When you&apos;re back, log in again to fill in what you brought back.
        </p>

        <div style={{ marginTop: 36, width: '100%' }}>
          <Btn onClick={() => router.push('/')} color="#2563EB">
            <LogOut size={20} /> Done
          </Btn>
        </div>

        <button
          onClick={() => setShowPinChange(true)}
          style={{
            marginTop: 24,
            background: 'none',
            border: 'none',
            color: '#94A3B8',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Change your PIN
        </button>
      </div>
    </Phone>
  )
}
