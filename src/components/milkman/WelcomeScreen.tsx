'use client'

import { User, AlertTriangle } from 'lucide-react'
import Phone from '@/components/shared/Phone'
import Page from '@/components/shared/Page'
import { formatDate, greeting } from '@/lib/helpers/date'

export interface WelcomeScreenProps {
  milkmen: Array<{ id: string; name: string; sort_order: number }>
  absences: Record<string, { coveringId?: string; coveringName?: string }>
  dayClosed: boolean
  onSelectMilkman: (id: string) => void
  onAdminLogin: () => void
}

export default function WelcomeScreen({
  milkmen,
  absences,
  dayClosed,
  onSelectMilkman,
  onAdminLogin,
}: WelcomeScreenProps) {
  return (
    <Phone bg="#fff">
      <Page>
        {/* Gradient header */}
        <div style={{
          background: 'linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)',
          borderRadius: 20,
          padding: '32px 24px',
          textAlign: 'center',
          marginBottom: 32,
          boxShadow: '0 8px 24px rgba(30, 58, 95, 0.15)',
        }}>
          <img
            src="https://merseysidedairies.co.uk/wp-content/uploads/2016/04/Merseyside_Dairies_Logo_PNG.png"
            alt="Merseyside Dairies"
            style={{ height: 80, margin: '0 auto 16px', display: 'block' }}
          />
          <h1 style={{
            fontSize: 32,
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.02em',
            margin: 0,
          }}>
            {greeting()}!
          </h1>
          <p style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.9)',
            margin: '8px 0 0',
          }}>
            {formatDate(new Date())}
          </p>
          <p style={{
            fontSize: 18,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.95)',
            margin: '16px 0 0',
          }}>
            Tap your name to get started
          </p>
        </div>

        {/* Day closed warning */}
        {dayClosed && (
          <div style={{
            background: '#FEE2E2',
            border: '2px solid #FCA5A5',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            display: 'flex',
            gap: 12,
            alignItems: 'center',
          }}>
            <AlertTriangle size={24} color="#DC2626" style={{ flexShrink: 0 }} />
            <span style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#DC2626',
            }}>
              Today&apos;s round is closed
            </span>
          </div>
        )}

        {/* Milkman list */}
        <div style={{ marginBottom: 32 }}>
          {milkmen.map((m) => {
            const isAbsent = absences[m.id]
            const accentColor = m.sort_order % 2 === 1 ? '#2563EB' : '#16A34A'
            return (
              <button
                key={m.id}
                onClick={() => !dayClosed && !isAbsent && onSelectMilkman(m.id)}
                disabled={dayClosed || !!isAbsent}
                style={{
                  width: '100%',
                  background: isAbsent ? '#F1F5F9' : '#fff',
                  border: `2px solid ${isAbsent ? '#94A3B8' : '#E2E8F0'}`,
                  borderLeft: isAbsent ? '4px solid #94A3B8' : `4px solid ${accentColor}`,
                  borderRadius: 14,
                  padding: '16px 20px',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  cursor: dayClosed || isAbsent ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: dayClosed || isAbsent ? 0.6 : 1,
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 18,
                }}>
                  <User size={20} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: isAbsent ? '#94A3B8' : '#1E293B',
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}>
                    {m.name}
                  </p>
                  {isAbsent && (
                    <p style={{
                      fontSize: 14,
                      color: '#64748B',
                      margin: '4px 0 0',
                    }}>
                      Off today -- covered by {absences[m.id].coveringName || 'John'}
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Admin login */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            onClick={onAdminLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563EB',
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer',
              textDecoration: 'underline',
              transition: 'all 0.2s',
            }}
          >
            Admin Login
          </button>
        </div>
      </Page>
    </Phone>
  )
}
