import { DashboardLayout } from "@/components/dashboard-layout"
import { DesafiosClinicosDesempenhoContent } from "@/components/desafios-clinicos-desempenho-content"

export const metadata = {
  title: "Desempenho — Desafios Clínicos | MedClass",
  description: "Estatísticas dos seus estudos de casos clínicos",
}

export default function DesafiosClinicosDesempenhoPage() {
  return (
    <DashboardLayout>
      <DesafiosClinicosDesempenhoContent />
    </DashboardLayout>
  )
}
