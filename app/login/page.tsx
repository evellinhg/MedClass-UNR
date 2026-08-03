import type { Metadata } from "next"
import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "Ingresar | MedClass",
  description: "Accedé a tu cuenta de MedClass",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <LoginForm initialError={params?.error} />
    </div>
  )
}
