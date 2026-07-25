import { AdminLayout } from "@/components/admin-layout"
import { AdminTrilhasContent } from "@/components/admin-trilhas-content"

export default function AdminTrilhasPage() {
  return (
    <AdminLayout title="Trilhas de Cronograma">
      <AdminTrilhasContent />
    </AdminLayout>
  )
}
