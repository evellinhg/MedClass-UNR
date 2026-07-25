import { CronogramaContent } from "@/components/cronograma-content"
import { DashboardLayout } from "@/components/dashboard-layout"

export const metadata = {
  title: "Cronograma | MedClass",
  description: "Gerencie suas rotinas e cronograma de estudos",
}

export default function CronogramaPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient-brand">Cronograma</h1>
          <p className="mt-1 text-muted-foreground">
            Organize e acompanhe suas rotinas de estudo
          </p>
        </div>

        <CronogramaContent />
      </div>
    </DashboardLayout>
  )
}
