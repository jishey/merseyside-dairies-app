'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Phone from '@/components/shared/Phone'
import BackBtn from '@/components/shared/BackBtn'
import Btn from '@/components/shared/Btn'
import Stepper from '@/components/shared/Stepper'
import BottomNav from '@/components/shared/BottomNav'
import { useAdmin } from '@/lib/auth/admin-context'
import { createClient } from '@/lib/supabase/client'
import { Check } from 'lucide-react'

interface ProductInfo {
  id: string
  name: string
  size: string
  color: string
}

const DAYS = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
]

export default function TargetsPage() {
  const router = useRouter()
  const { isAdmin, loading: authLoading } = useAdmin()
  const supabase = createClient()

  const [products, setProducts] = useState<ProductInfo[]>([])
  const [selectedDay, setSelectedDay] = useState('mon')
  // Targets for every day, kept in memory so switching day tabs doesn't lose unsaved edits
  const [allTargets, setAllTargets] = useState<Record<string, Record<string, number>>>({})
  const targets = allTargets[selectedDay] || {}
  const setTarget = (productId: string, v: number) =>
    setAllTargets((prev) => ({
      ...prev,
      [selectedDay]: { ...(prev[selectedDay] || {}), [productId]: v },
    }))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/admin')
  }, [isAdmin, authLoading, router])

  useEffect(() => {
    if (isAdmin) loadProducts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  useEffect(() => {
    if (isAdmin) loadTargets()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name, size, color')
      .eq('active', true)
      .order('sort_order')

    if (data) setProducts(data)
  }

  const loadTargets = async () => {
    const { data } = await supabase
      .from('stock_targets')
      .select('product_id, day_of_week, target')

    const all: Record<string, Record<string, number>> = {}
    if (data) {
      for (const t of data) {
        if (!all[t.day_of_week]) all[t.day_of_week] = {}
        all[t.day_of_week][t.product_id] = t.target
      }
    }
    setAllTargets(all)
  }

  const handleSave = async () => {
    setSaving(true)

    // Save every day at once, so edits made on other day tabs are kept too
    const upserts = DAYS.flatMap((d) =>
      products.map((p) => ({
        product_id: p.id,
        day_of_week: d.key,
        target: allTargets[d.key]?.[p.id] || 0,
      }))
    )

    await supabase
      .from('stock_targets')
      .upsert(upserts, { onConflict: 'product_id,day_of_week' })

    setSaving(false)
    router.push('/admin/settings')
  }

  const handleNav = (id: string) => {
    router.push(`/admin/${id}`)
  }

  if (authLoading || !isAdmin) return null

  return (
    <Phone bg="#F8FAFC">
      <div style={{ padding: '24px 20px 100px' }} className="screen-fade">
        <BackBtn onClick={() => router.push('/admin/settings')} />

        <h1 style={{
          fontSize: 32,
          fontWeight: 800,
          color: '#1E3A5F',
          margin: '0 0 8px',
          letterSpacing: '-0.02em',
        }}>
          Stock Targets
        </h1>
        <p style={{
          fontSize: 15,
          color: '#64748B',
          fontWeight: 600,
          margin: '0 0 20px',
        }}>
          How much of each product do you want in the fridge each morning?
        </p>

        {/* Day tabs */}
        <div style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          marginBottom: 24,
          paddingBottom: 4,
        }}>
          {DAYS.map((d) => (
            <button
              key={d.key}
              onClick={() => setSelectedDay(d.key)}
              style={{
                padding: '10px 16px',
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 15,
                flexShrink: 0,
                border: selectedDay === d.key ? 'none' : '2px solid #E2E8F0',
                background: selectedDay === d.key
                  ? 'linear-gradient(135deg, #2563EB, #1D4ED8)'
                  : '#fff',
                color: selectedDay === d.key ? '#fff' : '#64748B',
                boxShadow: selectedDay === d.key ? '0 4px 12px rgba(37, 99, 235, 0.2)' : 'none',
                letterSpacing: selectedDay === d.key ? '-0.01em' : 'normal',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Product list */}
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              background: '#F8FAFC',
              borderRadius: 12,
              padding: 16,
              border: '2px solid #E2E8F0',
              borderLeft: `4px solid ${product.color}`,
              marginBottom: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: product.color,
              }} />
              <span style={{ fontSize: 18, fontWeight: 800, color: '#1E3A5F' }}>
                {product.name} {product.size}
              </span>
            </div>
            <Stepper
              value={targets[product.id] || 0}
              onChange={(v) => setTarget(product.id, v)}
            />
          </div>
        ))}

        {/* Save button */}
        <div style={{ marginTop: 24 }}>
          <Btn onClick={handleSave} color="#16A34A" disabled={saving}>
            <Check size={20} /> Save Targets
          </Btn>
        </div>
      </div>

      <BottomNav active="settings" onNav={handleNav} />
    </Phone>
  )
}
