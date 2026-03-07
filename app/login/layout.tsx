import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import '@/app/(app)/globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: 'Painel - Sistema de Presença',
  description: 'Sistema de controle de presenca para a Casa Espirita Anália Franco',
  icons: {
    icon: '/images/analia.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1e4d6b',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}