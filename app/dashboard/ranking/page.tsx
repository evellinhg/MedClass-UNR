import { DashboardLayout } from "@/components/dashboard-layout"
import { RankingContent } from "@/components/ranking-content"

export const metadata = {
  title: "Ranking - MedClass",
  description: "Veja sua posição no ranking de estudos",
}

export default function RankingPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient-brand">Ranking</h1>
          <p className="mt-1 text-muted-foreground">
            Dispute posições com outros alunos resolvendo simulados e questões
          </p>
        </div>

        <RankingContent />
      </div>
    </DashboardLayout>
  )
}
