import { AdminLayout } from "@/components/admin-layout"
import { AdminCalendarioContent } from "@/components/admin-calendario-content"

export default function AdminCalendarioPage() {
  return (
    <AdminLayout title="Calendário">
      <AdminCalendarioContent />
    </AdminLayout>
  )
}
