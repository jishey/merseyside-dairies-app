'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import WelcomeScreen from '@/components/milkman/WelcomeScreen'
import PinEntry from '@/components/milkman/PinEntry'
import SetupWizard from '@/components/milkman/SetupWizard'
import { createClient } from '@/lib/supabase/client'
import { dateStr } from '@/lib/helpers/date'

type Screen = 'welcome' | 'pin' | 'setup'

interface MilkmanData {
  id: string
  name: string
  pin: string
  sort_order: number
}

export default function Home() {
  const router = useRouter()
  const [screen, setScreen] = useState<Screen>('welcome')
  const [milkmen, setMilkmen] = useState<MilkmanData[]>([])
  const [selectedMilkmanId, setSelectedMilkmanId] = useState<string | null>(null)
  const [absences, setAbsences] = useState<Record<string, { coveringId?: string; coveringName?: string }>>({})
  const [dayClosed, setDayClosed] = useState(false)

  const supabase = createClient()
  const today = dateStr(new Date())

  useEffect(() => {
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    // Load milkmen
    const { data: milkmenData } = await supabase
      .from('milkmen')
      .select('id, name, pin, sort_order')
      .eq('active', true)
      .order('sort_order')

    if (milkmenData) setMilkmen(milkmenData)

    // Load absences for today
    const { data: absenceData } = await supabase
      .from('absences')
      .select('milkman_id, covering_id')
      .eq('date', today)

    if (absenceData && absenceData.length > 0 && milkmenData) {
      const absMap: Record<string, { coveringId?: string; coveringName?: string }> = {}
      for (const a of absenceData) {
        const covering = milkmenData.find(m => m.id === a.covering_id)
        absMap[a.milkman_id] = {
          coveringId: a.covering_id ?? undefined,
          coveringName: covering?.name,
        }
      }
      setAbsences(absMap)
    }

    // Load day status
    const { data: dayData } = await supabase
      .from('day_status')
      .select('closed')
      .eq('date', today)
      .maybeSingle()

    if (dayData) setDayClosed(dayData.closed)
  }

  const handleSelectMilkman = (id: string) => {
    setSelectedMilkmanId(id)
    setScreen('pin')
  }

  const handleNewMilkman = () => {
    setScreen('setup')
  }

  const handleAdminLogin = () => {
    router.push('/admin')
  }

  const handlePinCorrect = () => {
    router.push(`/clipboard/${selectedMilkmanId}`)
  }

  const handleSetupComplete = async (name: string, pin: string) => {
    const maxOrder = milkmen.length > 0
      ? Math.max(...milkmen.map(m => m.sort_order))
      : 0

    const { data, error } = await supabase
      .from('milkmen')
      .insert({ name, pin, sort_order: maxOrder + 1 })
      .select('id')
      .single()

    if (error) {
      return
    }

    router.push(`/clipboard/${data.id}`)
  }

  if (screen === 'pin' && selectedMilkmanId) {
    const milkman = milkmen.find((m) => m.id === selectedMilkmanId)
    if (!milkman) return null
    return (
      <PinEntry
        milkman={milkman}
        onBack={() => setScreen('welcome')}
        onCorrect={handlePinCorrect}
      />
    )
  }

  if (screen === 'setup') {
    return (
      <SetupWizard
        onBack={() => setScreen('welcome')}
        onComplete={handleSetupComplete}
      />
    )
  }

  return (
    <WelcomeScreen
      milkmen={milkmen}
      absences={absences}
      dayClosed={dayClosed}
      onSelectMilkman={handleSelectMilkman}
      onNewMilkman={handleNewMilkman}
      onAdminLogin={handleAdminLogin}
    />
  )
}
