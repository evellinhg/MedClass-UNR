import { AdminLayout } from "@/components/admin-layout"
import { AdminDadosContent } from "@/components/admin-dados-content"

export default function AdminDadosPage() {
  return (
    <AdminLayout title="Dados">
      <AdminDadosContent />
    </AdminLayout>
  )
}
