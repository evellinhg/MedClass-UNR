import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"

export const metadata = {
  title: "Ator/Atriz | MedClass",
  description: "Gerencie personagens para simulações",
}

export default function PersonagemPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient-brand">Ator/Atriz</h1>
          <p className="mt-1 text-muted-foreground">
            Personagens para simulações clínicas
          </p>
        </div>

        <Card className="border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            Seção de personagens em desenvolvimento
          </p>
        </Card>
      </div>
    </DashboardLayout>
  )
}
