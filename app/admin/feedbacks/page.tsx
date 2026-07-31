import { AdminLayout } from "@/components/admin-layout"
import { AdminFeedbacksContent } from "@/components/admin-feedbacks-content"

export default function AdminFeedbacksPage() {
  return (
    <AdminLayout title="Feedbacks">
      <AdminFeedbacksContent />
    </AdminLayout>
  )
}
