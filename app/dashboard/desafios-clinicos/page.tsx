import { DashboardLayout } from "@/components/dashboard-layout"
import { DesafiosClinicosContent } from "@/components/desafios-clinicos-content"

export const metadata = {
  title: "Desafios Clínicos | MedClass",
  description: "Estude casos clínicos completos com perguntas de anamnese ao diagnóstico",
}

export default function DesafiosClinicosPage() {
  return (
    <DashboardLayout>
      <DesafiosClinicosContent />
    </DashboardLayout>
  )
}
