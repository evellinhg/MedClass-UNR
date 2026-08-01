import { AdminLayout } from "@/components/admin-layout"
import { AdminDepoimentosContent } from "@/components/admin-depoimentos-content"

export default function AdminDepoimentosPage() {
  return (
    <AdminLayout title="Depoimentos">
      <AdminDepoimentosContent />
    </AdminLayout>
  )
}
