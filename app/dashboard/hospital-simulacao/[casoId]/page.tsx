import { DashboardLayout } from "@/components/dashboard-layout"
import { HospitalSimulacaoCasoViewer } from "@/components/hospital-simulacao-caso-viewer"

export const metadata = {
  title: "Hospital Simulação | MedClass",
  description: "Caso clínico interativo em ambiente hospitalar simulado",
}

export default async function HospitalSimulacaoCasoPage({ params }: { params: Promise<{ casoId: string }> }) {
  const { casoId } = await params
  return (
    <DashboardLayout>
      <HospitalSimulacaoCasoViewer casoId={casoId} />
    </DashboardLayout>
  )
}
