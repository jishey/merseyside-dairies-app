'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Phone from '@/components/shared/Phone'
import StatusBadge from '@/components/shared/StatusBadge'
import BottomNav from '@/components/shared/BottomNav'
import { useAdmin } from '@/lib/auth/admin-context'
import { createClient } from '@/lib/supabase/client'
import { dateStr } from '@/lib/helpers/date'
import { milkmanStatus } from '@/lib/helpers/clipboard'
import { calculateSold } from '@/lib/helpers/clipboard'
import { clampBroughtBack } from '@/lib/helpers/clipboard'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface MilkmanInfo {
  id: string
  name: string
}

interface ProductInfo {
  id: string
  name: string
  size: string
  color: string
}

interface EntryInfo {
  milkman_id: string
  product_id: string
  out: number
  back: number
  waste: number
  morning_out: number | null
}

interface StatusInfo {
  milkman_id: string
  headed_out: boolean
  submitted: boolean
}

interface DraftEntry {
  out: number
  back: number
  waste: number
}

export default function ClipboardsPage() {
  const router = useRouter()
  const { isAdmin, loading: authLoading } = useAdmin()
  const supabase = createClient()
  const today = dateStr(new Date())

  const [milkmen, setMilkmen] = useState<MilkmanInfo[]>([])
  const [products, setProducts] = useState<ProductInfo[]>([])
  const [entries, setEntries] = useState<EntryInfo[]>([])
  const [statuses, setStatuses] = useState<StatusInfo[]>([])
  const [absentIds, setAbsentIds] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<string | null>(null)
  const [draftEntries, setDraftEntries] = useState<Record<string, DraftEntry>>({})
  const [savingMilkmanId, setSavingMilkmanId] = useState<string | null>(null)
  const [savingAll, setSavingAll] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(today)
  const [dayClosed, setDayClosed] = useState(false)
  const [dayStatusBusy, setDayStatusBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/admin')
  }, [isAdmin, authLoading, router])

  useEffect(() => {
    if (isAdmin) loadData(selectedDate)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, selectedDate])

  const loadData = async (forDate: string) => {
    setLoading(true)
    const { data: milkmenData } = await supabase
      .from('milkmen')
      .select('id, name')
      .eq('active', true)
      .order('sort_order')

    if (milkmenData) setMilkmen(milkmenData)

    const { data: productsData } = await supabase
      .from('products')
      .select('id, name, size, color')
      .eq('active', true)
      .order('sort_order')

    if (productsData) setProducts(productsData)

    const { data: entriesData } = await supabase
      .from('clipboard_entries')
      .select('milkman_id, product_id, out, back, waste, morning_out')
      .eq('date', forDate)

    if (entriesData) setEntries(entriesData)

    const { data: statusData } = await supabase
      .from('clipboard_status')
      .select('milkman_id, headed_out, submitted')
      .eq('date', forDate)

    if (statusData) setStatuses(statusData)

    const { data: absenceData } = await supabase
      .from('absences')
      .select('milkman_id')
      .eq('date', forDate)

    if (absenceData) {
      setAbsentIds(new Set(absenceData.map((a) => a.milkman_id)))
    }

    const { data: dayData } = await supabase
      .from('day_status')
      .select('closed')
      .eq('date', forDate)
      .maybeSingle()

    setDayClosed(!!dayData?.closed)

    setLoading(false)
  }

  const workingMilkmen = useMemo(
    () => milkmen.filter((m) => !absentIds.has(m.id)),
    [milkmen, absentIds]
  )

  // Daily totals
  const dailyTotals = useMemo(() => {
    const totals: Record<string, { out: number; back: number; waste: number; sold: number }> = {}
    for (const p of products) {
      totals[p.id] = { out: 0, back: 0, waste: 0, sold: 0 }
    }

    for (const entry of entries) {
      if (absentIds.has(entry.milkman_id)) continue
      if (!totals[entry.product_id]) continue
      totals[entry.product_id].out += entry.out
      totals[entry.product_id].back += entry.back
      totals[entry.product_id].waste += entry.waste
      totals[entry.product_id].sold += calculateSold(entry.out, entry.back, entry.waste)
    }

    return totals
  }, [products, entries, absentIds])

  const handleNav = (id: string) => {
    router.push(`/admin/${id}`)
  }

  const entryKey = (milkmanId: string, productId: string) => `${milkmanId}:${productId}`

  const getExistingEntry = (milkmanId: string, productId: string) =>
    entries.find((e) => e.milkman_id === milkmanId && e.product_id === productId)

  const normalizeEntry = (out: number, backRaw: number, wasteRaw: number): DraftEntry => {
    const back = clampBroughtBack(backRaw, out)
    const waste = Math.min(Math.max(0, wasteRaw), Math.max(0, out - back))
    return { out, back, waste }
  }

  const getEffectiveEntry = (milkmanId: string, productId: string): DraftEntry => {
    const key = entryKey(milkmanId, productId)
    const existing = getExistingEntry(milkmanId, productId)
    const draft = draftEntries[key]
    return normalizeEntry(
      draft?.out ?? existing?.out ?? 0,
      draft?.back ?? existing?.back ?? 0,
      draft?.waste ?? existing?.waste ?? 0
    )
  }

  const hasUnsavedChangesForMilkman = (milkmanId: string) => {
    for (const product of products) {
      const key = entryKey(milkmanId, product.id)
      if (!draftEntries[key]) continue
      const existing = getExistingEntry(milkmanId, product.id)
      const current = normalizeEntry(existing?.out ?? 0, existing?.back ?? 0, existing?.waste ?? 0)
      const effective = getEffectiveEntry(milkmanId, product.id)
      if (
        effective.out !== current.out ||
        effective.back !== current.back ||
        effective.waste !== current.waste
      ) {
        return true
      }
    }
    return false
  }

  const hasAnyUnsavedChanges = useMemo(
    () => workingMilkmen.some((m) => hasUnsavedChangesForMilkman(m.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workingMilkmen, draftEntries, entries, products]
  )

  const updateDraftValue = (
    milkmanId: string,
    productId: string,
    field: keyof DraftEntry,
    nextValue: number
  ) => {
    const key = entryKey(milkmanId, productId)
    const existing = getExistingEntry(milkmanId, productId)
    const base = draftEntries[key] || {
      out: existing?.out || 0,
      back: existing?.back || 0,
      waste: existing?.waste || 0,
    }
    const updated = { ...base, [field]: nextValue }

    if (field === 'out') {
      updated.back = clampBroughtBack(updated.back, updated.out)
      const maxWaste = updated.out - updated.back
      if (updated.waste > maxWaste) updated.waste = Math.max(0, maxWaste)
    }

    if (field === 'back') {
      updated.back = clampBroughtBack(updated.back, updated.out)
      const maxWaste = updated.out - updated.back
      if (updated.waste > maxWaste) updated.waste = Math.max(0, maxWaste)
    }

    if (field === 'waste') {
      const maxWaste = Math.max(0, updated.out - updated.back)
      if (updated.waste > maxWaste) updated.waste = maxWaste
    }

    const current = normalizeEntry(existing?.out ?? 0, existing?.back ?? 0, existing?.waste ?? 0)
    const normalizedUpdated = normalizeEntry(updated.out, updated.back, updated.waste)
    setDraftEntries((prev) => {
      const next = { ...prev }
      if (
        normalizedUpdated.out === current.out &&
        normalizedUpdated.back === current.back &&
        normalizedUpdated.waste === current.waste
      ) {
        delete next[key]
      } else {
        next[key] = normalizedUpdated
      }
      return next
    })
  }

  const buildUpsertsForMilkman = (milkmanId: string) =>
    products
      .map((product) => {
        const existing = getExistingEntry(milkmanId, product.id)
        const effective = getEffectiveEntry(milkmanId, product.id)
        const shouldPersist = !!existing || effective.out > 0 || effective.back > 0 || effective.waste > 0
        if (!shouldPersist) return null
        return {
          milkman_id: milkmanId,
          product_id: product.id,
          date: selectedDate,
          out: effective.out,
          back: effective.back,
          waste: effective.waste,
          morning_out: existing?.morning_out ?? null,
          updated_at: new Date().toISOString(),
        }
      })
      .filter((row): row is NonNullable<typeof row> => row !== null)

  const clearDraftsForMilkman = (milkmanId: string) => {
    setDraftEntries((prev) => {
      const next = { ...prev }
      for (const key of Object.keys(next)) {
        if (key.startsWith(`${milkmanId}:`)) delete next[key]
      }
      return next
    })
  }

  const handleSaveMilkman = async (milkmanId: string) => {
    setSavingMilkmanId(milkmanId)
    setSaveMessage(null)
    setSaveError(null)
    try {
      const upserts = buildUpsertsForMilkman(milkmanId)
      if (upserts.length > 0) {
        const { error } = await supabase
          .from('clipboard_entries')
          .upsert(upserts, { onConflict: 'milkman_id,product_id,date' })
        if (error) throw error
      }

      const hasReturnedFigures = upserts.some((row) => row.back > 0 || row.waste > 0)
      if (hasReturnedFigures) {
        const { error: statusError } = await supabase
          .from('clipboard_status')
          .upsert({
            milkman_id: milkmanId,
            date: selectedDate,
            headed_out: true,
            submitted: true,
            submitted_at: new Date().toISOString(),
          }, { onConflict: 'milkman_id,date' })
        if (statusError) throw statusError
      }

      setEntries((prev) => {
        const withoutMilkman = prev.filter((e) => e.milkman_id !== milkmanId)
        return [...withoutMilkman, ...upserts]
      })
      clearDraftsForMilkman(milkmanId)
      await loadData(selectedDate)
      setSaveMessage('Changes saved')
      const now = new Date()
      setLastSavedAt(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`)
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Unknown error'
      setSaveError(`Could not save changes: ${detail}`)
    } finally {
      setSavingMilkmanId(null)
    }
  }

  const handleSaveAll = async () => {
    setSavingAll(true)
    setSaveMessage(null)
    setSaveError(null)
    try {
      const toSave = workingMilkmen.filter((m) => hasUnsavedChangesForMilkman(m.id))
      for (const milkman of toSave) {
        const upserts = buildUpsertsForMilkman(milkman.id)
        if (upserts.length > 0) {
          const { error } = await supabase
            .from('clipboard_entries')
            .upsert(upserts, { onConflict: 'milkman_id,product_id,date' })
          if (error) throw error
        }
        const hasReturnedFigures = upserts.some((row) => row.back > 0 || row.waste > 0)
        if (hasReturnedFigures) {
          const { error: statusError } = await supabase
            .from('clipboard_status')
            .upsert({
              milkman_id: milkman.id,
              date: selectedDate,
              headed_out: true,
              submitted: true,
              submitted_at: new Date().toISOString(),
            }, { onConflict: 'milkman_id,date' })
          if (statusError) throw statusError
        }
        setEntries((prev) => {
          const withoutMilkman = prev.filter((e) => e.milkman_id !== milkman.id)
          return [...withoutMilkman, ...upserts]
        })
        clearDraftsForMilkman(milkman.id)
      }
      await loadData(selectedDate)
      setSaveMessage(toSave.length > 0 ? `Saved changes for ${toSave.length} rounds` : 'No unsaved changes')
      if (toSave.length > 0) {
        const now = new Date()
        setLastSavedAt(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`)
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Unknown error'
      setSaveError(`Save all failed: ${detail}`)
    } finally {
      setSavingAll(false)
    }
  }

  const handleReopenDay = async () => {
    setDayStatusBusy(true)
    setSaveError(null)
    setSaveMessage(null)
    const { error } = await supabase
      .from('day_status')
      .upsert({
        date: selectedDate,
        closed: false,
        closed_at: null,
      }, { onConflict: 'date' })
    if (error) {
      setSaveError(`Could not reopen day: ${error.message}`)
      setDayStatusBusy(false)
      return
    }
    setDayClosed(false)
    setSaveMessage(`Day reopened for ${selectedDate}`)
    setDayStatusBusy(false)
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
          margin: '0 0 12px',
          letterSpacing: '-0.02em',
        }}>
          Clipboards
        </h1>
        <div style={{ marginBottom: 12 }}>
          <label
            htmlFor="clipboard-date"
            style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 4 }}
          >
            Edit date
          </label>
          <input
            id="clipboard-date"
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSaveMessage(null)
              setSaveError(null)
              setDraftEntries({})
              setExpanded(null)
              setSelectedDate(e.target.value)
            }}
            style={{
              border: '1px solid #CBD5E1',
              borderRadius: 8,
              padding: '8px 10px',
              fontSize: 14,
              fontWeight: 700,
              color: '#1E293B',
              background: '#fff',
            }}
          />
        </div>
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
          {dayClosed ? (
            <button
              onClick={handleReopenDay}
              disabled={dayStatusBusy}
              style={{
                border: 'none',
                borderRadius: 8,
                background: '#16A34A',
                color: '#fff',
                fontWeight: 800,
                fontSize: 13,
                padding: '8px 12px',
                cursor: dayStatusBusy ? 'default' : 'pointer',
                opacity: dayStatusBusy ? 0.6 : 1,
              }}
            >
              {dayStatusBusy ? 'Reopening...' : 'Reopen Day'}
            </button>
          ) : (
            <span style={{ fontSize: 12, fontWeight: 700, color: '#16A34A' }}>
              Day is open
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: hasAnyUnsavedChanges ? '#B45309' : '#64748B' }}>
              {hasAnyUnsavedChanges ? 'You have unsaved round edits' : 'All round changes saved'}
            </span>
            {lastSavedAt && (
              <p style={{ fontSize: 12, fontWeight: 600, color: '#64748B', margin: '2px 0 0' }}>
                Last saved at {lastSavedAt}
              </p>
            )}
          </div>
          <button
            onClick={handleSaveAll}
            disabled={!hasAnyUnsavedChanges || savingAll || !!savingMilkmanId}
            style={{
              border: 'none',
              borderRadius: 8,
              background: '#0F766E',
              color: '#fff',
              fontWeight: 800,
              fontSize: 13,
              padding: '8px 12px',
              cursor: !hasAnyUnsavedChanges || savingAll || !!savingMilkmanId ? 'default' : 'pointer',
              opacity: !hasAnyUnsavedChanges || savingAll || !!savingMilkmanId ? 0.6 : 1,
            }}
          >
            {savingAll ? 'Saving all...' : 'Save all changes'}
          </button>
        </div>

        {/* Accordion list */}
        {workingMilkmen.map((m) => {
          const status = statuses.find((s) => s.milkman_id === m.id)
          const milkmanEntries = entries.filter((e) => e.milkman_id === m.id)
          const hasData = milkmanEntries.some((e) => e.out > 0)
          const isExpanded = expanded === m.id
          const hasUnsaved = hasUnsavedChangesForMilkman(m.id)

          const displayStatus = milkmanStatus(
            status?.submitted || false,
            false, // anomaly detection would need history data
            hasData
          )

          return (
            <div
              key={m.id}
              style={{
                background: '#fff',
                borderRadius: 12,
                overflow: 'hidden',
                border: '2px solid #E2E8F0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                marginBottom: 12,
              }}
            >
              {/* Header */}
              <button
                onClick={() => setExpanded(isExpanded ? null : m.id)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#1E3A5F' }}>
                    {m.name}
                  </span>
                  {hasUnsaved && (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#92400E',
                      background: '#FEF3C7',
                      border: '1px solid #FCD34D',
                      borderRadius: 999,
                      padding: '2px 8px',
                    }}>
                      UNSAVED
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp size={20} color="#94A3B8" />
                  ) : (
                    <ChevronDown size={20} color="#94A3B8" />
                  )}
                </div>
                <StatusBadge status={displayStatus} />
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div style={{ background: '#F8FAFC', padding: '0 20px 16px' }}>
                  {products.map((product, idx) => {
                    const entry = milkmanEntries.find((e) => e.product_id === product.id)
                    const key = entryKey(m.id, product.id)
                    const draft = draftEntries[key]
                    const out = draft?.out ?? entry?.out ?? 0
                    const back = draft?.back ?? entry?.back ?? 0
                    const waste = draft?.waste ?? entry?.waste ?? 0
                    const sold = calculateSold(out, back, waste)
                    const morningValue = entry?.morning_out
                    const isEdited = morningValue !== null && morningValue !== undefined && out !== morningValue

                    return (
                      <div
                        key={product.id}
                        style={{
                          padding: '12px 0',
                          borderBottom: idx < products.length - 1 ? '1px solid #E2E8F0' : 'none',
                          background: isEdited ? 'rgba(254, 226, 226, 0.3)' : 'transparent',
                          borderLeft: isEdited ? '3px solid #DC2626' : '3px solid transparent',
                          paddingLeft: 12,
                          marginLeft: -12,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <div style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: product.color,
                          }} />
                          <span style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>
                            {product.name} {product.size}
                          </span>
                          {isEdited && (
                            <span style={{
                              fontSize: 11,
                              fontWeight: 800,
                              color: '#fff',
                              background: '#DC2626',
                              padding: '2px 8px',
                              borderRadius: 4,
                              marginLeft: 4,
                            }}>
                              EDITED
                            </span>
                          )}
                        </div>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 12,
                          fontSize: 15,
                          fontWeight: 700,
                        }}>
                          <span style={{ color: '#57534E' }}>Out: <strong>{out}</strong></span>
                          <span style={{ color: '#57534E' }}>Back: <strong>{back}</strong></span>
                          {waste > 0 && (
                            <span style={{ color: '#F59E0B', fontSize: 13 }}>Leakers: <strong>{waste}</strong></span>
                          )}
                          <span style={{ color: '#16A34A' }}>Sold: <strong>{sold}</strong></span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                              Out
                            </span>
                            <input
                              type="number"
                              min={0}
                              value={out}
                              onChange={(e) => updateDraftValue(m.id, product.id, 'out', Math.max(0, Number(e.target.value) || 0))}
                              style={{
                                width: 72,
                                border: '1px solid #CBD5E1',
                                borderRadius: 8,
                                padding: '6px 8px',
                                fontSize: 14,
                                fontWeight: 700,
                                color: '#1E293B',
                                background: '#fff',
                              }}
                              aria-label={`${m.name} ${product.name} out`}
                            />
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                              Back
                            </span>
                            <input
                              type="number"
                              min={0}
                              value={back}
                              onChange={(e) => updateDraftValue(m.id, product.id, 'back', Math.max(0, Number(e.target.value) || 0))}
                              style={{
                                width: 72,
                                border: '1px solid #CBD5E1',
                                borderRadius: 8,
                                padding: '6px 8px',
                                fontSize: 14,
                                fontWeight: 700,
                                color: '#1E293B',
                                background: '#fff',
                              }}
                              aria-label={`${m.name} ${product.name} back`}
                            />
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                              Waste
                            </span>
                            <input
                              type="number"
                              min={0}
                              value={waste}
                              onChange={(e) => updateDraftValue(m.id, product.id, 'waste', Math.max(0, Number(e.target.value) || 0))}
                              style={{
                                width: 72,
                                border: '1px solid #CBD5E1',
                                borderRadius: 8,
                                padding: '6px 8px',
                                fontSize: 14,
                                fontWeight: 700,
                                color: '#1E293B',
                                background: '#fff',
                              }}
                              aria-label={`${m.name} ${product.name} waste`}
                            />
                          </label>
                        </div>
                        {isEdited && morningValue !== null && (
                          <p style={{
                            fontSize: 13,
                            color: '#DC2626',
                            fontStyle: 'italic',
                            fontWeight: 600,
                            margin: '4px 0 0',
                          }}>
                            Morning value was {morningValue}, changed to {out} after round
                          </p>
                        )}
                      </div>
                    )
                  })}
                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>
                      Edit values then save for {m.name}
                    </span>
                    <button
                      onClick={() => handleSaveMilkman(m.id)}
                      disabled={savingMilkmanId === m.id || savingAll}
                      style={{
                        border: 'none',
                        borderRadius: 8,
                        background: '#2563EB',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: 13,
                        padding: '8px 12px',
                        cursor: savingMilkmanId === m.id || savingAll ? 'default' : 'pointer',
                        opacity: savingMilkmanId === m.id || savingAll ? 0.6 : 1,
                      }}
                    >
                      {savingMilkmanId === m.id ? 'Saving...' : 'Save changes'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {saveMessage && (
          <p style={{ fontSize: 13, color: '#166534', fontWeight: 700, marginTop: 8 }}>
            {saveMessage}
          </p>
        )}
        {saveError && (
          <p style={{ fontSize: 13, color: '#B91C1C', fontWeight: 700, marginTop: 8 }}>
            {saveError}
          </p>
        )}

        {/* Daily Totals */}
        <div style={{
          background: '#1E3A5F',
          borderRadius: 14,
          padding: 18,
          marginTop: 24,
          boxShadow: '0 6px 16px rgba(30, 58, 95, 0.15)',
        }}>
          <h2 style={{
            fontSize: 16,
            fontWeight: 800,
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: '0 0 14px',
          }}>
            Daily Totals
          </h2>

          {products.map((product, idx) => {
            const t = dailyTotals[product.id] || { out: 0, back: 0, waste: 0, sold: 0 }
            return (
              <div
                key={product.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: idx < products.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: product.color,
                  }} />
                  <span style={{ fontSize: 14, color: '#CBD5E1', fontWeight: 600 }}>
                    {product.name} {product.size}
                  </span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                  Out: {t.out} | Back: {t.back} | Waste: {t.waste} | Sold: {t.sold}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <BottomNav active="clipboards" onNav={handleNav} />
    </Phone>
  )
}
