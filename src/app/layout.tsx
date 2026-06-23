import type { Metadata, Viewport } from 'next'
import './globals.css'
import MuteButton from '@/components/MuteButton'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'STOP - ADEDONHA',
  description: 'O STOP mais divertido do Brasil',
  manifest: '/favico.png',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" style={{ height: '100%' }}>
      <body style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </body>
    </html>
  )
}
