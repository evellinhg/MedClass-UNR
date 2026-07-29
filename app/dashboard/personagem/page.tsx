import { DashboardLayout } from "@/components/dashboard-layout"
import { PersonagemContent } from "@/components/personagem-content"

export const metadata = {
  title: "Ator/Atriz | MedClass",
  description: "Gerencie personagens para simulações",
}

export default function PersonagemPage() {
  return (
    <DashboardLayout>
      <PersonagemContent />
    </DashboardLayout>
  )
}
