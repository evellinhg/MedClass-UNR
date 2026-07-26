"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown, LogOut, ShieldCheck, Lock } from "lucide-react"
import Image from "next/image"
import { navigation } from "@/lib/navigation"
import { supabase } from "@/lib/supabase"
import { isAdminEmail } from "@/lib/admin-config"
import { getPlanStatus, type PlanStatus } from "@/lib/plan-status"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface SidebarNavProps {
  onNavigate?: () => void
  compact?: boolean
}

function planLabel(status: PlanStatus): string {
  if (status.isAdmin) return "Administrador"
  if (status.plan === "mensal") return "Plano Mensal"
  if (status.plan === "trimestral") return "Plano Trimestral"
  if (status.isTrialExpired) return "Plano expirado"
  if (status.trialExpiresAt) {
    const hoursLeft = Math.max(
      0,
      Math.ceil((new Date(status.trialExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60))
    )
    return `Teste grátis · ${hoursLeft}h restantes`
  }
  return "Plano gratuito"
}

export function SidebarNav({ onNavigate, compact = false }: SidebarNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggleExpanded = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const basePath = (href: string) => href.split("?")[0]

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAdmin(isAdminEmail(data.session?.user.email))
    })
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(isAdminEmail(session?.user.email))
    })
    getPlanStatus().then(setPlanStatus)
    return () => subscription.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const materiaisLocked = !!planStatus && !planStatus.canAccessMateriais

  const initials = planStatus?.fullName
    ? planStatus.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : planStatus?.email?.slice(0, 2).toUpperCase() ?? "?"

  return (
    <div className="flex h-full flex-col overflow-hidden bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className={`flex h-16 items-center gap-3 ${compact ? "justify-center px-2" : "px-6"}`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <Image
            src="/logo-icon.png"
            alt="MedClass Logo"
            width={40}
            height={40}
            className="h-full w-full object-contain"
          />
        </div>
        {!compact && (
          <div className="leading-tight">
            <p className="text-base font-semibold text-sidebar-foreground">MedClass</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav
        className={`flex-1 space-y-1 overflow-y-auto overflow-x-hidden py-4 ${compact ? "px-2" : "px-3"}`}
        aria-label="Navegação principal"
      >
        {navigation.map((item) => {
          const hasChildren = !!item.children?.length
          const isChildActive = hasChildren && item.children!.some((c) => basePath(c.href) === pathname)
          const isActive = pathname === item.href || isChildActive
          const isOpen = expanded.has(item.name) || isChildActive

          return (
            <div key={item.name}>
              {hasChildren && !compact ? (
                <button
                  type="button"
                  onClick={() => toggleExpanded(item.name)}
                  aria-expanded={isOpen}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-white shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.name === "Materiais" && materiaisLocked && (
                    <Lock className="h-3.5 w-3.5 shrink-0 opacity-60" aria-label="Recurso exclusivo dos planos pagos" />
                  )}
                  <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
              ) : (
                <Link
                  href={hasChildren ? item.children![0].href : item.href}
                  onClick={hasChildren ? undefined : onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  title={compact ? item.name : undefined}
                  className={`flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                    compact ? "justify-center px-0" : "px-3"
                  } ${
                    isActive
                      ? "bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-white shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  {!compact && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      {item.name === "Materiais" && materiaisLocked && (
                        <Lock className="h-3.5 w-3.5 shrink-0 opacity-60" aria-label="Recurso exclusivo dos planos pagos" />
                      )}
                    </>
                  )}
                </Link>
              )}

              {!compact && hasChildren && isOpen && (
                <div className="ml-[27px] mt-1 space-y-1 border-l border-sidebar-border pl-4">
                  {item.children!.map((child) => {
                    const childActive = basePath(child.href) === pathname
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onNavigate}
                        aria-current={childActive ? "page" : undefined}
                        className={`block rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                          childActive
                            ? "font-medium text-primary"
                            : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                        }`}
                      >
                        {child.name}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {isAdmin && (
          <Link
            href="/admin"
            onClick={onNavigate}
            aria-current={pathname.startsWith("/admin") ? "page" : undefined}
            title={compact ? "Painel Admin" : undefined}
            className={`flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors ${
              compact ? "justify-center px-0" : "px-3"
            } ${
              pathname.startsWith("/admin")
                ? "bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-white shadow-sm"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <ShieldCheck className="h-[18px] w-[18px] shrink-0" />
            {!compact && "Painel Admin"}
          </Link>
        )}
      </nav>

      {/* User footer */}
      <div className={`border-t border-sidebar-border ${compact ? "p-2" : "p-3"}`}>
        <div className={`flex items-center rounded-lg py-2 ${compact ? "flex-col gap-2 px-0" : "gap-3 px-3"}`}>
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!compact && (
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {planStatus?.fullName || planStatus?.email || "Minha conta"}
              </p>
              <p
                className={`truncate text-xs ${
                  planStatus?.isTrialExpired ? "font-medium text-destructive" : "text-muted-foreground"
                }`}
              >
                {planStatus ? planLabel(planStatus) : "Carregando..."}
              </p>
            </div>
          )}
          <button
            aria-label="Sair"
            title={compact ? "Sair" : undefined}
            onClick={handleLogout}
            className="rounded-md p-1.5 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </div>
  )
}
