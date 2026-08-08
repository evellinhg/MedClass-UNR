import { DashboardLayout } from "@/components/dashboard-layout"
import { HospitalSimulacaoGrid } from "@/components/hospital-simulacao-grid"

export const metadata = {
  title: "Hospital Simulação | MedClass",
  description: "Casos clínicos interativos em ambiente hospitalar simulado",
}

export default function HospitalSimulacaoPage() {
  return (
    <DashboardLayout>
      <HospitalSimulacaoGrid />
    </DashboardLayout>
  )
}
