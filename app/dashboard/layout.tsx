import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MedClass — Painel do Aluno',
  description:
    'Plataforma de preparação para provas de residência médica. Acompanhe checklists, cronograma, desempenho e materiais de estudo.',
}

export default function DashboardRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
