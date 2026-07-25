import { DashboardLayout } from "@/components/dashboard-layout"
import { ConquistasContent } from "@/components/conquistas-content"

export const metadata = {
  title: "Conquistas - MedClass",
  description: "Minhas medalhas e conquistas",
}

export default function ConquistasPage() {
  return (
    <DashboardLayout>
      <ConquistasContent />
    </DashboardLayout>
  )
}
