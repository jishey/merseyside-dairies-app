'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Phone from '@/components/shared/Phone'
import BackBtn from '@/components/shared/BackBtn'
import Btn from '@/components/shared/Btn'
import { useAdmin } from '@/lib/auth/admin-context'
import { createClient } from '@/lib/supabase/client'
import { dateStr } from '@/lib/helpers/date'
import { Mail, RefreshCw, Check } from 'lucide-react'

interface ProductInfo {
  id: string
  name: string
  size: string
}

export default function OrderEmailPage() {
  const router = useRouter()
  const { isAdmin, loading: authLoading } = useAdmin()
  const supabase = createClient()
  const today = dateStr(new Date())

  const [supplierEmail, setSupplierEmail] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [products, setProducts] = useState<ProductInfo[]>([])
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [sent, setSent] = useState(false)
  const [sentTime, setSentTime] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/admin')
  }, [isAdmin, authLoading, router])

  useEffect(() => {
    if (isAdmin) loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  const loadData = async () => {
    // Load supplier email from settings
    const { data: emailSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'supplier_email')
      .single()

    if (emailSetting) setSupplierEmail(emailSetting.value)

    // Load order data from sessionStorage
    const storedProducts = sessionStorage.getItem('order-products')
    const storedQuantities = sessionStorage.getItem('order-quantities')

    if (storedProducts && storedQuantities) {
      const prods: ProductInfo[] = JSON.parse(storedProducts)
      const qtys: Record<string, number> = JSON.parse(storedQuantities)
      setProducts(prods)
      setQuantities(qtys)

      // Generate email body
      const items = prods
        .map((p) => `- ${p.name} (${p.size}): ${qtys[p.id] || 0}`)
        .join('\n')

      setEmailBody(`Hi,

Please find our order for delivery tomorrow morning:

${items}

Thanks,
John
Merseyside Dairies`)
    }
  }

  const handleSend = async () => {
    setSaving(true)

    // Save order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        date: today,
        supplier_email: supplierEmail,
        email_body: emailBody,
        sent_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (orderError || !orderData) {
      setSaving(false)
      return
    }

    // Save order items
    const items = products
      .filter((p) => (quantities[p.id] || 0) > 0)
      .map((p) => ({
        order_id: orderData.id,
        product_id: p.id,
        quantity: quantities[p.id] || 0,
      }))

    if (items.length > 0) {
      await supabase.from('order_items').insert(items)
    }

    // Clean up sessionStorage
    sessionStorage.removeItem('order-products')
    sessionStorage.removeItem('order-quantities')

    const now = new Date()
    setSentTime(
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    )
    setSent(true)
    setSaving(false)
  }

  if (authLoading || !isAdmin) return null

  // Confirmation screen
  if (sent) {
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
            fontSize: 28,
            fontWeight: 800,
            color: '#166534',
            textAlign: 'center',
            margin: '0 0 12px',
          }}>
            Order sent!
          </h1>

          <p style={{
            fontSize: 16,
            color: '#64748B',
            fontWeight: 600,
            margin: '0 0 48px',
          }}>
            {supplierEmail} at {sentTime}
          </p>

          <Btn onClick={() => router.push('/admin/dashboard')} color="#2563EB">
            Done
          </Btn>
        </div>
      </Phone>
    )
  }

  return (
    <Phone bg="#F8FAFC">
      <div style={{ padding: '24px 20px 40px' }} className="screen-fade">
        <BackBtn onClick={() => router.push('/admin/order')} />

        <h1 style={{
          fontSize: 32,
          fontWeight: 800,
          color: '#1E3A5F',
          margin: '0 0 20px',
          letterSpacing: '-0.02em',
        }}>
          Order Email
        </h1>

        {/* To field */}
        <div style={{
          background: '#F8FAFC',
          padding: 14,
          borderRadius: 12,
          border: '2px solid #E2E8F0',
          marginBottom: 16,
        }}>
          <span style={{
            fontSize: 15,
            fontWeight: 800,
            color: '#1E293B',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            To: {supplierEmail}
          </span>
        </div>

        {/* Email body textarea */}
        <textarea
          value={emailBody}
          onChange={(e) => setEmailBody(e.target.value)}
          style={{
            width: '100%',
            minHeight: 300,
            border: '2px solid #E2E8F0',
            borderRadius: 12,
            padding: 16,
            fontSize: 15,
            fontFamily: 'monospace',
            lineHeight: 1.6,
            fontWeight: 500,
            color: '#1E293B',
            resize: 'vertical',
            marginBottom: 20,
          }}
        />

        {/* Buttons */}
        <Btn onClick={handleSend} color="#16A34A" disabled={saving}>
          <Mail size={20} /> Send Order
        </Btn>
        <div style={{ height: 12 }} />
        <Btn onClick={() => router.push('/admin/order')} outline color="#78716C">
          <RefreshCw size={20} /> Redraft
        </Btn>
      </div>
    </Phone>
  )
}
