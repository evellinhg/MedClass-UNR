import { DashboardLayout } from "@/components/dashboard-layout"
import { DesempenhoHistoricoContent } from "@/components/desempenho-historico-content"

export const metadata = {
  title: "Histórico - MedClass",
  description: "Veja o histórico das suas tentativas e simulados",
}

export default function DesempenhoHistoricoPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient-brand">Histórico</h1>
          <p className="mt-1 text-muted-foreground">
            Veja todas as suas tentativas de simulados e questões
          </p>
        </div>

        <DesempenhoHistoricoContent />
      </div>
    </DashboardLayout>
  )
}
