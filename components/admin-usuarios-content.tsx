"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Check, Copy, KeyRound, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface AdminUser {
  id: string
  email: string
  full_name: string | null
  plan: string
  status: string
  provider: string
  created_at: string
  last_sign_in_at: string | null
}

function formatDate(value: string | null) {
  if (!value) return "Nunca"
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
}

async function authedFetch(input: string, init: RequestInit = {}) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return fetch(input, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
}

function UserDetailDialog({
  user,
  open,
  onOpenChange,
  onSaved,
}: {
  user: AdminUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [plan, setPlan] = useState("mensal")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetting, setResetting] = useState(false)
  const [newPassword, setNewPassword] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.full_name ?? "")
      setEmail(user.email)
      setPlan(user.plan)
      setNewPassword(null)
      setError(null)
    }
  }, [user])

  if (!user) return null

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    const res = await authedFetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      body: JSON.stringify({ email, full_name: name, plan }),
    })
    setSaving(false)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? "Erro ao salvar alterações.")
      return
    }
    onSaved()
    onOpenChange(false)
  }

  const handleResetPassword = async () => {
    setResetting(true)
    setError(null)
    const res = await authedFetch(`/api/admin/users/${user.id}/reset-password`, { method: "POST" })
    setResetting(false)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? "Erro ao redefinir senha.")
      return
    }
    const body = await res.json()
    setNewPassword(body.password)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes do usuário</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{user.provider === "google" ? "Login com Google" : "E-mail e senha"}</Badge>
            <Badge variant={user.status === "pending" ? "outline" : "default"}>
              {user.status === "pending" ? "Pendente" : "Ativo"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Criado em</p>
              <p>{formatDate(user.created_at)}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Último acesso</p>
              <p>{formatDate(user.last_sign_in_at)}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Plano</Label>
            <Select value={plan} onValueChange={setPlan}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gratis">Gratuito (teste 24h)</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="trimestral">Trimestral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">Redefinir senha</p>
                <p className="text-xs text-muted-foreground">
                  Gera uma senha aleatória para o cliente entrar e depois trocar no perfil dele.
                </p>
              </div>
              <Button size="sm" variant="outline" className="shrink-0 gap-1.5" onClick={handleResetPassword} disabled={resetting}>
                {resetting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
                Gerar nova
              </Button>
            </div>
            {newPassword && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted p-2">
                <code className="flex-1 select-all font-mono text-sm text-foreground">{newPassword}</code>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(newPassword)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1500)
                  }}
                >
                  {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            )}
            {newPassword && (
              <p className="mt-2 text-[11px] text-muted-foreground">
                Copie e envie ao cliente agora — essa senha não fica salva em nenhum lugar visível depois.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button variant="gradient" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function UsersTable({ users, onSelect }: { users: AdminUser[]; onSelect: (u: AdminUser) => void }) {
  if (users.length === 0) {
    return <div className="p-10 text-center text-sm text-muted-foreground">Nenhum usuário aqui ainda.</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Login</TableHead>
          <TableHead>Plano</TableHead>
          <TableHead>Último acesso</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id} className="cursor-pointer" onClick={() => onSelect(user)}>
            <TableCell className="font-medium text-foreground">{user.full_name ?? "—"}</TableCell>
            <TableCell className="text-muted-foreground">{user.email}</TableCell>
            <TableCell>
              <Badge variant="secondary">{user.provider === "google" ? "Google" : "E-mail"}</Badge>
            </TableCell>
            <TableCell className="capitalize">{user.plan}</TableCell>
            <TableCell className="text-muted-foreground">{formatDate(user.last_sign_in_at)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function AdminUsuariosContent() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<AdminUser | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await authedFetch("/api/admin/users")
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? "Erro ao carregar usuários.")
      setLoading(false)
      return
    }
    const body = await res.json()
    setUsers(body.users)
    setError(null)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleSelect = (user: AdminUser) => {
    setSelected(user)
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando...
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      </Card>
    )
  }

  const active = users.filter((u) => u.status !== "pending")
  const pending = users.filter((u) => u.status === "pending")

  return (
    <>
      <Tabs defaultValue="ativos" className="gap-6">
        <TabsList>
          <TabsTrigger value="ativos">Ativos ({active.length})</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes ({pending.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="ativos">
          <Card className="border border-border bg-card p-0">
            <UsersTable users={active} onSelect={handleSelect} />
          </Card>
        </TabsContent>

        <TabsContent value="pendentes">
          <Card className="border border-border bg-card p-0">
            <UsersTable users={pending} onSelect={handleSelect} />
          </Card>
        </TabsContent>
      </Tabs>

      <UserDetailDialog user={selected} open={dialogOpen} onOpenChange={setDialogOpen} onSaved={load} />
    </>
  )
}
