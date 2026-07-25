import { DashboardLayout } from "@/components/dashboard-layout"
import { MedCoinsContent } from "@/components/medcoins-content"

export const metadata = {
  title: "MedCoins - MedClass",
  description: "Saldo e extrato de MedCoins",
}

export default function MedCoinsPage() {
  return (
    <DashboardLayout>
      <MedCoinsContent />
    </DashboardLayout>
  )
}
