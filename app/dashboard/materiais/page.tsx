import { Suspense } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MateriaisContent } from "@/components/materiais-content"
import { MateriaisHeader } from "@/components/materiais-header"

export const metadata = {
  title: "Materiais | MedClass",
  description: "Acesse seus materiais de estudo",
}

export default function MateriaisPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <MateriaisHeader />

        <Suspense fallback={null}>
          <MateriaisContent />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}
