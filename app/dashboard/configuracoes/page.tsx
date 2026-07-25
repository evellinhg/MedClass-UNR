import { DashboardLayout } from "@/components/dashboard-layout"
import { ConfiguracoesContent } from "@/components/configuracoes-content"

export const metadata = {
  title: "Configurações | MedClass",
  description: "Gerencie notificações, e-mails e privacidade",
}

export default function ConfiguracoesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient-brand">Configurações</h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie notificações, alertas por e-mail e privacidade
          </p>
        </div>

        <ConfiguracoesContent />
      </div>
    </DashboardLayout>
  )
}
