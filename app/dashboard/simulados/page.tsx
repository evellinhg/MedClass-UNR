import { DashboardLayout } from "@/components/dashboard-layout"
import { SimuladosContent } from "@/components/simulados-content"

export const metadata = {
  title: "Simulados - MedClass",
  description: "Crie e resolva simulados personalizados",
}

export default function SimuladosPage() {
  return (
    <DashboardLayout>
      <SimuladosContent />
    </DashboardLayout>
  )
}
