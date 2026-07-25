"use client"

import { useEffect, useState } from "react"
import { Bell, Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { SidebarNav } from "@/components/sidebar-nav"
import { UserDropdown } from "@/components/user-dropdown"
import { getPlanStatus } from "@/lib/plan-status"

export function DashboardHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    getPlanStatus().then((status) => {
      if (!status) return
      const name = status.fullName || status.email?.split("@")[0] || ""
      setFullName(name)
      setFirstName(name.split(" ")[0] ?? "")
      setEmail(status.email ?? "")
    })
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-sm sm:px-6">
      {/* Mobile menu */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 border-sidebar-border p-0">
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Greeting */}
      <div className="hidden min-w-0 sm:block">
        <h1 className="truncate text-lg font-semibold text-foreground">
          Bem-vindo de volta{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="truncate text-xs text-muted-foreground">Continue seu progresso nos estudos.</p>
      </div>

      {/* Search */}
      <div className="relative ml-auto hidden w-full max-w-xs md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar matérias, aulas..."
          className="bg-secondary pl-9 focus-visible:bg-card"
          aria-label="Buscar"
        />
      </div>

      <div className="ml-auto flex items-center gap-1 md:ml-0">
        <ThemeToggle />

        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground" aria-label="Notificações">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
        </Button>

        <div className="ml-1">
          <UserDropdown name={fullName || "Minha conta"} email={email} />
        </div>
      </div>
    </header>
  )
}
