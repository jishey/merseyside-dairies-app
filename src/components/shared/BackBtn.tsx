'use client'

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
