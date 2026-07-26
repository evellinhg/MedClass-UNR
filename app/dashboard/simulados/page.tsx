import { DashboardLayout } from "@/components/dashboard-layout"
import { SimuladosContent } from "@/components/simulados-content"

export const metadata = {
  title: "Treinamentos - MedClass",
  description: "Modo Estudo e Simulados para treinar no seu ritmo ou como na prova real",
}

export default function SimuladosPage() {
  return (
    <DashboardLayout>
      <SimuladosContent />
    </DashboardLayout>
  )
}
