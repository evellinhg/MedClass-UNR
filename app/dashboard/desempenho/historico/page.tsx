import { DashboardLayout } from "@/components/dashboard-layout"
import { DesempenhoHistoricoContent } from "@/components/desempenho-historico-content"
import { DesempenhoHistoricoHeader } from "@/components/desempenho-historico-header"

export const metadata = {
  title: "Histórico - MedClass",
  description: "Veja o histórico das suas tentativas e simulados",
}

export default function DesempenhoHistoricoPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DesempenhoHistoricoHeader />

        <DesempenhoHistoricoContent />
      </div>
    </DashboardLayout>
  )
}
