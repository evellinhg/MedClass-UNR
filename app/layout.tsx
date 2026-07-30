import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ServiceWorkerRegistration } from '@/components/service-worker-registration'
import { LanguageProvider } from '@/lib/i18n'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'MedClass UNR',
  description: 'Resúmenes, banco de preguntas y videoclases para aprobar en la UNR.',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo-icon.png',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#12140f',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <LanguageProvider>{children}</LanguageProvider>
        <ServiceWorkerRegistration />
        <Analytics />
      </body>
    </html>
  )
}
