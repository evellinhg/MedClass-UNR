import { AdminLayout } from "@/components/admin-layout"
import { AdminQuestoesContent } from "@/components/admin-questoes-content"

export default function AdminQuestoesPage() {
  return (
    <AdminLayout title="Banco de Questões">
      <AdminQuestoesContent />
    </AdminLayout>
  )
}
