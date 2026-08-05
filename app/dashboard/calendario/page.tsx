import { CalendarioContent } from "@/components/calendario-content"
import { DashboardLayout } from "@/components/dashboard-layout"

export const metadata = {
  title: "Calendário | MedClass",
  description: "Datas importantes: inscrições, provas e eventos da comunidade",
}

export default function CalendarioPage() {
  return (
    <DashboardLayout>
      <CalendarioContent />
    </DashboardLayout>
  )
}
