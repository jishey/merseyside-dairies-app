// dateStr('2026-04-09') format for DB keys
export function dateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

// Friendly format: "Thursday 9th April"
export function formatDate(d: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const nth = (n: number): string => {
    if (n >= 11 && n <= 13) return `${n}th`
    const lastDigit = n % 10
    if (lastDigit === 1) return `${n}st`
    if (lastDigit === 2) return `${n}nd`
    if (lastDigit === 3) return `${n}rd`
    return `${n}th`
  }

  return `${days[d.getDay()]} ${nth(d.getDate())} ${months[d.getMonth()]}`
}

// Time format: "14:30"
export function timeNow(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// Time-based greeting
export function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// Get day of week: 'mon', 'tue', etc
export function getDayOfWeek(d: Date): string {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  return days[d.getDay()]
}

// Get day of week for tomorrow
export function getTomorrowDayOfWeek(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return getDayOfWeek(d)
}
