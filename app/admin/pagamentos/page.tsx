import { AdminLayout } from "@/components/admin-layout"
import { AdminPagamentosContent } from "@/components/admin-pagamentos-content"

export default function AdminPagamentosPage() {
  return (
    <AdminLayout title="Pagamentos">
      <AdminPagamentosContent />
    </AdminLayout>
  )
}
