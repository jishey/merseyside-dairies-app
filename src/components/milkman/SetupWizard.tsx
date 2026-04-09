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
              What&apos;s your name?
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
