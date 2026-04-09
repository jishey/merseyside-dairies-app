'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Phone from '@/components/shared/Phone'
import StatusBadge from '@/components/shared/StatusBadge'
import BottomNav from '@/components/shared/BottomNav'
import { useAdmin } from '@/lib/auth/admin-context'
import { createClient } from '@/lib/supabase/client'
import { dateStr } from '@/lib/helpers/date'
import { milkmanStatus } from '@/lib/helpers/clipboard'
import { calculateSold } from '@/lib/helpers/clipboard'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface MilkmanInfo {
  id: string
  name: string
}

interface ProductInfo {
  id: string
  name: string
  size: string
  color: string
}

interface EntryInfo {
  milkman_id: string
  product_id: string
  out: number
  back: number
  waste: number
  morning_out: number | null
}

interface StatusInfo {
  milkman_id: string
  headed_out: boolean
  submitted: boolean
}

export default function ClipboardsPage() {
  const router = useRouter()
  const { isAdmin, loading: authLoading } = useAdmin()
  const supabase = createClient()
  const today = dateStr(new Date())

  const [milkmen, setMilkmen] = useState<MilkmanInfo[]>([])
  const [products, setProducts] = useState<ProductInfo[]>([])
  const [entries, setEntries] = useState<EntryInfo[]>([])
  const [statuses, setStatuses] = useState<StatusInfo[]>([])
  const [absentIds, setAbsentIds] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/admin')
  }, [isAdmin, authLoading, router])

  useEffect(() => {
    if (isAdmin) loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  const loadData = async () => {
    const { data: milkmenData } = await supabase
      .from('milkmen')
      .select('id, name')
      .eq('active', true)
      .order('sort_order')

    if (milkmenData) setMilkmen(milkmenData)

    const { data: productsData } = await supabase
      .from('products')
      .select('id, name, size, color')
      .eq('active', true)
      .order('sort_order')

    if (productsData) setProducts(productsData)

    const { data: entriesData } = await supabase
      .from('clipboard_entries')
      .select('milkman_id, product_id, out, back, waste, morning_out')
      .eq('date', today)

    if (entriesData) setEntries(entriesData)

    const { data: statusData } = await supabase
      .from('clipboard_status')
      .select('milkman_id, headed_out, submitted')
      .eq('date', today)

    if (statusData) setStatuses(statusData)

    const { data: absenceData } = await supabase
      .from('absences')
      .select('milkman_id')
      .eq('date', today)

    if (absenceData) {
      setAbsentIds(new Set(absenceData.map((a) => a.milkman_id)))
    }

    setLoading(false)
  }

  const workingMilkmen = useMemo(
    () => milkmen.filter((m) => !absentIds.has(m.id)),
    [milkmen, absentIds]
  )

  // Daily totals
  const dailyTotals = useMemo(() => {
    const totals: Record<string, { out: number; back: number; waste: number; sold: number }> = {}
    for (const p of products) {
      totals[p.id] = { out: 0, back: 0, waste: 0, sold: 0 }
    }

    for (const entry of entries) {
      if (absentIds.has(entry.milkman_id)) continue
      if (!totals[entry.product_id]) continue
      totals[entry.product_id].out += entry.out
      totals[entry.product_id].back += entry.back
      totals[entry.product_id].waste += entry.waste
      totals[entry.product_id].sold += calculateSold(entry.out, entry.back, entry.waste)
    }

    return totals
  }, [products, entries, absentIds])

  const handleNav = (id: string) => {
    router.push(`/admin/${id}`)
  }

  if (authLoading || loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', fontSize: 18, color: '#64748B', fontWeight: 600,
      }}>
        Loading...
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <Phone bg="#F8FAFC">
      <div style={{ padding: '24px 20px 100px' }} className="screen-fade">
        <h1 style={{
          fontSize: 32,
          fontWeight: 800,
          color: '#1E3A5F',
          margin: '0 0 24px',
          letterSpacing: '-0.02em',
        }}>
          Today&apos;s Clipboards
        </h1>

        {/* Accordion list */}
        {workingMilkmen.map((m) => {
          const status = statuses.find((s) => s.milkman_id === m.id)
          const milkmanEntries = entries.filter((e) => e.milkman_id === m.id)
          const hasData = milkmanEntries.some((e) => e.out > 0)
          const isExpanded = expanded === m.id

          const displayStatus = milkmanStatus(
            status?.submitted || false,
            false, // anomaly detection would need history data
            hasData
          )

          return (
            <div
              key={m.id}
              style={{
                background: '#fff',
                borderRadius: 12,
                overflow: 'hidden',
                border: '2px solid #E2E8F0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                marginBottom: 12,
              }}
            >
              {/* Header */}
              <button
                onClick={() => setExpanded(isExpanded ? null : m.id)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#1E3A5F' }}>
                    {m.name}
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={20} color="#94A3B8" />
                  ) : (
                    <ChevronDown size={20} color="#94A3B8" />
                  )}
                </div>
                <StatusBadge status={displayStatus} />
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div style={{ background: '#F8FAFC', padding: '0 20px 16px' }}>
                  {products.map((product, idx) => {
                    const entry = milkmanEntries.find((e) => e.product_id === product.id)
                    const out = entry?.out || 0
                    const back = entry?.back || 0
                    const waste = entry?.waste || 0
                    const sold = calculateSold(out, back, waste)
                    const morningValue = entry?.morning_out
                    const isEdited = morningValue !== null && morningValue !== undefined && out !== morningValue

                    return (
                      <div
                        key={product.id}
                        style={{
                          padding: '12px 0',
                          borderBottom: idx < products.length - 1 ? '1px solid #E2E8F0' : 'none',
                          background: isEdited ? 'rgba(254, 226, 226, 0.3)' : 'transparent',
                          borderLeft: isEdited ? '3px solid #DC2626' : '3px solid transparent',
                          paddingLeft: 12,
                          marginLeft: -12,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <div style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: product.color,
                          }} />
                          <span style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>
                            {product.name} {product.size}
                          </span>
                          {isEdited && (
                            <span style={{
                              fontSize: 11,
                              fontWeight: 800,
                              color: '#fff',
                              background: '#DC2626',
                              padding: '2px 8px',
                              borderRadius: 4,
                              marginLeft: 4,
                            }}>
                              EDITED
                            </span>
                          )}
                        </div>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 12,
                          fontSize: 15,
                          fontWeight: 700,
                        }}>
                          <span style={{ color: '#57534E' }}>Out: <strong>{out}</strong></span>
                          <span style={{ color: '#57534E' }}>Back: <strong>{back}</strong></span>
                          {waste > 0 && (
                            <span style={{ color: '#F59E0B', fontSize: 13 }}>Leakers: <strong>{waste}</strong></span>
                          )}
                          <span style={{ color: '#16A34A' }}>Sold: <strong>{sold}</strong></span>
                        </div>
                        {isEdited && morningValue !== null && (
                          <p style={{
                            fontSize: 13,
                            color: '#DC2626',
                            fontStyle: 'italic',
                            fontWeight: 600,
                            margin: '4px 0 0',
                          }}>
                            Morning value was {morningValue}, changed to {out} after round
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* Daily Totals */}
        <div style={{
          background: '#1E3A5F',
          borderRadius: 14,
          padding: 18,
          marginTop: 24,
          boxShadow: '0 6px 16px rgba(30, 58, 95, 0.15)',
        }}>
          <h2 style={{
            fontSize: 16,
            fontWeight: 800,
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: '0 0 14px',
          }}>
            Daily Totals
          </h2>

          {products.map((product, idx) => {
            const t = dailyTotals[product.id] || { out: 0, back: 0, waste: 0, sold: 0 }
            return (
              <div
                key={product.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: idx < products.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: product.color,
                  }} />
                  <span style={{ fontSize: 14, color: '#CBD5E1', fontWeight: 600 }}>
                    {product.name} {product.size}
                  </span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                  Out: {t.out} | Back: {t.back} | Waste: {t.waste} | Sold: {t.sold}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <BottomNav active="clipboards" onNav={handleNav} />
    </Phone>
  )
}
