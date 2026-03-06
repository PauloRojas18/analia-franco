import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Sidebar } from '@/components/sidebar'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: 'Painel - Sistema de Presenca',
  description: 'Sistema de controle de presenca para a Casa Espirita Analia Franco',
  icons: {
    icon: '/images/analia.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1e4d6b',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Sidebar />
        <main className="min-h-screen lg:ml-[260px] p-8 lg:p-10">
          {children}
        </main>
        <Analytics />
      </body>
    </html>
  )
}
