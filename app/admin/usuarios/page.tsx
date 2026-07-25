import { AdminLayout } from "@/components/admin-layout"
import { AdminUsuariosContent } from "@/components/admin-usuarios-content"

export default function AdminUsuariosPage() {
  return (
    <AdminLayout title="Usuários">
      <AdminUsuariosContent />
    </AdminLayout>
  )
}
