import { DashboardLayout } from "@/components/dashboard-layout"
import { DesafioClinicoEstudoContent } from "@/components/desafio-clinico-estudo-content"

export const metadata = {
  title: "Desafio Clínico | MedClass",
  description: "Estude um caso clínico completo com perguntas guiadas",
}

export default async function DesafioClinicoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <DashboardLayout>
      <DesafioClinicoEstudoContent desafioId={id} />
    </DashboardLayout>
  )
}
