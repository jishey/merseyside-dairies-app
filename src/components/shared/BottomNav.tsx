'use client'

import { Home, ClipboardList, Calculator, Clock, Settings as SettingsIcon } from 'lucide-react'

export interface BottomNavProps {
  active: string
  onNav: (id: string) => void
}

export default function BottomNav({ active, onNav }: BottomNavProps) {
  const items = [
    { icon: Home, label: 'Home', id: 'dashboard' },
    { icon: ClipboardList, label: 'Clipboards', id: 'clipboards' },
    { icon: Calculator, label: 'Order', id: 'order' },
    { icon: Clock, label: 'History', id: 'history' },
    { icon: SettingsIcon, label: 'Settings', id: 'settings' },
  ]

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        background: '#fff',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        zIndex: 50,
        boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
      }}
    >
      {items.map(({ icon: Icon, label, id }) => (
        <button
          key={id}
          onClick={() => onNav(id)}
          style={{
            flex: 1,
            padding: '10px 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            border: 'none',
            background: active === id ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
            cursor: 'pointer',
            color: active === id ? '#2563EB' : '#94A3B8',
            transition: 'all 0.2s',
            borderRadius: active === id ? '12px 12px 0 0' : '0',
          }}
        >
          <Icon size={24} strokeWidth={active === id ? 2.5 : 2} />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.05em' }}>
            {label}
          </span>
        </button>
      ))}
    </div>
  )
}
