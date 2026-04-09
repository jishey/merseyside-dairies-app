'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Phone from '@/components/shared/Phone'
import BottomNav from '@/components/shared/BottomNav'
import { useAdmin } from '@/lib/auth/admin-context'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/helpers/date'
import { Mail } from 'lucide-react'

interface OrderInfo {
  id: string
  date: string
  supplier_email: string | null
  sent_at: string | null
  items: Array<{
    product_name: string
    product_size: string
    quantity: number
  }>
}

export default function OrderHistoryPage() {
  const router = useRouter()
  const { isAdmin, loading: authLoading } = useAdmin()
  const supabase = createClient()

  const [orders, setOrders] = useState<OrderInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/admin')
  }, [isAdmin, authLoading, router])

  useEffect(() => {
    if (isAdmin) loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  const loadData = async () => {
    // Load orders with items
    const { data: ordersData } = await supabase
      .from('orders')
      .select('id, date, supplier_email, sent_at')
      .order('date', { ascending: false })

    if (!ordersData || ordersData.length === 0) {
      setLoading(false)
      return
    }

    // Load order items with product info
    const orderIds = ordersData.map((o) => o.id)
    const { data: itemsData } = await supabase
      .from('order_items')
      .select('order_id, quantity, product_id')
      .in('order_id', orderIds)

    // Load products for names
    const { data: productsData } = await supabase
      .from('products')
      .select('id, name, size')
      .order('sort_order')

    const productMap: Record<string, { name: string; size: string }> = {}
    if (productsData) {
      for (const p of productsData) productMap[p.id] = { name: p.name, size: p.size }
    }

    const result: OrderInfo[] = ordersData.map((o) => {
      const items = (itemsData || [])
        .filter((i) => i.order_id === o.id)
        .map((i) => ({
          product_name: productMap[i.product_id]?.name || 'Unknown',
          product_size: productMap[i.product_id]?.size || '',
          quantity: i.quantity,
        }))
        .filter((i) => i.quantity > 0)

      return { ...o, items }
    })

    setOrders(result)
    setLoading(false)
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
          Order History
        </h1>

        {orders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
          }}>
            <Mail size={48} color="#CBD5E1" style={{ margin: '0 auto 16px', display: 'block' }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: '#9CA3AF', margin: 0 }}>
              No orders sent yet
            </p>
          </div>
        ) : (
          orders.map((order) => {
            const sentDate = order.sent_at ? new Date(order.sent_at) : null
            const sentTime = sentDate
              ? `${String(sentDate.getHours()).padStart(2, '0')}:${String(sentDate.getMinutes()).padStart(2, '0')}`
              : ''
            const orderDate = new Date(order.date + 'T00:00:00')

            return (
              <div
                key={order.id}
                style={{
                  background: '#F8FAFC',
                  borderRadius: 12,
                  padding: 16,
                  border: '2px solid #E2E8F0',
                  marginBottom: 12,
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#1E3A5F' }}>
                    {formatDate(orderDate)}
                  </span>
                  {sentTime && (
                    <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
                      {sentTime}
                    </span>
                  )}
                </div>

                {order.supplier_email && (
                  <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 10px' }}>
                    To: {order.supplier_email}
                  </p>
                )}

                {/* Items */}
                {order.items.length > 0 && (
                  <div style={{
                    background: '#fff',
                    borderRadius: 8,
                    padding: 10,
                  }}>
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 12,
                          padding: '4px 0',
                          borderBottom: idx < order.items.length - 1 ? '1px solid #F1F5F9' : 'none',
                        }}
                      >
                        <span style={{ color: '#64748B' }}>
                          {item.product_name} ({item.product_size})
                        </span>
                        <strong style={{ color: '#1E293B' }}>{item.quantity}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <BottomNav active="history" onNav={handleNav} />
    </Phone>
  )
}
