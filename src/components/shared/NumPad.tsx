'use client'

import { X } from 'lucide-react'

export interface NumPadProps {
  onPress: (key: number) => void
  onDelete: () => void
}

export default function NumPad({ onPress, onDelete }: NumPadProps) {
  const keys: (number | '' | 'del')[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del']

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
