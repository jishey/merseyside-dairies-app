// History shape: { [milkmanId]: { [dateStr]: { [productId]: { out: number } } } }
type ProductData = { out: number }
type DayData = Record<string, ProductData>
type MilkmanHistory = Record<string, DayData>
export type HistoryMap = Record<string, MilkmanHistory>

// Returns { avg, weeks } where weeks = number of same-day-of-week data points
export function getAverageData(
  history: HistoryMap,
  milkmanId: string,
  productId: string,
  today: Date
): { avg: number; weeks: number } {
  const h = history[milkmanId]
  if (!h) return { avg: 0, weeks: 0 }

  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const dow = days[today.getDay()]

  const sameDayEntries = Object.entries(h)
    .filter(([ds]) => {
      const d = new Date(ds + 'T00:00:00')
      return days[d.getDay()] === dow
    })
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 4)

  const vals = sameDayEntries.map(([, prods]) => prods[productId]?.out || 0)
  if (vals.length === 0) return { avg: 0, weeks: 0 }

  const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
  return { avg, weeks: vals.length }
}

// Check if a value is an anomaly
export function isAnomaly(
  currentValue: number,
  average: number,
  weeks: number,
  hasStarted: boolean
): boolean {
  // Need at least 4 weeks of data
  if (weeks < 4) return false
  // Don't flag if average is 0
  if (average === 0) return false
  // Taking 0 is anomaly only if milkman has started
  if (currentValue === 0) return hasStarted
  // >25% difference from average is anomaly
  return Math.abs(currentValue - average) / average > 0.25
}
