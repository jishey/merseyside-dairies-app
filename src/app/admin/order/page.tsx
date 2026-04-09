'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Phone from '@/components/shared/Phone'
import Btn from '@/components/shared/Btn'
import Stepper from '@/components/shared/Stepper'
import BottomNav from '@/components/shared/BottomNav'
import { useAdmin } from '@/lib/auth/admin-context'
import { createClient } from '@/lib/supabase/client'
import { dateStr, getTomorrowDayOfWeek } from '@/lib/helpers/date'
import { calculateSuggested } from '@/lib/helpers/order'
import { Mail, Package } from 'lucide-react'

interface ProductInfo {
  id: string
  name: string
  size: string
  color: string
}

export default function OrderPage() {
  const router = useRouter()
  const { isAdmin, loading: authLoading } = useAdmin()
  const supabase = createClient()
  const today = dateStr(new Date())
  const tomorrowDow = getTomorrowDayOfWeek()

  const [products, setProducts] = useState<ProductInfo[]>([])
  const [targets, setTargets] = useState<Record<string, number>>({})
  const [fridgeCounts, setFridgeCounts] = useState<Record<string, number>>({})
  const [returned, setReturned] = useState<Record<string, number>>({})
  const [orderOverrides, setOrderOverrides] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/admin')
  }, [isAdmin, authLoading, router])

  useEffect(() => {
    if (isAdmin) loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  const loadData = async () => {
    // Products
    const { data: productsData } = await supabase
      .from('products')
      .select('id, name, size, color')
      .eq('active', true)
      .order('sort_order')

    if (productsData) setProducts(productsData)

    // Stock targets for TOMORROW
    const { data: targetsData } = await supabase
      .from('stock_targets')
      .select('product_id, target')
      .eq('day_of_week', tomorrowDow)

    if (targetsData) {
      const tMap: Record<string, number> = {}
      for (const t of targetsData) tMap[t.product_id] = t.target
      setTargets(tMap)
    }

    // Fridge counts
    const { data: fridgeData } = await supabase
      .from('fridge_counts')
      .select('product_id, quantity')
      .eq('date', today)

    if (fridgeData) {
      const fMap: Record<string, number> = {}
      for (const f of fridgeData) fMap[f.product_id] = f.quantity
      setFridgeCounts(fMap)
    }

    // Sum of all milkmen's brought-back for today
    const { data: entriesData } = await supabase
      .from('clipboard_entries')
      .select('product_id, back')
      .eq('date', today)

    if (entriesData) {
      const rMap: Record<string, number> = {}
      for (const e of entriesData) {
        rMap[e.product_id] = (rMap[e.product_id] || 0) + e.back
      }
      setReturned(rMap)
    }

    setLoading(false)
  }

  const productCalcs = useMemo(() => {
    const result: Record<string, { target: number; inFridge: number; returned: number; onHand: number; suggested: number }> = {}
    for (const p of products) {
      const target = targets[p.id] || 0
      const inFridge = fridgeCounts[p.id] || 0
      const ret = returned[p.id] || 0
      const onHand = inFridge + ret
      const suggested = calculateSuggested(target, inFridge, ret)
      result[p.id] = { target, inFridge, returned: ret, onHand, suggested }
    }
    return result
  }, [products, targets, fridgeCounts, returned])

  const getOrderQty = (productId: string): number => {
    return orderOverrides[productId] ?? productCalcs[productId]?.suggested ?? 0
  }

  const handleGenerateEmail = () => {
    // Build order quantities and store in sessionStorage
    const quantities: Record<string, number> = {}
    for (const p of products) {
      quantities[p.id] = getOrderQty(p.id)
    }
    sessionStorage.setItem('order-quantities', JSON.stringify(quantities))
    sessionStorage.setItem('order-products', JSON.stringify(products))
    router.push('/admin/order/email')
  }

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

  const dayNames: Record<string, string> = {
    sun: 'Sunday', mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
    thu: 'Thursday', fri: 'Friday', sat: 'Saturday',
  }

  return (
    <Phone bg="#F8FAFC">
      <div style={{ padding: '24px 20px 100px' }} className="screen-fade">
        <h1 style={{
          fontSize: 32,
          fontWeight: 800,
          color: '#1E3A5F',
          margin: '0 0 8px',
          letterSpacing: '-0.02em',
        }}>
          Order Calculator
        </h1>
        <p style={{
          fontSize: 14,
          color: '#64748B',
          fontWeight: 600,
          margin: '0 0 24px',
        }}>
          Ordering for {dayNames[tomorrowDow] || tomorrowDow} delivery
        </p>

        {/* Product cards */}
        {products.map((product) => {
          const calc = productCalcs[product.id]
          if (!calc) return null

          return (
            <div
              key={product.id}
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: 16,
                border: '2px solid #E2E8F0',
                borderLeft: `4px solid ${product.color}`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                marginBottom: 14,
              }}
            >
              {/* Product header */}
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

              {/* Info grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 6,
                fontSize: 14,
                color: '#64748B',
                fontWeight: 600,
                marginBottom: 12,
              }}>
                <span>Tomorrow&apos;s Target: <strong style={{ color: '#1E293B' }}>{calc.target}</strong></span>
                <span>In Fridge: <strong style={{ color: '#1E293B' }}>{calc.inFridge}</strong></span>
                <span>Returned: <strong style={{ color: '#1E293B' }}>{calc.returned}</strong></span>
                <span>On Hand: <strong style={{ color: '#1E293B' }}>{calc.onHand}</strong></span>
              </div>

              {/* Blue highlight box */}
              <div style={{
                background: '#EFF6FF',
                padding: 10,
                borderRadius: 10,
                border: '2px solid #BFDBFE',
                textAlign: 'center',
                marginBottom: 14,
              }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#1E40AF' }}>
                  Need to order: {calc.suggested}
                </span>
              </div>

              {/* Your Order stepper */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#1E293B' }}>
                  Your Order:
                </span>
                <Stepper
                  value={getOrderQty(product.id)}
                  onChange={(v) => setOrderOverrides((prev) => ({ ...prev, [product.id]: v }))}
                />
              </div>
            </div>
          )
        })}

        {/* Buttons */}
        <div style={{ marginTop: 24 }}>
          <Btn onClick={handleGenerateEmail} color="#2563EB">
            <Mail size={20} /> Generate Order Email
          </Btn>
          <div style={{ height: 12 }} />
          <Btn onClick={() => router.push('/admin/products')} outline color="#78716C">
            <Package size={20} /> Add / Remove Products
          </Btn>
        </div>
      </div>

      <BottomNav active="order" onNav={handleNav} />
    </Phone>
  )
}
