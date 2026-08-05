import { DashboardLayout } from "@/components/dashboard-layout"
import { ComingSoonContent } from "@/components/coming-soon-content"

export const metadata = {
  title: "Mesa Oral | MedClass",
  description: "Simulação de banca de exame oral",
}

export default function MesaOralPage() {
  return (
    <DashboardLayout>
      <ComingSoonContent feature="mesaOral" />
    </DashboardLayout>
  )
}
