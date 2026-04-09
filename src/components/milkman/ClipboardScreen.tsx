'use client'

import { useState } from 'react'
import Phone from '@/components/shared/Phone'
import Btn from '@/components/shared/Btn'
import Stepper from '@/components/shared/Stepper'
import { formatDate } from '@/lib/helpers/date'
import { LogOut, AlertTriangle } from 'lucide-react'

export interface AnomalyInfo {
  avg: number
  weeks: number
  isAnomaly: boolean
  dayName: string
}

export interface ClipboardScreenProps {
  milkman: { id: string; name: string }
  products: Array<{ id: string; name: string; size: string; color: string }>
  data: Record<string, { out: number; back: number; waste: number }>
  morningOut: Record<string, number>
  anomalies: Record<string, AnomalyInfo>
  afternoonMode: boolean
  onModeChange: (afternoon: boolean) => void
  onDataChange: (productId: string, field: string, value: number) => void
  onHeadOut: (unconfirmedAnomalyIds: string[]) => void
  onSubmit: () => void
  onLogout: () => void
  onFlip: () => void
}

export default function ClipboardScreen({
  milkman,
  products,
  data,
  morningOut,
  anomalies,
  afternoonMode,
  onModeChange,
  onDataChange,
  onHeadOut,
  onSubmit,
  onLogout,
  onFlip,
}: ClipboardScreenProps) {
  const today = new Date()
  const hasData = products.some((p) => (data[p.id]?.out || 0) > 0)
  const [confirmedAnomalies, setConfirmedAnomalies] = useState<Record<string, boolean>>({})

  const handleHeadOut = () => {
    const unconfirmed = products
      .filter((p) => {
        const a = anomalies[p.id]
        return a?.isAnomaly && !confirmedAnomalies[`${milkman.id}-${p.id}`]
      })
      .map((p) => p.id)

    onHeadOut(unconfirmed)
  }

  const confirmAnomaly = (productId: string) => {
    setConfirmedAnomalies((prev) => ({
      ...prev,
      [`${milkman.id}-${productId}`]: true,
    }))
  }

  return (
    <Phone bg="#E8E0D0">
      <div style={{ padding: '0 12px', paddingBottom: 120 }}>
        {/* Clipboard clip */}
        <div style={{
          width: 80,
          height: 32,
          background: 'linear-gradient(135deg, #78716C, #57534E, #78716C)',
          borderRadius: '0 0 12px 12px',
          border: '3px solid #57534E',
          margin: '8px auto 0',
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1), 0 4px 8px rgba(0,0,0,0.2)',
          position: 'relative',
          zIndex: 10,
        }} />

        {/* Clipboard paper */}
        <div
          style={{
            background: '#FDF6E3',
            borderRadius: '0 0 16px 16px',
            padding: '24px 18px 28px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            marginTop: -8,
            minHeight: '80vh',
            position: 'relative',
            backgroundImage:
              'radial-gradient(ellipse at 20% 50%, rgba(255,248,230,0.6) 0%, transparent 50%),' +
              'radial-gradient(ellipse at 80% 20%, rgba(255,245,220,0.4) 0%, transparent 50%)',
          }}
          className="screen-fade"
        >
          {/* Folded corner */}
          <div
            onClick={onFlip}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #F5E6D3, #E8DCC8)',
              clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 20,
            }}
          >
            <div
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: '#92400E',
                transform: 'rotate(45deg) translateX(8px)',
                whiteSpace: 'nowrap',
              }}
            >
              FLIP
            </div>
          </div>

          {/* Header */}
          <div style={{ marginBottom: 20, paddingRight: 48 }}>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: '#1E3A5F',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              {milkman.name}&apos;s Clipboard
            </h1>
            <p style={{ fontSize: 16, color: '#78716C', margin: '8px 0 0', fontWeight: 600 }}>
              {formatDate(today)}
            </p>
          </div>

          {/* Morning/Afternoon toggle */}
          <div style={{
            display: 'flex',
            gap: 0,
            marginBottom: 24,
            borderRadius: 12,
            overflow: 'hidden',
            border: '2px solid #E2E8F0',
          }}>
            <button
              onClick={() => onModeChange(false)}
              style={{
                flex: 1,
                padding: '12px 0',
                fontSize: 15,
                fontWeight: 800,
                border: 'none',
                background: !afternoonMode ? '#2563EB' : '#fff',
                color: !afternoonMode ? '#fff' : '#64748B',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Taking Out
            </button>
            <button
              onClick={() => hasData && onModeChange(true)}
              disabled={!hasData}
              style={{
                flex: 1,
                padding: '12px 0',
                fontSize: 15,
                fontWeight: 800,
                border: 'none',
                background: afternoonMode ? '#2563EB' : '#fff',
                color: afternoonMode ? '#fff' : (hasData ? '#64748B' : '#CBD5E1'),
                cursor: hasData ? 'pointer' : 'default',
                transition: 'all 0.2s',
              }}
            >
              Back from Round
            </button>
          </div>

          {/* Product cards */}
          {products.map((product) => {
            const productData = data[product.id] || { out: 0, back: 0, waste: 0 }
            const anomaly = anomalies[product.id]
            const isAnom = !afternoonMode && anomaly?.isAnomaly && !confirmedAnomalies[`${milkman.id}-${product.id}`]
            const morningValue = morningOut[product.id]
            const isEdited = afternoonMode && morningValue !== undefined && productData.out !== morningValue

            return (
              <div
                key={product.id}
                style={{
                  background: isAnom ? '#FEF3C7' : '#FFFBF0',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  border: isAnom ? '2px solid #F59E0B' : '1px solid #E8DCC8',
                  borderLeft: `4px solid ${product.color}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: product.color,
                    }}
                  />
                  <div>
                    <p style={{ fontSize: 18, fontWeight: 800, color: '#1E3A5F', margin: 0 }}>
                      {product.name}
                    </p>
                    <p style={{ fontSize: 14, color: '#78716C', margin: '2px 0 0' }}>
                      {product.size}
                    </p>
                  </div>
                </div>

                {/* TAKING OUT */}
                <div style={{ marginBottom: afternoonMode && productData.out > 0 ? 16 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                    <label style={{ fontSize: 14, fontWeight: 800, color: '#57534E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Taking Out
                    </label>
                    {isEdited && (
                      <span style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: '#fff',
                        background: '#DC2626',
                        padding: '2px 8px',
                        borderRadius: 4,
                        marginLeft: 8,
                      }}>
                        EDITED
                      </span>
                    )}
                  </div>

                  <Stepper
                    value={productData.out}
                    onChange={(v) => onDataChange(product.id, 'out', v)}
                  />

                  {isEdited && morningValue !== undefined && (
                    <p style={{
                      fontSize: 13,
                      color: '#DC2626',
                      fontStyle: 'italic',
                      fontWeight: 600,
                      margin: '6px 0 0',
                    }}>
                      Was {morningValue} this morning
                    </p>
                  )}
                </div>

                {/* Morning mode anomaly warning */}
                {!afternoonMode && isAnom && anomaly && (
                  <div style={{
                    background: '#FFF7ED',
                    borderRadius: 8,
                    border: '1px solid #FBBF24',
                    padding: '10px 12px',
                    marginTop: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                      <AlertTriangle size={14} color="#D97706" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#92400E' }}>
                        Avg ~{anomaly.avg} on {anomaly.dayName}s (last 4 weeks)
                      </span>
                    </div>
                    <button
                      onClick={() => confirmAnomaly(product.id)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: '2px solid #F59E0B',
                        background: '#FEF3C7',
                        fontWeight: 700,
                        fontSize: 13,
                        color: '#92400E',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      That&apos;s right
                    </button>
                  </div>
                )}

                {/* Afternoon fields */}
                {afternoonMode && productData.out === 0 && (
                  <p style={{
                    fontSize: 14,
                    color: '#9CA3AF',
                    fontStyle: 'italic',
                    fontWeight: 500,
                    marginTop: 10,
                  }}>
                    Nothing taken out — nothing to bring back
                  </p>
                )}

                {afternoonMode && productData.out > 0 && (
                  <>
                    {/* BROUGHT BACK */}
                    <label style={{ fontSize: 14, fontWeight: 800, color: '#57534E', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 12 }}>
                      Brought Back
                    </label>
                    <Stepper
                      value={productData.back}
                      onChange={(v) => onDataChange(product.id, 'back', v)}
                      max={productData.out}
                    />

                    {/* DAMAGED / LOST */}
                    {productData.out - productData.back > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 12 }}>
                          Damaged / Lost
                        </label>
                        <Stepper
                          value={productData.waste}
                          onChange={(v) => onDataChange(product.id, 'waste', v)}
                          max={productData.out - productData.back}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}

          {/* Action buttons */}
          <div style={{ marginTop: 32, marginBottom: 16 }}>
            {!afternoonMode ? (
              <Btn
                onClick={handleHeadOut}
                color="#16A34A"
                disabled={!hasData}
              >
                Confirm &amp; Head Out
              </Btn>
            ) : (
              <Btn
                onClick={onSubmit}
                color="#16A34A"
              >
                End of Day — Submit
              </Btn>
            )}
          </div>

          {/* Logout button */}
          <Btn onClick={onLogout} outline color="#78716C" style={{ marginBottom: 16 }}>
            <LogOut size={20} /> Log Out
          </Btn>
        </div>
      </div>
    </Phone>
  )
}
