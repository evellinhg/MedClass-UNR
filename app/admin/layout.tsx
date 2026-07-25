import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MedClass — Painel Administrativo',
  description: 'Gerencie usuários, dados e o banco de questões da plataforma.',
}

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
