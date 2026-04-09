'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Phone from '@/components/shared/Phone'
import Page from '@/components/shared/Page'
import BackBtn from '@/components/shared/BackBtn'
import Btn from '@/components/shared/Btn'
import { createClient } from '@/lib/supabase/client'
import { dateStr, formatDate } from '@/lib/helpers/date'
import { calculateSold } from '@/lib/helpers/clipboard'
import { Check, LogOut } from 'lucide-react'

interface EntryData {
  product_id: string
  out: number
  back: number
  waste: number
  morning_out: number | null
}

interface ProductInfo {
  id: string
  name: string
  size: string
  color: string
}

export default function SummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: milkmanId } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const today = dateStr(new Date())

  const [milkmanName, setMilkmanName] = useState('')
  const [products, setProducts] = useState<ProductInfo[]>([])
  const [entries, setEntries] = useState<EntryData[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    const { data: milkmanData } = await supabase
      .from('milkmen')
      .select('name')
      .eq('id', milkmanId)
      .single()

    if (milkmanData) setMilkmanName(milkmanData.name)

    const { data: productsData } = await supabase
      .from('products')
      .select('id, name, size, color')
      .eq('active', true)
      .order('sort_order')

    if (productsData) setProducts(productsData)

    const { data: entriesData } = await supabase
      .from('clipboard_entries')
      .select('product_id, out, back, waste, morning_out')
      .eq('milkman_id', milkmanId)
      .eq('date', today)

    if (entriesData) setEntries(entriesData)
  }

  const handleSubmit = async () => {
    setSaving(true)

    // Update clipboard_status to submitted
    await supabase
      .from('clipboard_status')
      .upsert({
        milkman_id: milkmanId,
        date: today,
        headed_out: true,
        submitted: true,
        submitted_at: new Date().toISOString(),
      }, { onConflict: 'milkman_id,date' })

    setSubmitted(true)
    setSaving(false)
  }

  // Confirmation screen
  if (submitted) {
    return (
      <Phone bg="#fff">
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 24px',
          }}
          className="screen-fade"
        >
          <div style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: '#DCFCE7',
            boxShadow: '0 6px 16px rgba(22, 163, 74, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
          }}>
            <Check size={56} color="#16A34A" />
          </div>

          <h1 style={{
            fontSize: 32,
            fontWeight: 800,
            color: '#166534',
            textAlign: 'center',
            margin: '0 0 12px',
            letterSpacing: '-0.02em',
          }}>
            All done for today, {milkmanName}.
          </h1>

          <p style={{
            fontSize: 18,
            color: '#6B7280',
            fontWeight: 500,
            margin: '0 0 48px',
          }}>
            See you tomorrow!
          </p>

          <Btn onClick={() => router.push('/')} color="#2563EB">
            <LogOut size={20} /> Back to Start
          </Btn>
        </div>
      </Phone>
    )
  }

  if (products.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: 18,
        color: '#64748B',
        fontWeight: 600,
      }}>
        Loading...
      </div>
    )
  }

  return (
    <Phone bg="#fff">
      <Page cream>
        <BackBtn onClick={() => router.push(`/clipboard/${milkmanId}`)} />

        <h1 style={{
          fontSize: 32,
          fontWeight: 800,
          color: '#1E3A5F',
          margin: '0 0 8px',
          letterSpacing: '-0.02em',
        }}>
          Your Day, {milkmanName}
        </h1>
        <p style={{
          fontSize: 16,
          color: '#78716C',
          fontWeight: 600,
          margin: '0 0 28px',
        }}>
          {formatDate(new Date())}
        </p>

        {/* Product summary cards */}
        {products.map((product) => {
          const entry = entries.find((e) => e.product_id === product.id)
          if (!entry) return null

          const out = entry.out
          const back = entry.back
          const waste = entry.waste
          const morningValue = entry.morning_out
          const sold = calculateSold(out, back, waste)
          const isEdited = morningValue !== null && morningValue !== undefined && out !== morningValue

          let cardBg = '#FFFBF0'
          let cardBorder = '1px solid #E8DCC8'
          if (isEdited) {
            cardBg = '#FEE2E2'
            cardBorder = '2px solid #FCA5A5'
          }

          return (
            <div
              key={product.id}
              style={{
                background: cardBg,
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                border: cardBorder,
                borderLeft: `4px solid ${product.color}`,
              }}
            >
              {/* Product header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: product.color,
                }} />
                <span style={{ fontSize: 17, fontWeight: 800, color: '#1E3A5F' }}>
                  {product.name}
                </span>
                <span style={{ fontSize: 14, color: '#78716C', fontWeight: 600 }}>
                  {product.size}
                </span>
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

              {/* Values row */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 20,
                fontSize: 17,
                fontWeight: 700,
                color: '#1E3A5F',
              }}>
                <span>Out: <strong>{out}</strong></span>
                <span>Back: <strong>{back}</strong></span>
                {waste > 0 && (
                  <span style={{ color: '#D97706' }}>Damaged: <strong>{waste}</strong></span>
                )}
                <span style={{ color: sold >= 0 ? '#16A34A' : '#DC2626' }}>
                  Sold: <strong>{sold}</strong>
                </span>
              </div>

              {/* Edited note */}
              {isEdited && morningValue !== null && (
                <p style={{
                  fontSize: 13,
                  color: '#DC2626',
                  fontStyle: 'italic',
                  fontWeight: 600,
                  margin: '8px 0 0',
                }}>
                  Morning value was {morningValue}, changed to {out} after round
                </p>
              )}
            </div>
          )
        })}

        {/* Submit button */}
        <div style={{ marginTop: 32 }}>
          <Btn onClick={handleSubmit} color="#16A34A" disabled={saving}>
            <Check size={20} /> Confirm &amp; Submit
          </Btn>
        </div>
      </Page>
    </Phone>
  )
}
