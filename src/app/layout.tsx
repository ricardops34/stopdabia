import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'STOP - ADEDONHA',
  description: 'O STOP mais divertido do Brasil',
  manifest: '/favico.png',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
