import { FeedbackContent } from "@/components/feedback-content"
import { DashboardLayout } from "@/components/dashboard-layout"

export const metadata = {
  title: "Feedback | MedClass",
  description: "Envie dúvidas, sugestões e reporte erros",
}

export default function FeedbackPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient-brand">Feedback</h1>
          <p className="mt-1 text-muted-foreground">
            Compartilhe dúvidas, sugestões e reporte erros
          </p>
        </div>

        <FeedbackContent />
      </div>
    </DashboardLayout>
  )
}
