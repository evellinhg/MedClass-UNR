import { AdminLayout } from "@/components/admin-layout"
import { AdminRelatoriosContent } from "@/components/admin-relatorios-content"

export default function AdminRelatoriosPage() {
  return (
    <AdminLayout title="Relatórios">
      <AdminRelatoriosContent />
    </AdminLayout>
  )
}
