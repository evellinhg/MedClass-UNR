import { DashboardLayout } from "@/components/dashboard-layout"
import { HomeStats } from "@/components/home-stats"
import { ActionCards } from "@/components/action-cards"
import { RankingWidget } from "@/components/ranking-widget"
import { DesempenhoWidget } from "@/components/desempenho-widget"
import { MedCoinsWidget } from "@/components/medcoins-widget"

export default function HomePage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Seu Progresso</h2>
          <HomeStats />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">O Que Fazer Agora</h2>
          <ActionCards />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <DesempenhoWidget />
          <RankingWidget />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <MedCoinsWidget />
        </div>
      </div>
    </DashboardLayout>
  )
}
