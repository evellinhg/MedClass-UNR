"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, Settings, User } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserDropdownProps {
  name: string
  email: string
  avatarUrl?: string | null
}

export function UserDropdown({ name, email, avatarUrl }: UserDropdownProps) {
  const router = useRouter()
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <Avatar className="h-9 w-9">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
            <AvatarFallback className="bg-accent text-accent-foreground text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col space-y-1">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/perfil">
            <User className="mr-2 h-4 w-4" />
            <span>Meu Perfil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/configuracoes">
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
