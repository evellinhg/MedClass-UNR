import { AdminLayout } from "@/components/admin-layout"
import { AdminResumosContent } from "@/components/admin-resumos-content"

export default function AdminResumosPage() {
  return (
    <AdminLayout title="Resumos">
      <AdminResumosContent />
    </AdminLayout>
  )
}
