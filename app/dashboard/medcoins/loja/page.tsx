import { DashboardLayout } from "@/components/dashboard-layout"
import { MedCoinsLojaContent } from "@/components/medcoins-loja-content"

export const metadata = {
  title: "Loja MedCoins - MedClass",
  description: "Troque seus MedCoins por produtos digitais e físicos",
}

export default function LojaMedCoinsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient-brand">Loja MedCoins</h1>
          <p className="mt-1 text-muted-foreground">Troque seus MedCoins por produtos digitais e físicos.</p>
        </div>
        <MedCoinsLojaContent />
      </div>
    </DashboardLayout>
  )
}
