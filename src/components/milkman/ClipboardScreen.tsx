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
            overflow: 'visible',
            backgroundImage:
              'radial-gradient(ellipse at 20% 50%, rgba(255,248,230,0.6) 0%, transparent 50%),' +
              'radial-gradient(ellipse at 80% 20%, rgba(255,245,220,0.4) 0%, transparent 50%)',
          }}
          className="screen-fade"
        >
          {/* Folded corner — FLIP */}
          <button
            onClick={onFlip}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 48,
              height: 48,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              zIndex: 20,
            }}
          >
            <svg width="48" height="48" viewBox="0 0 48 48">
              <path d="M48 0 L48 48 L0 0 Z" fill="#E8DCC8" />
              <path d="M48 0 L48 48 L0 0 Z" fill="url(#fold)" opacity="0.3" />
              <path d="M12 0 L48 0 L48 36 Z" fill="none" stroke="#D4C8A8" strokeWidth="1" />
              <defs>
                <linearGradient id="fold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#000" stopOpacity="0.1" />
                  <stop offset="1" stopColor="#000" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>
            <span style={{
              position: 'absolute',
              top: 6,
              right: 4,
              fontSize: 10,
              color: '#92400E',
              fontWeight: 800,
              transform: 'rotate(45deg)',
            }}>
              FLIP
            </span>
          </button>

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
            gap: 10,
            marginBottom: 22,
            background: '#FBF9F4',
            borderRadius: 14,
            padding: 3,
          }}>
            <button
              onClick={() => onModeChange(false)}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: 11,
                fontWeight: 800,
                fontSize: 16,
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '-0.01em',
                background: !afternoonMode ? '#fff' : 'transparent',
                color: !afternoonMode ? '#1E3A5F' : '#78716C',
                transition: 'all 0.2s',
                boxShadow: !afternoonMode ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              Morning Load
            </button>
            <button
              onClick={() => hasData && onModeChange(true)}
              disabled={!hasData}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: 11,
                fontWeight: 800,
                fontSize: 16,
                border: 'none',
                cursor: hasData ? 'pointer' : 'not-allowed',
                background: afternoonMode ? '#fff' : 'transparent',
                color: !hasData ? '#D1D5DB' : (afternoonMode ? '#1E3A5F' : '#78716C'),
                transition: 'all 0.2s',
                boxShadow: afternoonMode ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                opacity: hasData ? 1 : 0.5,
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
                  {isEdited && (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#fff',
                      background: '#DC2626',
                      padding: '2px 8px',
                      borderRadius: 4,
                      marginLeft: 'auto',
                    }}>
                      EDITED
                    </span>
                  )}
                </div>

                {/* MORNING MODE: Taking Out stepper + anomaly warning */}
                {!afternoonMode && (
                  <>
                    <div>
                      <label style={{ fontSize: 14, fontWeight: 800, color: '#57534E', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 12 }}>
                        Taking Out
                      </label>
                      <Stepper
                        value={productData.out}
                        onChange={(v) => onDataChange(product.id, 'out', v)}
                      />
                    </div>

                    {isAnom && anomaly && (
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
                  </>
                )}

                {/* AFTERNOON MODE: Brought Back + Leakers only (no Taking Out) */}
                {afternoonMode && productData.out === 0 && (
                  <p style={{
                    fontSize: 14,
                    color: '#9CA3AF',
                    fontStyle: 'italic',
                    fontWeight: 500,
                    margin: 0,
                  }}>
                    Nothing taken out -- nothing to bring back
                  </p>
                )}

                {afternoonMode && productData.out > 0 && (
                  <>
                    {isEdited && morningValue !== undefined && (
                      <p style={{
                        fontSize: 13,
                        color: '#DC2626',
                        fontStyle: 'italic',
                        fontWeight: 600,
                        margin: '0 0 12px',
                      }}>
                        Was {morningValue} this morning
                      </p>
                    )}

                    {/* BROUGHT BACK */}
                    <label style={{ fontSize: 14, fontWeight: 800, color: '#57534E', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 12 }}>
                      Brought Back
                    </label>
                    <Stepper
                      value={productData.back}
                      onChange={(v) => onDataChange(product.id, 'back', v)}
                      max={productData.out}
                    />

                    {/* LEAKERS */}
                    {productData.out - productData.back > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 12 }}>
                          Leakers
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
                End of Day -- Submit
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
