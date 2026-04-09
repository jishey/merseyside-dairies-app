'use client'

export interface StatusBadgeProps {
  status: 'submitted' | 'progress' | 'anomaly' | 'not_started'
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    submitted: { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' },
    progress: { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
    anomaly: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
    not_started: { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1' },
  }

  const labels: Record<string, string> = {
    submitted: 'Submitted',
    progress: 'In Progress',
    anomaly: 'Has Anomalies',
    not_started: 'Not Started',
  }

  const c = colors[status]

  return (
    <span
      style={{
        padding: '6px 14px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 800,
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}
    >
      {labels[status]}
    </span>
  )
}
