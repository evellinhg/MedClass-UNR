import { AdminLayout } from "@/components/admin-layout"
import { AdminTrilhaDetailContent } from "@/components/admin-trilha-detail-content"

export default async function AdminTrilhaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <AdminLayout title="Trilha de Cronograma">
      <AdminTrilhaDetailContent trilhaId={id} />
    </AdminLayout>
  )
}
