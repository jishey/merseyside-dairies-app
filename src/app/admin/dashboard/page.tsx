'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Phone from '@/components/shared/Phone'
import BottomNav from '@/components/shared/BottomNav'
import Btn from '@/components/shared/Btn'
import { useAdmin } from '@/lib/auth/admin-context'
import { createClient } from '@/lib/supabase/client'
import { dateStr, formatDate, greeting } from '@/lib/helpers/date'
import { ClipboardList, AlertTriangle, Package, Mail, Check } from 'lucide-react'

interface MilkmanInfo {
  id: string
  name: string
}

interface ClipboardStatusInfo {
  milkman_id: string
  headed_out: boolean
  submitted: boolean
}

interface AbsenceInfo {
  milkman_id: string
  covering_id: string | null
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { isAdmin, loading: authLoading } = useAdmin()
  const supabase = createClient()
  const today = dateStr(new Date())

  const [milkmen, setMilkmen] = useState<MilkmanInfo[]>([])
  const [statuses, setStatuses] = useState<ClipboardStatusInfo[]>([])
  const [absences, setAbsences] = useState<AbsenceInfo[]>([])
  const [fridgeTime, setFridgeTime] = useState<string | null>(null)
  const [orderSent, setOrderSent] = useState(false)
  const [dayClosed, setDayClosed] = useState(false)
  const [closedAt, setClosedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/admin')
    }
  }, [isAdmin, authLoading, router])

  useEffect(() => {
    if (isAdmin) loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  const loadData = async () => {
    // Load milkmen
    const { data: milkmenData } = await supabase
      .from('milkmen')
      .select('id, name')
      .eq('active', true)
      .order('sort_order')

    if (milkmenData) setMilkmen(milkmenData)

    // Load clipboard statuses
    const { data: statusData } = await supabase
      .from('clipboard_status')
      .select('milkman_id, headed_out, submitted')
      .eq('date', today)

    if (statusData) setStatuses(statusData)

    // Load absences
    const { data: absenceData } = await supabase
      .from('absences')
      .select('milkman_id, covering_id')
      .eq('date', today)

    if (absenceData) setAbsences(absenceData)

    // Load fridge count status
    const { data: fridgeData } = await supabase
      .from('fridge_counts')
      .select('counted_at')
      .eq('date', today)
      .limit(1)

    if (fridgeData && fridgeData.length > 0 && fridgeData[0].counted_at) {
      const t = new Date(fridgeData[0].counted_at)
      setFridgeTime(
        `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`
      )
    }

    // Load order status
    const { data: orderData } = await supabase
      .from('orders')
      .select('sent_at')
      .eq('date', today)
      .maybeSingle()

    if (orderData?.sent_at) setOrderSent(true)

    // Load day status
    const { data: dayData } = await supabase
      .from('day_status')
      .select('closed, closed_at')
      .eq('date', today)
      .maybeSingle()

    if (dayData) {
      setDayClosed(dayData.closed)
      if (dayData.closed_at) {
        const t = new Date(dayData.closed_at)
        setClosedAt(
          `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`
        )
      }
    }

    setLoading(false)
  }

  const handleNav = (id: string) => {
    router.push(`/admin/${id}`)
  }

  const handleCloseDay = async () => {
    const confirmed = window.confirm(
      'Close the day? Milkmen will no longer be able to edit their clipboards.'
    )
    if (!confirmed) return

    await supabase
      .from('day_status')
      .upsert({
        date: today,
        closed: true,
        closed_at: new Date().toISOString(),
      }, { onConflict: 'date' })

    const now = new Date()
    setDayClosed(true)
    setClosedAt(
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    )
  }

  const handleReopenDay = async () => {
    await supabase
      .from('day_status')
      .upsert({
        date: today,
        closed: false,
        closed_at: null,
      }, { onConflict: 'date' })

    setDayClosed(false)
    setClosedAt(null)
  }

  if (authLoading || loading) {
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

  if (!isAdmin) return null

  const absentIds = new Set(absences.map((a) => a.milkman_id))
  const workingMilkmen = milkmen.filter((m) => !absentIds.has(m.id))
  const confirmedCount = statuses.filter(
    (s) => (s.headed_out || s.submitted) && !absentIds.has(s.milkman_id)
  ).length
  const submittedCount = statuses.filter((s) => s.submitted).length
  const hasAnySubmitted = submittedCount > 0

  // Anomaly count placeholder -- would need history data to compute properly
  const anomalyCount = 0

  return (
    <Phone bg="#F8FAFC">
      <div style={{ padding: '24px 20px 100px' }} className="screen-fade">
        {/* Header */}
        <h1 style={{
          fontSize: 32,
          fontWeight: 800,
          color: '#1E3A5F',
          margin: 0,
          letterSpacing: '-0.02em',
        }}>
          {greeting()}, John
        </h1>
        <p style={{
          fontSize: 16,
          color: '#64748B',
          fontWeight: 600,
          margin: '6px 0 0',
        }}>
          {formatDate(new Date())}
        </p>

        {/* Absence banner */}
        {absences.length > 0 && (
          <div style={{
            background: '#F3E8FF',
            border: '2px solid #E9D5FF',
            borderRadius: 12,
            padding: 14,
            marginTop: 20,
          }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: '#6B21A8', margin: 0 }}>
              OFF TODAY: {absences.map((a) => {
                const absent = milkmen.find((m) => m.id === a.milkman_id)
                const cover = milkmen.find((m) => m.id === a.covering_id)
                return `${absent?.name || 'Unknown'}${cover ? ` (-> ${cover.name})` : ''}`
              }).join(', ')}
            </p>
          </div>
        )}

        {/* 4-card grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 14,
          marginTop: 24,
        }}>
          {/* Clipboards In */}
          <button
            onClick={() => router.push('/admin/clipboards')}
            style={{
              padding: 20,
              borderRadius: 16,
              border: '2px solid #93C5FD',
              background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)',
            }}
          >
            <ClipboardList size={32} color="#2563EB" />
            <p style={{ fontSize: 32, fontWeight: 800, color: '#1E3A5F', margin: '8px 0 4px' }}>
              {confirmedCount}/{workingMilkmen.length}
            </p>
            <p style={{ fontSize: 13, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', margin: 0 }}>
              {hasAnySubmitted ? `Confirmed (${submittedCount} finished)` : 'Clipboards In'}
            </p>
          </button>

          {/* Anomalies */}
          <button
            onClick={() => router.push('/admin/clipboards')}
            style={{
              padding: 20,
              borderRadius: 16,
              border: '2px solid #FCD34D',
              background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)',
            }}
          >
            <AlertTriangle size={32} color="#D97706" />
            <p style={{ fontSize: 32, fontWeight: 800, color: '#92400E', margin: '8px 0 4px' }}>
              {anomalyCount}
            </p>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', margin: 0 }}>
              Anomalies
            </p>
          </button>

          {/* Fridge Count */}
          <button
            onClick={() => router.push('/admin/fridge')}
            style={{
              padding: 20,
              borderRadius: 16,
              border: '2px solid #C4B5FD',
              background: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.1)',
            }}
          >
            <Package size={32} color="#7C3AED" />
            <p style={{ fontSize: 18, fontWeight: 800, color: '#5B21B6', margin: '8px 0 4px' }}>
              {fridgeTime ? `Done at ${fridgeTime}` : 'Not yet entered'}
            </p>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', margin: 0 }}>
              Fridge Count
            </p>
          </button>

          {/* Today's Order */}
          <button
            onClick={() => router.push('/admin/order')}
            style={{
              padding: 20,
              borderRadius: 16,
              border: '2px solid #86EFAC',
              background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.1)',
            }}
          >
            <Mail size={32} color="#16A34A" />
            <p style={{ fontSize: 18, fontWeight: 800, color: '#166534', margin: '8px 0 4px' }}>
              {orderSent ? 'Sent' : 'Not yet placed'}
            </p>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', margin: 0 }}>
              Today&apos;s Order
            </p>
          </button>
        </div>

        {/* Close/Reopen day */}
        <div style={{ marginTop: 24 }}>
          {!dayClosed && hasAnySubmitted && (
            <button
              onClick={handleCloseDay}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #FCA5A5, #F87171)',
                color: '#fff',
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                transition: 'all 0.2s',
              }}
            >
              <Check size={20} /> Close Day
            </button>
          )}

          {dayClosed && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#64748B', fontWeight: 700, margin: '0 0 10px' }}>
                Closed at {closedAt}
              </p>
              <Btn onClick={handleReopenDay} outline color="#CBD5E1">
                Reopen Day
              </Btn>
            </div>
          )}
        </div>

        {/* Order History link */}
        <button
          onClick={() => router.push('/admin/order/history')}
          style={{
            width: '100%',
            marginTop: 12,
            border: '2px solid #E2E8F0',
            borderRadius: 10,
            padding: 12,
            fontSize: 14,
            fontWeight: 700,
            color: '#2563EB',
            background: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Order History
        </button>
      </div>

      <BottomNav active="dashboard" onNav={handleNav} />
    </Phone>
  )
}
