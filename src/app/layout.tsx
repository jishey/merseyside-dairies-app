import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AdminProvider } from '@/lib/auth/admin-context'
import OfflineDetector from '@/components/shared/OfflineDetector'

export const metadata: Metadata = {
  title: 'Merseyside Dairies Clipboard',
  description: 'Depot clipboard app for milk delivery tracking',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AdminProvider>
          <OfflineDetector>{children}</OfflineDetector>
        </AdminProvider>
      </body>
    </html>
  )
}
