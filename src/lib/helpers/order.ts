import { Product } from '@/types'

// Calculate suggested order amount
export function calculateSuggested(
  tomorrowTarget: number,
  inFridge: number,
  returned: number
): number {
  const onHand = inFridge + returned
  return Math.max(0, tomorrowTarget - onHand)
}

// Generate order email body
export function generateOrderEmail(
  products: Product[],
  quantities: Record<string, number>,
  supplierEmail: string
): string {
  const items = products
    .map(p => `- ${p.name} (${p.size}): ${quantities[p.id] || 0}`)
    .join('\n')

  return `Hi,

Please find our order for delivery tomorrow morning:

${items}

Thanks,
John
Merseyside Dairies`
}
