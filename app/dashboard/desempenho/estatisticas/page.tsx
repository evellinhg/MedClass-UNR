import { DashboardLayout } from "@/components/dashboard-layout"
import { DesempenhoEstatisticasContent } from "@/components/desempenho-estatisticas-content"

export const metadata = {
  title: "Estatísticas - MedClass",
  description: "Acompanhe sua evolução e identifique pontos de melhoria",
}

export default function DesempenhoEstatisticasPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient-brand">Estatísticas</h1>
          <p className="mt-1 text-muted-foreground">
            Acompanhe sua evolução e identifique pontos de melhoria
          </p>
        </div>

        <DesempenhoEstatisticasContent />
      </div>
    </DashboardLayout>
  )
}
