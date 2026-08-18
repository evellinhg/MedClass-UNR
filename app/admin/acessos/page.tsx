import { AdminLayout } from "@/components/admin-layout"
import { AdminAcessosContent } from "@/components/admin-acessos-content"

export default function AdminAcessosPage() {
  return (
    <AdminLayout title="Controle de Acessos">
      <AdminAcessosContent />
    </AdminLayout>
  )
}
