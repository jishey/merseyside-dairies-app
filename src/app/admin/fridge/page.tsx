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
import { dateStr } from '@/lib/helpers/date'
import { Check } from 'lucide-react'

interface ProductInfo {
  id: string
  name: string
  size: string
  color: string
}

export default function FridgePage() {
  const router = useRouter()
  const { isAdmin, loading: authLoading } = useAdmin()
  const supabase = createClient()
  const today = dateStr(new Date())

  const [products, setProducts] = useState<ProductInfo[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/admin')
  }, [isAdmin, authLoading, router])

  useEffect(() => {
    if (isAdmin) loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  const loadData = async () => {
    const { data: productsData } = await supabase
      .from('products')
      .select('id, name, size, color')
      .eq('active', true)
      .order('sort_order')

    if (productsData) setProducts(productsData)

    // Load existing fridge counts for today
    const { data: fridgeData } = await supabase
      .from('fridge_counts')
      .select('product_id, quantity')
      .eq('date', today)

    if (fridgeData && fridgeData.length > 0) {
      const countMap: Record<string, number> = {}
      for (const f of fridgeData) {
        countMap[f.product_id] = f.quantity
      }
      setCounts(countMap)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const now = new Date().toISOString()

    const upserts = products.map((p) => ({
      product_id: p.id,
      date: today,
      quantity: counts[p.id] || 0,
      counted_at: now,
    }))

    await supabase
      .from('fridge_counts')
      .upsert(upserts, { onConflict: 'product_id,date' })

    router.push('/admin/dashboard')
  }

  const handleNav = (id: string) => {
    router.push(`/admin/${id}`)
  }

  if (authLoading || !isAdmin) return null

  return (
    <Phone bg="#F8FAFC">
      <div style={{ padding: '24px 20px 100px' }} className="screen-fade">
        <BackBtn onClick={() => router.push('/admin/dashboard')} />

        <h1 style={{
          fontSize: 32,
          fontWeight: 800,
          color: '#1E3A5F',
          margin: '0 0 8px',
          letterSpacing: '-0.02em',
        }}>
          Fridge Count
        </h1>
        <p style={{
          fontSize: 16,
          color: '#64748B',
          fontWeight: 600,
          margin: '0 0 24px',
        }}>
          Count what&apos;s left after the lads have loaded
        </p>

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
              value={counts[product.id] || 0}
              onChange={(v) => setCounts((prev) => ({ ...prev, [product.id]: v }))}
            />
          </div>
        ))}

        {/* Save button */}
        <div style={{ marginTop: 24 }}>
          <Btn onClick={handleSave} color="#16A34A" disabled={saving}>
            <Check size={20} /> Save Fridge Count
          </Btn>
        </div>
      </div>

      <BottomNav active="dashboard" onNav={handleNav} />
    </Phone>
  )
}
