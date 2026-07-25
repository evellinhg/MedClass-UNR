"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { LayoutDashboard, Users, Database, BookOpen, LogOut, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface AdminNavItem {
  name: string
  href: string
  icon: typeof LayoutDashboard
}

const adminNavigation: AdminNavItem[] = [
  { name: "Visão Geral", href: "/admin", icon: LayoutDashboard },
  { name: "Usuários", href: "/admin/usuarios", icon: Users },
  { name: "Dados", href: "/admin/dados", icon: Database },
  { name: "Banco de Questões", href: "/admin/questoes", icon: BookOpen },
]

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg">
          <Image
            src="/logo-icon.png"
            alt="MedClass Logo"
            width={40}
            height={40}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="leading-tight">
          <p className="text-base font-semibold text-sidebar-foreground">MedClass</p>
          <p className="text-[11px] text-muted-foreground">Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Navegação administrativa">
        {adminNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-white shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="space-y-1 border-t border-sidebar-border p-3">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <ArrowLeft className="h-[18px] w-[18px] shrink-0" />
          Voltar ao painel do aluno
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          Sair
        </button>
      </div>
    </div>
  )
}
