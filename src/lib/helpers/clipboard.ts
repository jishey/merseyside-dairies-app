export type MilkmanStatus = 'submitted' | 'anomaly' | 'progress' | 'not_started'

// Calculate sold quantity
export function calculateSold(out: number, back: number, waste: number): number {
  return out - back - waste
}

// Clamp brought-back to taking-out value
export function clampBroughtBack(currentBack: number, newOut: number): number {
  return Math.min(currentBack, newOut)
}

// Determine milkman's status
export function milkmanStatus(
  submitted: boolean,
  hasUnconfirmedAnomalies: boolean,
  hasData: boolean
): MilkmanStatus {
  if (submitted) return 'submitted'
  if (hasUnconfirmedAnomalies) return 'anomaly'
  if (hasData) return 'progress'
  return 'not_started'
}
