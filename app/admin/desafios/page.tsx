import { AdminLayout } from "@/components/admin-layout"
import { AdminDesafiosContent } from "@/components/admin-desafios-content"

export default function AdminDesafiosPage() {
  return (
    <AdminLayout title="Desafios Clínicos">
      <AdminDesafiosContent />
    </AdminLayout>
  )
}
