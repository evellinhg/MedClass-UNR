import { DashboardLayout } from "@/components/dashboard-layout"
import { ComingSoonContent } from "@/components/coming-soon-content"

export const metadata = {
  title: "Hospital Simulação | MedClass",
  description: "Casos clínicos interativos em ambiente hospitalar simulado",
}

export default function HospitalSimulacaoPage() {
  return (
    <DashboardLayout>
      <ComingSoonContent feature="hospitalSimulacao" />
    </DashboardLayout>
  )
}
