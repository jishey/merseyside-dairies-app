'use client'

import { useState, useEffect, use, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import ClipboardScreen from '@/components/milkman/ClipboardScreen'
import { createClient } from '@/lib/supabase/client'
import { dateStr } from '@/lib/helpers/date'
import { clampBroughtBack } from '@/lib/helpers/clipboard'
import { isAnomaly } from '@/lib/helpers/anomaly'
import type { AnomalyInfo } from '@/components/milkman/ClipboardScreen'

interface ProductData {
  out: number
  back: number
  waste: number
}

interface HistoryEntry {
  product_id: string
  out: number
  date: string
}

export default function ClipboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: milkmanId } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const today = dateStr(new Date())

  const [milkman, setMilkman] = useState<{ id: string; name: string } | null>(null)
  const [products, setProducts] = useState<Array<{ id: string; name: string; size: string; color: string }>>([])
  const [data, setData] = useState<Record<string, ProductData>>({})
  const [morningOut, setMorningOut] = useState<Record<string, number>>({})
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [afternoonMode, setAfternoonMode] = useState(false)

  const todayDate = useMemo(() => new Date(), [])
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const todayDayName = dayNames[todayDate.getDay()]

  useEffect(() => {
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    // Load milkman
    const { data: milkmanData } = await supabase
      .from('milkmen')
      .select('id, name')
      .eq('id', milkmanId)
      .single()

    if (milkmanData) setMilkman(milkmanData)

    // Load active products
    const { data: productsData } = await supabase
      .from('products')
      .select('id, name, size, color')
      .eq('active', true)
      .order('sort_order')

    if (productsData) setProducts(productsData)

    // Load existing clipboard entries for today (including morning_out)
    const { data: entries } = await supabase
      .from('clipboard_entries')
      .select('product_id, out, back, waste, morning_out')
      .eq('milkman_id', milkmanId)
      .eq('date', today)

    if (entries && entries.length > 0) {
      const entryMap: Record<string, ProductData> = {}
      const morningMap: Record<string, number> = {}
      for (const e of entries) {
        entryMap[e.product_id] = {
          out: e.out,
          back: e.back,
          waste: e.waste,
        }
        if (e.morning_out !== null && e.morning_out !== undefined) {
          morningMap[e.product_id] = e.morning_out
        }
      }
      setData(entryMap)
      setMorningOut(morningMap)
    }

    // Check clipboard_status to auto-detect afternoon mode
    const { data: statusData } = await supabase
      .from('clipboard_status')
      .select('headed_out')
      .eq('milkman_id', milkmanId)
      .eq('date', today)
      .maybeSingle()

    if (statusData?.headed_out) {
      // Check if morning_out values exist
      const hasMorningOut = entries?.some((e) => e.morning_out !== null && e.morning_out !== undefined)
      if (hasMorningOut) {
        setAfternoonMode(true)
      }
    }

    // Load historical entries for anomaly detection (last 28 days)
    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
    const { data: historyData } = await supabase
      .from('clipboard_entries')
      .select('product_id, out, date')
      .eq('milkman_id', milkmanId)
      .gte('date', dateStr(fourWeeksAgo))
      .lt('date', today)

    if (historyData) setHistory(historyData)
  }

  // Compute anomaly info for each product
  const anomalies: Record<string, AnomalyInfo> = useMemo(() => {
    const result: Record<string, AnomalyInfo> = {}
    const hasStarted = products.some((p) => (data[p.id]?.out || 0) > 0)
    const todayDow = todayDate.getDay()

    for (const product of products) {
      const sameDayEntries = history
        .filter((h) => {
          if (h.product_id !== product.id) return false
          const d = new Date(h.date + 'T00:00:00')
          return d.getDay() === todayDow
        })
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 4)

      const weeks = sameDayEntries.length
      const avg = weeks > 0
        ? Math.round(sameDayEntries.reduce((sum, e) => sum + e.out, 0) / weeks)
        : 0

      const currentOut = data[product.id]?.out || 0
      const flagged = isAnomaly(currentOut, avg, weeks, hasStarted)

      result[product.id] = {
        avg,
        weeks,
        isAnomaly: flagged,
        dayName: todayDayName,
      }
    }

    return result
  }, [products, data, history, todayDate, todayDayName])

  const handleModeChange = async (afternoon: boolean) => {
    if (afternoon && Object.keys(morningOut).length === 0) {
      // First switch to afternoon -- save morning snapshot
      const morningMap: Record<string, number> = {}
      const upserts = products
        .filter((p) => (data[p.id]?.out || 0) > 0)
        .map((p) => {
          morningMap[p.id] = data[p.id].out
          return {
            milkman_id: milkmanId,
            product_id: p.id,
            date: today,
            out: data[p.id].out,
            back: data[p.id].back,
            waste: data[p.id].waste,
            morning_out: data[p.id].out,
            updated_at: new Date().toISOString(),
          }
        })

      if (upserts.length > 0) {
        await supabase
          .from('clipboard_entries')
          .upsert(upserts, { onConflict: 'milkman_id,product_id,date' })
      }

      setMorningOut(morningMap)
    }

    setAfternoonMode(afternoon)
  }

  const handleDataChange = async (productId: string, field: string, value: number) => {
    setData((prev) => {
      const current = prev[productId] || { out: 0, back: 0, waste: 0 }
      const updated = { ...current, [field]: value }

      // Clamp brought-back when taking-out decreases
      if (field === 'out') {
        updated.back = clampBroughtBack(updated.back, value)
        // Also clamp waste
        const maxWaste = updated.out - updated.back
        if (updated.waste > maxWaste) {
          updated.waste = Math.max(0, maxWaste)
        }
      }

      // Clamp waste to out - back
      if (field === 'back') {
        const maxWaste = updated.out - updated.back
        if (updated.waste > maxWaste) {
          updated.waste = Math.max(0, maxWaste)
        }
      }

      return { ...prev, [productId]: updated }
    })

    // Save to Supabase
    const current = data[productId] || { out: 0, back: 0, waste: 0 }
    const updated = { ...current, [field]: value }
    if (field === 'out') {
      updated.back = clampBroughtBack(updated.back, value)
      const maxWaste = updated.out - updated.back
      if (updated.waste > maxWaste) updated.waste = Math.max(0, maxWaste)
    }
    if (field === 'back') {
      const maxWaste = updated.out - updated.back
      if (updated.waste > maxWaste) updated.waste = Math.max(0, maxWaste)
    }

    await supabase
      .from('clipboard_entries')
      .upsert({
        milkman_id: milkmanId,
        product_id: productId,
        date: today,
        out: updated.out,
        back: updated.back,
        waste: updated.waste,
        morning_out: morningOut[productId] ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'milkman_id,product_id,date' })
  }

  const saveMorningSnapshot = async () => {
    const upserts = products
      .filter((p) => (data[p.id]?.out || 0) > 0)
      .map((p) => ({
        milkman_id: milkmanId,
        product_id: p.id,
        date: today,
        out: data[p.id].out,
        back: data[p.id].back,
        waste: data[p.id].waste,
        morning_out: data[p.id].out,
        updated_at: new Date().toISOString(),
      }))

    if (upserts.length > 0) {
      await supabase
        .from('clipboard_entries')
        .upsert(upserts, { onConflict: 'milkman_id,product_id,date' })
    }

    await supabase
      .from('clipboard_status')
      .upsert({
        milkman_id: milkmanId,
        date: today,
        headed_out: true,
        headed_out_at: new Date().toISOString(),
      }, { onConflict: 'milkman_id,date' })
  }

  const handleHeadOut = async (unconfirmedAnomalyIds: string[]) => {
    if (unconfirmedAnomalyIds.length > 0) {
      const anomalyData = unconfirmedAnomalyIds.map((pid) => ({
        productId: pid,
        avg: anomalies[pid].avg,
        value: data[pid]?.out || 0,
      }))

      sessionStorage.setItem(`anomalies-${milkmanId}`, JSON.stringify(anomalyData))
      router.push(`/confirm-anomalies/${milkmanId}`)
      return
    }

    await saveMorningSnapshot()
    router.push(`/headed-out/${milkmanId}`)
  }

  const handleSubmit = () => {
    router.push(`/summary/${milkmanId}`)
  }

  const handleLogout = () => {
    router.push('/')
  }

  const handleFlip = () => {
    router.push(`/history/${milkmanId}`)
  }

  if (!milkman || products.length === 0) {
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
    <ClipboardScreen
      milkman={milkman}
      products={products}
      data={data}
      morningOut={morningOut}
      anomalies={anomalies}
      afternoonMode={afternoonMode}
      onModeChange={handleModeChange}
      onDataChange={handleDataChange}
      onHeadOut={handleHeadOut}
      onSubmit={handleSubmit}
      onLogout={handleLogout}
      onFlip={handleFlip}
    />
  )
}
