'use client'

import { useState, useEffect, useCallback } from 'react'
import Phone from '@/components/shared/Phone'
import Page from '@/components/shared/Page'
import BackBtn from '@/components/shared/BackBtn'
import NumPad from '@/components/shared/NumPad'
import PinDots from '@/components/shared/PinDots'

export interface PinEntryProps {
  milkman: { id: string; name: string; pin: string }
  onBack: () => void
  onCorrect: () => void
}

export default function PinEntry({ milkman, onBack, onCorrect }: PinEntryProps) {
  const [pinEntry, setPinEntry] = useState('')
  const [pinError, setPinError] = useState(false)
  const [shaking, setShaking] = useState(false)

  const handleCorrect = useCallback(() => {
    onCorrect()
  }, [onCorrect])

  useEffect(() => {
    if (pinEntry.length === 4) {
      if (pinEntry === milkman.pin) {
        handleCorrect()
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
  }, [pinEntry, milkman.pin, handleCorrect])

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
            That&apos;s not right, try again
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
