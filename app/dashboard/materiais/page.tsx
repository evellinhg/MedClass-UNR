import { Suspense } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MateriaisContent } from "@/components/materiais-content"

export const metadata = {
  title: "Materiais | MedClass",
  description: "Acesse seus materiais de estudo",
}

export default function MateriaisPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient-brand">Materiais</h1>
          <p className="mt-1 text-muted-foreground">
            Acesse suas videoaulas, resumos e flashcards
          </p>
        </div>

        <Suspense fallback={null}>
          <MateriaisContent />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}
