'use client'

import React from 'react'

export interface StepperProps {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  disabled?: boolean
}

export default function Stepper({
  value,
  onChange,
  min = 0,
  max = 999999,
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
        -
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
          width: 92,
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
