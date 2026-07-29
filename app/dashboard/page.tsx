"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { HomeStats } from "@/components/home-stats"
import { ActionCards } from "@/components/action-cards"
import { RankingWidget } from "@/components/ranking-widget"
import { DesempenhoWidget } from "@/components/desempenho-widget"
import { MedCoinsWidget } from "@/components/medcoins-widget"
import { DailyTipHeader } from "@/components/daily-tip-header"
import { useLanguage } from "@/lib/i18n"

export default function HomePage() {
  const { t } = useLanguage()
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <DailyTipHeader />

        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">{t.dashboardNav.seuProgresso}</h2>
          <HomeStats />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">{t.dashboardNav.oQueFazerAgora}</h2>
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
