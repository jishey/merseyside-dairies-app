'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Phone from '@/components/shared/Phone'
import Btn from '@/components/shared/Btn'
import { createClient } from '@/lib/supabase/client'
import { dateStr } from '@/lib/helpers/date'
import { AlertTriangle, Check, ChevronLeft } from 'lucide-react'

interface AnomalyItem {
  productId: string
  avg: number
  value: number
}

interface ProductInfo {
  id: string
  name: string
  size: string
  color: string
}

export default function ConfirmAnomaliesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: milkmanId } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const today = dateStr(new Date())

  const [milkmanName, setMilkmanName] = useState('')
  const [anomalyItems, setAnomalyItems] = useState<AnomalyItem[]>([])
  const [products, setProducts] = useState<ProductInfo[]>([])
  const [saving, setSaving] = useState(false)

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const todayDayName = dayNames[new Date().getDay()]

  useEffect(() => {
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    // Load milkman name
    const { data: milkmanData } = await supabase
      .from('milkmen')
      .select('name')
      .eq('id', milkmanId)
      .single()

    if (milkmanData) setMilkmanName(milkmanData.name)

    // Load products
    const { data: productsData } = await supabase
      .from('products')
      .select('id, name, size, color')
      .eq('active', true)
      .order('sort_order')

    if (productsData) setProducts(productsData)

    // Load anomaly data from sessionStorage
    const stored = sessionStorage.getItem(`anomalies-${milkmanId}`)
    if (stored) {
      setAnomalyItems(JSON.parse(stored))
    }
  }

  const handleConfirmAll = async () => {
    setSaving(true)

    // Load current clipboard entries to save morning snapshot
    const { data: entries } = await supabase
      .from('clipboard_entries')
      .select('product_id, out, back, waste')
      .eq('milkman_id', milkmanId)
      .eq('date', today)

    if (entries && entries.length > 0) {
      const upserts = entries.map((e) => ({
        milkman_id: milkmanId,
        product_id: e.product_id,
        date: today,
        out: e.out,
        back: e.back,
        waste: e.waste,
        morning_out: e.out,
        updated_at: new Date().toISOString(),
      }))

      await supabase
        .from('clipboard_entries')
        .upsert(upserts, { onConflict: 'milkman_id,product_id,date' })
    }

    // Set headed_out status
    await supabase
      .from('clipboard_status')
      .upsert({
        milkman_id: milkmanId,
        date: today,
        headed_out: true,
        headed_out_at: new Date().toISOString(),
      }, { onConflict: 'milkman_id,date' })

    // Clean up sessionStorage
    sessionStorage.removeItem(`anomalies-${milkmanId}`)

    router.push('/')
  }

  const handleGoBack = () => {
    router.push(`/clipboard/${milkmanId}`)
  }

  return (
    <Phone bg="#FEF3C7">
      <div style={{
        minHeight: '100vh',
        padding: '40px 24px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      className="screen-fade"
      >
        {/* Warning icon */}
        <div style={{
          width: 90,
          height: 90,
          borderRadius: '50%',
          background: '#FDE68A',
          boxShadow: '0 6px 16px rgba(245, 158, 11, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}>
          <AlertTriangle size={48} color="#D97706" />
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: 26,
          fontWeight: 800,
          color: '#92400E',
          letterSpacing: '-0.02em',
          margin: '0 0 8px',
          textAlign: 'center',
        }}>
          Hold on, {milkmanName}
        </h1>
        <p style={{
          fontSize: 17,
          color: '#A16207',
          fontWeight: 600,
          textAlign: 'center',
          margin: '0 0 32px',
        }}>
          These amounts look unusual — are you sure?
        </p>

        {/* Anomaly product cards */}
        <div style={{ width: '100%', marginBottom: 32 }}>
          {anomalyItems.map((item) => {
            const product = products.find((p) => p.id === item.productId)
            if (!product) return null
            return (
              <div
                key={item.productId}
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  padding: '16px 18px',
                  border: '2px solid #FBBF24',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  marginBottom: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: product.color,
                  }} />
                  <span style={{ fontSize: 17, fontWeight: 800, color: '#1E293B' }}>
                    {product.name}
                  </span>
                  <span style={{ fontSize: 14, color: '#78716C', fontWeight: 600 }}>
                    {product.size}
                  </span>
                </div>
                <p style={{ fontSize: 15, color: '#92400E', fontWeight: 600, margin: 0 }}>
                  Taking <span style={{ fontSize: 20, fontWeight: 800 }}>{item.value}</span> — avg ~{item.avg} on {todayDayName}s (last 4 wks)
                </p>
              </div>
            )
          })}
        </div>

        {/* Buttons */}
        <div style={{ width: '100%' }}>
          <Btn
            onClick={handleConfirmAll}
            color="#F59E0B"
            disabled={saving}
          >
            <Check size={20} /> Yes, that&apos;s right — Head Out
          </Btn>
          <div style={{ height: 12 }} />
          <Btn
            onClick={handleGoBack}
            outline
            color="#92400E"
          >
            <ChevronLeft size={20} /> Go Back &amp; Fix
          </Btn>
        </div>
      </div>
    </Phone>
  )
}
