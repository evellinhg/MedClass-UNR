import type { Metadata } from "next"
import { ResetPasswordForm } from "@/components/reset-password-form"

export const metadata: Metadata = {
  title: "Redefinir senha | MedClass",
  description: "Defina uma nova senha de acesso",
}

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <ResetPasswordForm />
    </div>
  )
}
