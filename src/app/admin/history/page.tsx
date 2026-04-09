'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Phone from '@/components/shared/Phone'
import BottomNav from '@/components/shared/BottomNav'
import { useAdmin } from '@/lib/auth/admin-context'
import { createClient } from '@/lib/supabase/client'
import { dateStr, formatDate } from '@/lib/helpers/date'
import { calculateSold } from '@/lib/helpers/clipboard'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface ProductInfo {
  id: string
  name: string
  size: string
  color: string
}

interface EntryInfo {
  product_id: string
  out: number
  back: number
  waste: number
}

export default function HistoryPage() {
  const router = useRouter()
  const { isAdmin, loading: authLoading } = useAdmin()
  const supabase = createClient()

  const [mode, setMode] = useState<'daily' | 'weekly'>('daily')
  const [products, setProducts] = useState<ProductInfo[]>([])

  // Daily state
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return d
  })
  const [dailyEntries, setDailyEntries] = useState<EntryInfo[]>([])

  // Weekly state
  const [weekData, setWeekData] = useState<Array<{ day: string; sold: number }>>([])

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/admin')
  }, [isAdmin, authLoading, router])

  useEffect(() => {
    if (isAdmin) loadProducts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  useEffect(() => {
    if (isAdmin && mode === 'daily') loadDailyData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, selectedDate, mode])

  useEffect(() => {
    if (isAdmin && mode === 'weekly') loadWeeklyData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, mode])

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name, size, color')
      .eq('active', true)
      .order('sort_order')

    if (data) setProducts(data)
  }

  const loadDailyData = async () => {
    const ds = dateStr(selectedDate)
    const { data } = await supabase
      .from('clipboard_entries')
      .select('product_id, out, back, waste')
      .eq('date', ds)

    setDailyEntries(data || [])
  }

  const loadWeeklyData = async () => {
    const days: Array<{ date: Date; label: string }> = []
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push({ date: d, label: dayLabels[d.getDay()] })
    }

    const startDate = dateStr(days[0].date)
    const endDate = dateStr(days[days.length - 1].date)

    const { data } = await supabase
      .from('clipboard_entries')
      .select('date, out, back, waste')
      .gte('date', startDate)
      .lte('date', endDate)

    const soldByDate: Record<string, number> = {}
    if (data) {
      for (const e of data) {
        const sold = calculateSold(e.out, e.back, e.waste)
        soldByDate[e.date] = (soldByDate[e.date] || 0) + sold
      }
    }

    setWeekData(
      days.map((d) => ({
        day: d.label,
        sold: soldByDate[dateStr(d.date)] || 0,
      }))
    )
  }

  // Daily totals
  const dailyTotals = useMemo(() => {
    let totalOut = 0
    let totalBack = 0
    let totalSold = 0

    const perProduct: Record<string, { out: number; back: number; waste: number; sold: number }> = {}
    for (const p of products) {
      perProduct[p.id] = { out: 0, back: 0, waste: 0, sold: 0 }
    }

    for (const e of dailyEntries) {
      const sold = calculateSold(e.out, e.back, e.waste)
      totalOut += e.out
      totalBack += e.back
      totalSold += sold

      if (perProduct[e.product_id]) {
        perProduct[e.product_id].out += e.out
        perProduct[e.product_id].back += e.back
        perProduct[e.product_id].waste += e.waste
        perProduct[e.product_id].sold += sold
      }
    }

    return { totalOut, totalBack, totalSold, perProduct }
  }, [dailyEntries, products])

  const shiftDate = (direction: number) => {
    setSelectedDate((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + direction)
      return d
    })
  }

  const handleNav = (id: string) => {
    router.push(`/admin/${id}`)
  }

  if (authLoading || !isAdmin) return null

  return (
    <Phone bg="#F8FAFC">
      <div style={{ padding: '24px 20px 100px' }} className="screen-fade">
        <h1 style={{
          fontSize: 32,
          fontWeight: 800,
          color: '#1E3A5F',
          margin: '0 0 20px',
          letterSpacing: '-0.02em',
        }}>
          History
        </h1>

        {/* Daily/Weekly toggle */}
        <div style={{
          background: '#F8FAFC',
          borderRadius: 14,
          padding: 3,
          display: 'flex',
          marginBottom: 24,
          border: '2px solid #E2E8F0',
        }}>
          {(['daily', 'weekly'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 12,
                border: 'none',
                background: mode === m ? '#fff' : 'transparent',
                boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                color: mode === m ? '#1E3A5F' : '#64748B',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {m === 'daily' ? 'Daily' : 'Weekly'}
            </button>
          ))}
        </div>

        {mode === 'daily' ? (
          <>
            {/* Date navigation */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}>
              <button
                onClick={() => shiftDate(-1)}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  border: '2px solid #E2E8F0',
                  background: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronLeft size={24} color="#64748B" />
              </button>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#1E3A5F' }}>
                {formatDate(selectedDate)}
              </span>
              <button
                onClick={() => shiftDate(1)}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  border: '2px solid #E2E8F0',
                  background: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronRight size={24} color="#64748B" />
              </button>
            </div>

            {/* 3-card summary */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 12,
              marginBottom: 24,
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
                border: '2px solid #93C5FD',
                borderRadius: 12,
                padding: 16,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#1E40AF' }}>
                  {dailyTotals.totalOut}
                </div>
                <div style={{
                  fontSize: 13,
                  color: '#64748B',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginTop: 6,
                }}>
                  Taken Out
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
                border: '2px solid #FCD34D',
                borderRadius: 12,
                padding: 16,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#92400E' }}>
                  {dailyTotals.totalBack}
                </div>
                <div style={{
                  fontSize: 13,
                  color: '#64748B',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginTop: 6,
                }}>
                  Returned
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
                border: '2px solid #86EFAC',
                borderRadius: 12,
                padding: 16,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#166534' }}>
                  {dailyTotals.totalSold}
                </div>
                <div style={{
                  fontSize: 13,
                  color: '#64748B',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginTop: 6,
                }}>
                  Sold
                </div>
              </div>
            </div>

            {/* Per-product breakdown */}
            <div>
              {products.map((product, idx) => {
                const stats = dailyTotals.perProduct[product.id]
                const sold = stats?.sold || 0

                return (
                  <div
                    key={product.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 0',
                      borderBottom: idx < products.length - 1 ? '1px solid #E2E8F0' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: product.color,
                      }} />
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#1E293B' }}>
                        {product.name} {product.size}
                      </span>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#16A34A' }}>
                      {sold} sold
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <>
            {/* Weekly view */}
            <h2 style={{
              fontSize: 18,
              fontWeight: 800,
              color: '#1E293B',
              letterSpacing: '-0.02em',
              marginBottom: 16,
              marginTop: 0,
            }}>
              Total Sold — Last 7 Days
            </h2>

            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weekData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#2563EB" />
                    <stop offset="1" stopColor="#1D4ED8" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 14, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 14, fontWeight: 700 }} />
                <Tooltip />
                <Bar dataKey="sold" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      <BottomNav active="history" onNav={handleNav} />
    </Phone>
  )
}
