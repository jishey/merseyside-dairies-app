'use client'

import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'
import Btn from '@/components/shared/Btn'

export default function OfflineDetector({ children }: { children: React.ReactNode }) {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    setOnline(navigator.onLine)

    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!online) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          textAlign: 'center',
        }}
        className="screen-fade"
      >
        <div style={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(100,116,139,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}>
          <WifiOff size={80} color="#64748B" />
        </div>

        <h1 style={{
          fontSize: 28,
          fontWeight: 800,
          color: '#1E293B',
          letterSpacing: '-0.02em',
          margin: '0 0 12px',
        }}>
          Looks like you&apos;re not connected
        </h1>

        <p style={{
          fontSize: 18,
          color: '#64748B',
          lineHeight: 1.6,
          margin: '0 0 32px',
        }}>
          Pop back on the depot WiFi and try again.
        </p>

        <Btn onClick={() => window.location.reload()} color="#2563EB">
          Try Again
        </Btn>
      </div>
    )
  }

  return <>{children}</>
}
