import { AdminLayout } from "@/components/admin-layout"
import { AdminFlashcardsContent } from "@/components/admin-flashcards-content"

export default function AdminFlashcardsPage() {
  return (
    <AdminLayout title="Flashcards">
      <AdminFlashcardsContent />
    </AdminLayout>
  )
}
