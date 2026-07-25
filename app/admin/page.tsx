import { AdminLayout } from "@/components/admin-layout"
import { AdminOverviewContent } from "@/components/admin-overview-content"

export default function AdminOverviewPage() {
  return (
    <AdminLayout title="Visão Geral">
      <AdminOverviewContent />
    </AdminLayout>
  )
}
