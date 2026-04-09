'use client'

export interface PageProps {
  children: React.ReactNode
  cream?: boolean
  padBottom?: number
}

export default function Page({ children, cream = false, padBottom = 24 }: PageProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        padding: `24px 20px ${padBottom}px`,
        background: cream ? '#FDF6E3' : '#fff',
      }}
      className="screen-fade"
    >
      {children}
    </div>
  )
}
