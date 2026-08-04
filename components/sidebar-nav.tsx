"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown, LogOut, ShieldCheck, Lock } from "lucide-react"
import Image from "next/image"
import { getNavigation } from "@/lib/navigation"
import { supabase } from "@/lib/supabase"
import { getPlanStatus, type PlanStatus } from "@/lib/plan-status"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useLanguage } from "@/lib/i18n"

interface SidebarNavProps {
  onNavigate?: () => void
  compact?: boolean
}

function planLabel(status: PlanStatus, t: ReturnType<typeof useLanguage>["t"]["dashboardNav"]): string {
  if (status.isAdmin) return t.administrador
  if (status.plan === "vip") return t.planoVip
  if (status.plan === "mensal") return t.planoMensal
  if (status.plan === "trimestral") return t.planoTrimestral
  if (status.accessExpired) return t.planoExpirado
  return t.planoGratuito
}

export function SidebarNav({ onNavigate, compact = false }: SidebarNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useLanguage()
  const navigation = getNavigation(t.dashboardNav)
  const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null)
  const isAdmin = planStatus?.isAdmin ?? false
  const isColaborador = planStatus?.isColaborador ?? false
  const hasAdminAccess = isAdmin || isColaborador
  const adminHref = isAdmin ? "/admin" : "/admin/questoes"
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
    getPlanStatus().then(setPlanStatus)
    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      getPlanStatus().then(setPlanStatus)
    })
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
            width={2000}
            height={1848}
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
        aria-label={t.dashboardNav.navegacaoPrincipal}
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
                      ? "bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] text-[#0a1f00] shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.name === t.dashboardNav.materiais && materiaisLocked && (
                    <Lock className="h-3.5 w-3.5 shrink-0 opacity-60" aria-label={t.dashboardNav.recursoExclusivo} />
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
                      ? "bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] text-[#0a1f00] shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  {!compact && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      {item.name === t.dashboardNav.materiais && materiaisLocked && (
                        <Lock className="h-3.5 w-3.5 shrink-0 opacity-60" aria-label={t.dashboardNav.recursoExclusivo} />
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

        {hasAdminAccess && (
          <Link
            href={adminHref}
            onClick={onNavigate}
            aria-current={pathname.startsWith("/admin") ? "page" : undefined}
            title={compact ? t.dashboardNav.painelAdmin : undefined}
            className={`flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors ${
              compact ? "justify-center px-0" : "px-3"
            } ${
              pathname.startsWith("/admin")
                ? "bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] text-[#0a1f00] shadow-sm"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <ShieldCheck className="h-[18px] w-[18px] shrink-0" />
            {!compact && t.dashboardNav.painelAdmin}
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
                {planStatus?.fullName || planStatus?.email || t.dashboardNav.minhaConta}
              </p>
              <p
                className={`truncate text-xs ${
                  planStatus?.accessExpired ? "font-medium text-destructive" : "text-muted-foreground"
                }`}
              >
                {planStatus ? planLabel(planStatus, t.dashboardNav) : t.dashboardNav.carregando}
              </p>
            </div>
          )}
          <button
            aria-label={t.dashboardNav.sair}
            title={compact ? t.dashboardNav.sair : undefined}
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
