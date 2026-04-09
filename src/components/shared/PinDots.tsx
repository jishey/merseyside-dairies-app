'use client'

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
