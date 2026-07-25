"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, ShieldAlert } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { isAdminEmail } from "@/lib/admin-config"
import { Button } from "@/components/ui/button"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
}

type Status = "checking" | "authorized" | "forbidden" | "unauthenticated"

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>("checking")

  useEffect(() => {
    let active = true

    const evaluate = (email?: string | null, hasSession?: boolean) => {
      if (!active) return
      if (!hasSession) {
        setStatus("unauthenticated")
        router.replace("/login")
      } else if (isAdminEmail(email)) {
        setStatus("authorized")
      } else {
        setStatus("forbidden")
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      evaluate(data.session?.user.email, !!data.session)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      evaluate(session?.user.email, !!session)
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [router])

  if (status === "checking" || status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (status === "forbidden") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-7 w-7 text-destructive" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Acesso negado</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Sua conta está autenticada, mas não tem permissão de administrador para acessar este painel.
        </p>
        <Button asChild variant="gradient">
          <Link href="/dashboard">Voltar ao painel do aluno</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sidebar-border lg:block">
        <AdminSidebar />
      </aside>

      <div className="lg:pl-64">
        <AdminHeader title={title} />
        <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
