'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Phone from '@/components/shared/Phone'
import Btn from '@/components/shared/Btn'
import BottomNav from '@/components/shared/BottomNav'
import { useAdmin } from '@/lib/auth/admin-context'
import { createClient } from '@/lib/supabase/client'
import { dateStr } from '@/lib/helpers/date'
import {
  Calculator,
  Package,
  Trash2,
  Plus,
  Check,
  X,
  LogOut,
} from 'lucide-react'

interface MilkmanInfo {
  id: string
  name: string
  pin: string
}

interface PinResetState {
  milkmanId: string | null
  newPin: string
  saving: boolean
  success: string | null
}

interface AbsenceInfo {
  id: string
  milkman_id: string
  covering_id: string | null
}

export default function SettingsPage() {
  const router = useRouter()
  const { isAdmin, loading: authLoading, logout } = useAdmin()
  const supabase = createClient()
  const today = dateStr(new Date())

  const [supplierEmail, setSupplierEmail] = useState('')
  const [milkmen, setMilkmen] = useState<MilkmanInfo[]>([])
  const [absences, setAbsences] = useState<AbsenceInfo[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPin, setNewPin] = useState('')
  const [saving, setSaving] = useState(false)
  const [pinReset, setPinReset] = useState<PinResetState>({
    milkmanId: null,
    newPin: '',
    saving: false,
    success: null,
  })

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/admin')
  }, [isAdmin, authLoading, router])

  useEffect(() => {
    if (isAdmin) loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  const loadData = async () => {
    // Supplier email
    const { data: emailSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'supplier_email')
      .single()

    if (emailSetting) setSupplierEmail(emailSetting.value)

    // Milkmen
    const { data: milkmenData } = await supabase
      .from('milkmen')
      .select('id, name, pin')
      .eq('active', true)
      .order('sort_order')

    if (milkmenData) setMilkmen(milkmenData)

    // Today's absences
    const { data: absenceData } = await supabase
      .from('absences')
      .select('id, milkman_id, covering_id')
      .eq('date', today)

    if (absenceData) setAbsences(absenceData)
  }

  const handleEmailBlur = async () => {
    await supabase
      .from('settings')
      .update({ value: supplierEmail.trim() })
      .eq('key', 'supplier_email')
  }

  const handleRemoveMilkman = async (m: MilkmanInfo) => {
    if (!confirm(`Remove ${m.name}? This cannot be undone.`)) return
    setSaving(true)
    await supabase.from('milkmen').update({ active: false }).eq('id', m.id)
    await loadData()
    setSaving(false)
  }

  const handleAddMilkman = async () => {
    if (!newName.trim() || !newPin.trim()) return
    setSaving(true)

    const maxOrder = milkmen.length > 0
      ? Math.max(...milkmen.map((_, i) => i + 1))
      : 0

    await supabase.from('milkmen').insert({
      name: newName.trim(),
      pin: newPin.trim(),
      sort_order: maxOrder + 1,
      active: true,
    })

    setNewName('')
    setNewPin('')
    setShowAddForm(false)
    await loadData()
    setSaving(false)
  }

  const handleMarkAbsent = async (milkmanId: string) => {
    setSaving(true)
    await supabase.from('absences').insert({
      milkman_id: milkmanId,
      date: today,
      covering_id: null,
    })
    await loadData()
    setSaving(false)
  }

  const handleClearAbsence = async (absenceId: string) => {
    setSaving(true)
    await supabase.from('absences').delete().eq('id', absenceId)
    await loadData()
    setSaving(false)
  }

  const handleCoveringChange = async (absenceId: string, coveringId: string) => {
    setSaving(true)
    await supabase
      .from('absences')
      .update({ covering_id: coveringId || null })
      .eq('id', absenceId)
    await loadData()
    setSaving(false)
  }

  const handleResetPin = async (milkmanId: string, newPin: string) => {
    if (!/^\d{4}$/.test(newPin)) return
    setPinReset((prev) => ({ ...prev, saving: true }))
    const milkman = milkmen.find((m) => m.id === milkmanId)
    await supabase.from('milkmen').update({ pin: newPin }).eq('id', milkmanId)
    setPinReset({ milkmanId: null, newPin: '', saving: false, success: `PIN updated for ${milkman?.name || 'milkman'}` })
    await loadData()
    setTimeout(() => setPinReset((prev) => ({ ...prev, success: null })), 3000)
  }

  const handleLogout = () => {
    logout()
    router.push('/')
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
          margin: '0 0 28px',
          letterSpacing: '-0.02em',
        }}>
          Settings
        </h1>

        {/* Supplier Email */}
        <label style={{
          display: 'block',
          fontSize: 16,
          fontWeight: 800,
          color: '#64748B',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 10,
        }}>
          Supplier Email
        </label>
        <input
          value={supplierEmail}
          onChange={(e) => setSupplierEmail(e.target.value)}
          onBlur={handleEmailBlur}
          placeholder="supplier@example.com"
          style={{
            width: '100%',
            padding: 16,
            fontSize: 16,
            borderRadius: 12,
            border: '2px solid #E2E8F0',
            fontWeight: 600,
            boxSizing: 'border-box',
            marginBottom: 32,
          }}
        />

        {/* Quick Links */}
        <div style={{
          marginBottom: 32,
          paddingBottom: 24,
          borderBottom: '2px solid #E2E8F0',
        }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 800,
            color: '#1E293B',
            margin: '0 0 14px',
          }}>
            Quick Links
          </h2>
          <Btn onClick={() => router.push('/admin/targets')} outline color="#2563EB">
            <Calculator size={20} /> Stock Targets
          </Btn>
          <div style={{ height: 10 }} />
          <Btn onClick={() => router.push('/admin/products')} outline color="#2563EB">
            <Package size={20} /> Manage Products
          </Btn>
        </div>

        {/* Manage Milkmen */}
        <h2 style={{
          fontSize: 20,
          fontWeight: 800,
          color: '#1E293B',
          margin: '0 0 14px',
        }}>
          Manage Milkmen
        </h2>

        {milkmen.map((m) => (
          <div
            key={m.id}
            style={{
              background: '#F8FAFC',
              padding: '14px 16px',
              borderRadius: 10,
              border: '2px solid #E2E8F0',
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1E293B' }}>
                {m.name}
              </div>
              <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                PIN: {m.pin}
              </div>
            </div>
            <button
              onClick={() => handleRemoveMilkman(m)}
              disabled={saving}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '2px solid #FCA5A5',
                background: '#FEE2E2',
                color: '#DC2626',
                fontWeight: 800,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Trash2 size={14} /> Remove
            </button>
          </div>
        ))}

        {/* Add Milkman */}
        {showAddForm ? (
          <div style={{
            background: '#F8FAFC',
            padding: 14,
            borderRadius: 10,
            border: '2px solid #E2E8F0',
            marginTop: 8,
          }}>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name"
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 6,
                border: '1px solid #CBD5E1',
                fontSize: 14,
                marginBottom: 10,
                boxSizing: 'border-box',
              }}
            />
            <input
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="PIN (4 digits)"
              maxLength={4}
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 6,
                border: '1px solid #CBD5E1',
                fontSize: 14,
                marginBottom: 10,
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleAddMilkman}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 8,
                  border: 'none',
                  background: '#16A34A',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Check size={16} /> Add
              </button>
              <button
                onClick={() => { setShowAddForm(false); setNewName(''); setNewPin('') }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 8,
                  border: 'none',
                  background: '#E2E8F0',
                  color: '#64748B',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <X size={16} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              width: '100%',
              border: '2px dashed #93C5FD',
              background: '#EFF6FF',
              color: '#2563EB',
              fontWeight: 800,
              fontSize: 14,
              borderRadius: 10,
              padding: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 8,
            }}
          >
            <Plus size={18} /> Add Milkman
          </button>
        )}

        {/* PIN Management */}
        <h2 style={{
          fontSize: 20,
          fontWeight: 800,
          color: '#1E293B',
          marginTop: 32,
          marginBottom: 14,
        }}>
          Reset PINs
        </h2>

        {pinReset.success && (
          <div style={{
            background: '#DCFCE7',
            border: '2px solid #86EFAC',
            borderRadius: 10,
            padding: 12,
            marginBottom: 12,
            fontSize: 14,
            fontWeight: 700,
            color: '#166534',
            textAlign: 'center',
          }}>
            {pinReset.success}
          </div>
        )}

        {milkmen.map((m) => (
          <div
            key={`pin-${m.id}`}
            style={{
              background: '#F8FAFC',
              padding: '14px 16px',
              borderRadius: 10,
              border: '2px solid #E2E8F0',
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>
              {m.name}
            </span>

            {pinReset.milkmanId === m.id ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  value={pinReset.newPin}
                  onChange={(e) => setPinReset((prev) => ({ ...prev, newPin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                  placeholder="4 digits"
                  maxLength={4}
                  inputMode="numeric"
                  style={{
                    width: 80,
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    fontSize: 14,
                    fontWeight: 600,
                    textAlign: 'center',
                  }}
                />
                <button
                  onClick={() => handleResetPin(m.id, pinReset.newPin)}
                  disabled={pinReset.newPin.length !== 4 || pinReset.saving}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: pinReset.newPin.length === 4 ? '#16A34A' : '#D1D5DB',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: pinReset.newPin.length === 4 ? 'pointer' : 'default',
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => setPinReset({ milkmanId: null, newPin: '', saving: false, success: null })}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#E2E8F0',
                    color: '#64748B',
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setPinReset({ milkmanId: m.id, newPin: '', saving: false, success: null })}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: '2px solid #93C5FD',
                  background: '#EFF6FF',
                  color: '#2563EB',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Reset PIN
              </button>
            )}
          </div>
        ))}

        {/* Absence Management */}
        <h2 style={{
          fontSize: 20,
          fontWeight: 800,
          color: '#1E293B',
          marginTop: 32,
          marginBottom: 14,
        }}>
          Today&apos;s Absences
        </h2>

        {milkmen.map((m) => {
          const absence = absences.find((a) => a.milkman_id === m.id)
          const otherMilkmen = milkmen.filter((o) => o.id !== m.id)

          return (
            <div
              key={m.id}
              style={{
                background: '#F8FAFC',
                padding: '14px 16px',
                borderRadius: 10,
                border: '2px solid #E2E8F0',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>
                {m.name}
              </span>

              {absence ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>
                    Covered by:
                  </label>
                  <select
                    value={absence.covering_id || ''}
                    onChange={(e) => handleCoveringChange(absence.id, e.target.value)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    <option value="">John</option>
                    {otherMilkmen.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleClearAbsence(absence.id)}
                    disabled={saving}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: '2px solid #E2E8F0',
                      background: '#fff',
                      color: '#64748B',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleMarkAbsent(m.id)}
                  disabled={saving}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: '2px solid #FCD34D',
                    background: '#FEF3C7',
                    color: '#92400E',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Mark Off
                </button>
              )}
            </div>
          )
        })}

        {/* Version footer */}
        <p style={{
          fontSize: 13,
          color: '#9CA3AF',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          textAlign: 'center',
          margin: '32px 0',
        }}>
          v1.0.0 — Merseyside Dairies Clipboard
        </p>

        {/* Log Out */}
        <Btn onClick={handleLogout} color="#DC2626">
          <LogOut size={20} /> Log Out
        </Btn>
      </div>

      <BottomNav active="settings" onNav={handleNav} />
    </Phone>
  )
}
