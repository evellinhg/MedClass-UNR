import { DashboardLayout } from "@/components/dashboard-layout"
import { PerfilContent } from "@/components/perfil-content"

export const metadata = {
  title: "Meu Perfil | MedClass",
  description: "Gerencie seus dados pessoais e preferências",
}

export default function PerfilPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient-brand">Meu Perfil</h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie seus dados pessoais e preferências de estudo
          </p>
        </div>

        <PerfilContent />
      </div>
    </DashboardLayout>
  )
}
