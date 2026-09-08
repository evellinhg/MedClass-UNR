import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ServiceWorkerRegistration } from '@/components/service-worker-registration'
import { ThemeProvider } from '@/components/theme-provider'
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
  other: {
    google: 'notranslate',
  },
}

export const viewport: Viewport = {
  themeColor: '#f6f9f0',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" translate="no" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <LanguageProvider>{children}</LanguageProvider>
          <ServiceWorkerRegistration />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
