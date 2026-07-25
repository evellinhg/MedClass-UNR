import { AdminLayout } from "@/components/admin-layout"
import { AdminMedCoinsContent } from "@/components/admin-medcoins-content"

export default function AdminMedCoinsPage() {
  return (
    <AdminLayout title="MedCoins">
      <AdminMedCoinsContent />
    </AdminLayout>
  )
}
