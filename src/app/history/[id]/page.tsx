'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Phone from '@/components/shared/Phone'
import Btn from '@/components/shared/Btn'
import { createClient } from '@/lib/supabase/client'
import { dateStr, formatDate } from '@/lib/helpers/date'
import { calculateSold } from '@/lib/helpers/clipboard'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface EntryData {
  product_id: string
  out: number
  back: number
  waste: number
}

interface ProductInfo {
  id: string
  name: string
  size: string
  color: string
}

export default function HistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: milkmanId } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [offset, setOffset] = useState(1)
  const [products, setProducts] = useState<ProductInfo[]>([])
  const [entries, setEntries] = useState<EntryData[]>([])
  const [loading, setLoading] = useState(true)

  const getDateForOffset = useCallback((o: number) => {
    const d = new Date()
    d.setDate(d.getDate() - o)
    return d
  }, [])

  const selectedDate = getDateForOffset(offset)
  const selectedDateStr = dateStr(selectedDate)

  useEffect(() => {
    loadProducts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadEntries()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset])

  const loadProducts = async () => {
    const { data: productsData } = await supabase
      .from('products')
      .select('id, name, size, color')
      .eq('active', true)
      .order('sort_order')

    if (productsData) setProducts(productsData)
  }

  const loadEntries = async () => {
    setLoading(true)
    const { data: entriesData } = await supabase
      .from('clipboard_entries')
      .select('product_id, out, back, waste')
      .eq('milkman_id', milkmanId)
      .eq('date', selectedDateStr)

    setEntries(entriesData || [])
    setLoading(false)
  }

  const hasEntries = entries.length > 0

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
          {/* Date navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 28,
          }}>
            <button
              onClick={() => setOffset(offset + 1)}
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                border: '2px solid #E2E8F0',
                background: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={24} color="#1E293B" />
            </button>

            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#1E3A5F',
                margin: 0,
                letterSpacing: '-0.02em',
              }}>
                {formatDate(selectedDate)}
              </p>
              <p style={{
                fontSize: 13,
                color: '#78716C',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: '4px 0 0',
              }}>
                Read only
              </p>
            </div>

            <button
              onClick={() => offset > 1 && setOffset(offset - 1)}
              disabled={offset <= 1}
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                border: '2px solid #E2E8F0',
                background: offset <= 1 ? '#F3F4F6' : '#fff',
                boxShadow: offset <= 1 ? 'none' : '0 2px 4px rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: offset <= 1 ? 'default' : 'pointer',
              }}
            >
              <ChevronRight size={24} color={offset <= 1 ? '#D1D5DB' : '#1E293B'} />
            </button>
          </div>

          {/* Product cards or no data message */}
          {loading ? (
            <p style={{
              textAlign: 'center',
              fontSize: 18,
              color: '#9CA3AF',
              padding: 40,
              fontWeight: 500,
            }}>
              Loading...
            </p>
          ) : !hasEntries ? (
            <p style={{
              textAlign: 'center',
              fontSize: 18,
              color: '#9CA3AF',
              padding: 40,
              fontWeight: 500,
            }}>
              No data for this day (Sunday or no record)
            </p>
          ) : (
            products.map((product) => {
              const entry = entries.find((e) => e.product_id === product.id)
              if (!entry) return null

              const sold = calculateSold(entry.out, entry.back, entry.waste)

              return (
                <div
                  key={product.id}
                  style={{
                    background: '#FFFBF0',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                    border: '1px solid #E8DCC8',
                    borderLeft: `4px solid ${product.color}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: product.color,
                    }} />
                    <span style={{ fontSize: 17, fontWeight: 800, color: '#1E3A5F' }}>
                      {product.name}
                    </span>
                    <span style={{ fontSize: 14, color: '#78716C', fontWeight: 600 }}>
                      ({product.size})
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 18,
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#57534E',
                  }}>
                    <span>Out: <strong>{entry.out}</strong></span>
                    <span>Back: <strong>{entry.back}</strong></span>
                    {entry.waste > 0 && (
                      <span style={{ color: '#F59E0B' }}>Damaged: <strong>{entry.waste}</strong></span>
                    )}
                    <span style={{ color: '#16A34A' }}>Sold: <strong>{sold}</strong></span>
                  </div>
                </div>
              )
            })
          )}

          {/* Back to Today button */}
          <div style={{ marginTop: 32 }}>
            <Btn onClick={() => router.push(`/clipboard/${milkmanId}`)} color="#2563EB">
              <ChevronLeft size={20} /> Back to Today
            </Btn>
          </div>
        </div>
      </div>
    </Phone>
  )
}
