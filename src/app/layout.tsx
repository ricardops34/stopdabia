import type { Metadata, Viewport } from 'next'
import './globals.css'
import SplashScreen from '@/components/SplashScreen'
import MusicAutoStart from '@/components/MusicAutoStart'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a1628',
}

export const metadata: Metadata = {
  title: 'STOP Adedonha',
  description: 'O jogo de STOP mais divertido do Brasil!',
  manifest: '/manifest.json',
  icons: {
    icon: '/favico.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" style={{ height: '100%' }}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="STOP" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="apple-touch-startup-image" href="/logo.png" />
      </head>
      <body style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#0a1628' }}>
        <MusicAutoStart />
        <SplashScreen>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 440, width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
            {children}
          </div>
        </SplashScreen>
      </body>
    </html>
  )
}
