'use client'

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
