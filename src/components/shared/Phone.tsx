'use client'

export interface PhoneProps {
  children: React.ReactNode
  bg?: string
}

export default function Phone({ children, bg = '#F8FAFC' }: PhoneProps) {
  return (
    <div style={{
      maxWidth: 430,
      margin: '0 auto',
      minHeight: '100vh',
      background: bg,
      position: 'relative',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      borderRadius: 24,
      overflow: 'hidden',
      border: '8px solid #f1f5f9',
    }}>
      {children}
    </div>
  )
}
