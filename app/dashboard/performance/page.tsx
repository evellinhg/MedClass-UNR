import { PerformanceContent } from "@/components/performance-content"
import { DashboardLayout } from "@/components/dashboard-layout"

export const metadata = {
  title: "Performance | MedClass",
  description: "Acompanhe sua evolução e desempenho nos estudos",
}

export default function PerformancePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient-brand">Performance</h1>
          <p className="mt-1 text-muted-foreground">
            Analise sua evolução e identifique pontos de melhoria
          </p>
        </div>

        <PerformanceContent />
      </div>
    </DashboardLayout>
  )
}
