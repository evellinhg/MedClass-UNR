"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Check, KeyRound, Loader2, Trash2, RotateCcw, ClipboardList, MessageSquareWarning, Coins, Swords } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
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
  role: string
  access_expires_at: string | null
  provider: string
  created_at: string
  last_sign_in_at: string | null
}

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  aluno: "Aluno",
  colaborador: "Colaborador",
}

const PLAN_LABEL: Record<string, string> = {
  gratis: "Gratuito",
  mensal: "Mensal",
  trimestral: "Trimestral",
  vip: "VIP",
}

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface UserActivity {
  summary: {
    simulados_total: number
    simulados_finalizados: number
    simulados_abandonados: number
    tentativas_total: number
    feedback_total: number
    desafios_total: number
  }
  simulados: {
    id: string
    nome: string | null
    areas: string[] | null
    prova: string | null
    quantidade_questoes: number | null
    modo: string | null
    created_at: string
    finished_at: string | null
  }[]
  simulado_attempts: {
    id: string
    simulado_id: string | null
    subject: string | null
    total_questions: number
    correct_count: number
    wrong_count: number
    duration_seconds: number | null
    points: number | null
    created_at: string
  }[]
  question_feedback: {
    id: string
    question_id: string
    tipo: string | null
    message: string
    status: string
    created_at: string
  }[]
  desafios_clinicos: {
    id: string
    desafio_id: string
    acertos: number
    total: number
    duracao_segundos: number | null
    created_at: string
  }[]
  medcoins_ledger: {
    id: string
    tipo: string
    valor: number
    origem_tipo: string | null
    origem_id: string | null
    descricao: string | null
    created_at: string
  }[]
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

function ActivityPanel({ userId }: { userId: string }) {
  const [activity, setActivity] = useState<UserActivity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    authedFetch(`/api/admin/users/${userId}/activity`).then(async (res) => {
      if (cancelled) return
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? "Erro ao carregar atividade do usuário.")
        setLoading(false)
        return
      }
      setActivity(await res.json())
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando atividade...
      </div>
    )
  }

  if (error || !activity) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{error ?? "Nenhum dado disponível."}</span>
      </div>
    )
  }

  const { summary } = activity

  return (
    <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-border p-2">
          <p className="text-lg font-semibold text-foreground">{summary.simulados_finalizados}</p>
          <p className="text-[11px] text-muted-foreground">Finalizados</p>
        </div>
        <div className="rounded-lg border border-border p-2">
          <p className="text-lg font-semibold text-warning">{summary.simulados_abandonados}</p>
          <p className="text-[11px] text-muted-foreground">Desistências</p>
        </div>
        <div className="rounded-lg border border-border p-2">
          <p className="text-lg font-semibold text-foreground">{summary.feedback_total}</p>
          <p className="text-[11px] text-muted-foreground">Erros reportados</p>
        </div>
      </div>

      <section className="space-y-2">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
          <ClipboardList className="h-3.5 w-3.5" /> Treinamentos / simulados
        </h4>
        {activity.simulados.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhum treinamento iniciado.</p>
        ) : (
          <div className="space-y-1.5">
            {activity.simulados.map((s) => (
              <div key={s.id} className="rounded-lg border border-border p-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground">{s.nome ?? "Sem nome"}</span>
                  <Badge variant={s.finished_at ? "default" : "outline"} className="shrink-0">
                    {s.finished_at ? "Finalizado" : "Desistiu"}
                  </Badge>
                </div>
                <p className="mt-1 break-all text-muted-foreground">ID: {s.id}</p>
                <p className="text-muted-foreground">
                  {s.quantidade_questoes ?? "?"} questões · {s.modo ?? "—"} · iniciado em {formatDate(s.created_at)}
                  {s.finished_at ? ` · finalizado em ${formatDate(s.finished_at)}` : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
          <Swords className="h-3.5 w-3.5" /> Desafios clínicos
        </h4>
        {activity.desafios_clinicos.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhum desafio realizado.</p>
        ) : (
          <div className="space-y-1.5">
            {activity.desafios_clinicos.map((d) => (
              <div key={d.id} className="rounded-lg border border-border p-2 text-xs">
                <p className="text-muted-foreground">ID desafio: {d.desafio_id}</p>
                <p className="text-muted-foreground">
                  {d.acertos}/{d.total} acertos · {d.duracao_segundos ?? "?"}s · {formatDate(d.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
          <MessageSquareWarning className="h-3.5 w-3.5" /> Feedback / erros reportados em questões
        </h4>
        {activity.question_feedback.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhum erro reportado por esse usuário.</p>
        ) : (
          <div className="space-y-1.5">
            {activity.question_feedback.map((f) => (
              <div key={f.id} className="rounded-lg border border-border p-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary">{f.tipo ?? "feedback"}</Badge>
                  <Badge variant={f.status === "pending" ? "outline" : "default"}>{f.status}</Badge>
                </div>
                <p className="mt-1 text-foreground">{f.message}</p>
                <p className="mt-1 break-all text-muted-foreground">
                  Questão: {f.question_id} · {formatDate(f.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
          <Coins className="h-3.5 w-3.5" /> MedCoins (extrato recente)
        </h4>
        {activity.medcoins_ledger.length === 0 ? (
          <p className="text-xs text-muted-foreground">Sem movimentações.</p>
        ) : (
          <div className="space-y-1.5">
            {activity.medcoins_ledger.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg border border-border p-2 text-xs">
                <div>
                  <p className="text-foreground">{m.descricao ?? m.origem_tipo ?? "Movimentação"}</p>
                  <p className="text-muted-foreground">{formatDate(m.created_at)}</p>
                </div>
                <span className={m.tipo === "credito" ? "font-medium text-success" : "font-medium text-destructive"}>
                  {m.tipo === "credito" ? "+" : "-"}
                  {m.valor}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
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
  const [role, setRole] = useState("aluno")
  const [accessExpiresAt, setAccessExpiresAt] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetting, setResetting] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [reactivating, setReactivating] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.full_name ?? "")
      setEmail(user.email)
      setPlan(user.plan)
      setRole(user.role)
      setAccessExpiresAt(toDatetimeLocalValue(user.access_expires_at))
      setResetSent(false)
      setError(null)
      setConfirmingDelete(false)
    }
  }, [user])

  if (!user) return null

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setError(null)
    const res = await authedFetch(`/api/admin/users/${user.id}`, { method: "DELETE" })
    setDeleting(false)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? "Erro ao excluir conta.")
      return
    }
    setConfirmingDelete(false)
    onSaved()
    onOpenChange(false)
  }

  const handleReactivateAccount = async () => {
    setReactivating(true)
    setError(null)
    const res = await authedFetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "active" }),
    })
    setReactivating(false)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? "Erro ao reativar conta.")
      return
    }
    onSaved()
    onOpenChange(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    const res = await authedFetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        email,
        full_name: name,
        plan,
        role,
        access_expires_at: accessExpiresAt ? new Date(accessExpiresAt).toISOString() : null,
      }),
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
    setResetSent(true)
  }

  const isDeleted = user.status === "deleted"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes do usuário</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{user.provider === "google" ? "Login com Google" : "E-mail e senha"}</Badge>
          {isDeleted ? (
            <Badge variant="destructive">Conta excluída</Badge>
          ) : (
            <Badge variant={user.status === "pending" ? "outline" : "default"}>
              {user.status === "pending" ? "Pendente" : "Ativo"}
            </Badge>
          )}
          <Badge variant="outline">{ROLE_LABEL[user.role] ?? user.role}</Badge>
          {user.access_expires_at && new Date(user.access_expires_at) < new Date() && (
            <Badge variant="destructive">Acesso expirado</Badge>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Tabs defaultValue="detalhes" className="gap-4">
          <TabsList>
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            <TabsTrigger value="atividade">Atividade</TabsTrigger>
          </TabsList>

          <TabsContent value="detalhes" className="space-y-4">
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
              <Input value={name} onChange={(e) => setName(e.target.value)} disabled={isDeleted} />
            </div>

            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isDeleted} />
            </div>

            <div className="space-y-1.5">
              <Label>Plano</Label>
              <Select
                value={plan}
                onValueChange={(v) => {
                  setPlan(v)
                  if (v === "vip") setAccessExpiresAt("")
                }}
                disabled={isDeleted}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gratis">Gratuito (teste 24h)</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                  <SelectItem value="vip">VIP (sem expiração)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                VIP dá acesso completo e permanente, sem data de expiração.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Papel da conta</Label>
              <Select value={role} onValueChange={setRole} disabled={isDeleted}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aluno">Aluno</SelectItem>
                  <SelectItem value="colaborador">Colaborador</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Admin tem acesso total. Colaborador tem acesso completo ao conteúdo e pode criar/editar o banco de
                questões, mas não acessa contas de usuários. Aluno não tem acesso ao painel admin.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Data de expiração do acesso</Label>
              <Input
                type="datetime-local"
                value={accessExpiresAt}
                onChange={(e) => setAccessExpiresAt(e.target.value)}
                disabled={isDeleted || plan === "vip"}
              />
              <p className="text-xs text-muted-foreground">
                Opcional. Depois dessa data, o acesso da conta é bloqueado automaticamente, independente do plano ou
                papel. Deixe em branco para não expirar.
              </p>
            </div>

            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Redefinir senha</p>
                  <p className="text-xs text-muted-foreground">
                    Envia um email para o cliente definir uma nova senha.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 gap-1.5"
                  onClick={handleResetPassword}
                  disabled={resetting || isDeleted}
                >
                  {resetting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
                  Enviar email
                </Button>
              </div>
              {resetSent && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-success/10 p-2 text-sm text-success">
                  <Check className="h-4 w-4 shrink-0" />
                  Email de redefinição enviado.
                </div>
              )}
            </div>

            <div className="rounded-lg border border-destructive/30 p-3">
              {isDeleted ? (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Conta excluída</p>
                    <p className="text-xs text-muted-foreground">
                      Login bloqueado. O histórico do usuário continua disponível na aba Atividade.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1.5"
                    onClick={handleReactivateAccount}
                    disabled={reactivating}
                  >
                    {reactivating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                    Reativar conta
                  </Button>
                </div>
              ) : !confirmingDelete ? (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Excluir conta</p>
                    <p className="text-xs text-muted-foreground">
                      Bloqueia o login e marca a conta como excluída. O histórico é mantido e a ação pode ser revertida.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="shrink-0 gap-1.5"
                    onClick={() => setConfirmingDelete(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Excluir conta
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Confirma a exclusão da conta de {user.full_name ?? user.email}?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    O login será bloqueado imediatamente. Você pode reativar depois por aqui.
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setConfirmingDelete(false)} disabled={deleting}>
                      Cancelar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={handleDeleteAccount} disabled={deleting}>
                      {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Confirmar exclusão"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="atividade">
            <ActivityPanel userId={user.id} />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button variant="gradient" onClick={handleSave} disabled={saving || isDeleted}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function UsersTable({
  users,
  onSelect,
  selectedIds,
  onToggleOne,
  onToggleAll,
}: {
  users: AdminUser[]
  onSelect: (u: AdminUser) => void
  selectedIds: Set<string>
  onToggleOne: (id: string, checked: boolean) => void
  onToggleAll: (checked: boolean) => void
}) {
  if (users.length === 0) {
    return <div className="p-10 text-center text-sm text-muted-foreground">Nenhum usuário aqui ainda.</div>
  }

  const allSelected = users.length > 0 && users.every((u) => selectedIds.has(u.id))

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              checked={allSelected}
              onCheckedChange={(checked) => onToggleAll(checked === true)}
              aria-label="Selecionar todos"
              onClick={(e) => e.stopPropagation()}
            />
          </TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Login</TableHead>
          <TableHead>Papel</TableHead>
          <TableHead>Plano</TableHead>
          <TableHead>Último acesso</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const expired = !!user.access_expires_at && new Date(user.access_expires_at) < new Date()
          return (
            <TableRow key={user.id} className="cursor-pointer" onClick={() => onSelect(user)}>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.has(user.id)}
                  onCheckedChange={(checked) => onToggleOne(user.id, checked === true)}
                  aria-label={`Selecionar ${user.email}`}
                />
              </TableCell>
              <TableCell className="font-medium text-foreground">{user.full_name ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">{user.email}</TableCell>
              <TableCell>
                <Badge variant="secondary">{user.provider === "google" ? "Google" : "E-mail"}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline">{ROLE_LABEL[user.role] ?? user.role}</Badge>
                  {expired && <Badge variant="destructive">Expirado</Badge>}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={user.plan === "vip" ? "default" : "outline"}>
                  {PLAN_LABEL[user.plan] ?? user.plan}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(user.last_sign_in_at)}</TableCell>
            </TableRow>
          )
        })}
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
  const [roleFilter, setRoleFilter] = useState("todos")
  const [planFilter, setPlanFilter] = useState("todos")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [confirmingBulkDelete, setConfirmingBulkDelete] = useState(false)
  const [bulkError, setBulkError] = useState<string | null>(null)

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

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const toggleAll = (list: AdminUser[]) => (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      for (const u of list) {
        if (checked) next.add(u.id)
        else next.delete(u.id)
      }
      return next
    })
  }

  const handleBulkDelete = async () => {
    setBulkDeleting(true)
    setBulkError(null)
    const ids = Array.from(selectedIds)
    const results = await Promise.all(
      ids.map((id) => authedFetch(`/api/admin/users/${id}`, { method: "DELETE" }))
    )
    setBulkDeleting(false)
    const failed = results.filter((r) => !r.ok).length
    if (failed > 0) {
      setBulkError(`${failed} de ${ids.length} conta(s) não puderam ser excluídas (ex: a própria conta do admin).`)
    }
    setConfirmingBulkDelete(false)
    setSelectedIds(new Set())
    load()
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

  const byRole = roleFilter === "todos" ? users : users.filter((u) => u.role === roleFilter)
  const byPlan = planFilter === "todos" ? byRole : byRole.filter((u) => u.plan === planFilter)
  const active = byPlan.filter((u) => u.status !== "pending" && u.status !== "deleted")
  const pending = byPlan.filter((u) => u.status === "pending")
  const deleted = byPlan.filter((u) => u.status === "deleted")

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Plano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os planos</SelectItem>
            <SelectItem value="gratis">Gratuito</SelectItem>
            <SelectItem value="mensal">Mensal</SelectItem>
            <SelectItem value="trimestral">Trimestral</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Papel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os papéis</SelectItem>
            <SelectItem value="aluno">Aluno</SelectItem>
            <SelectItem value="colaborador">Colaborador</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedIds.size > 0 && (
        <Card className="flex flex-wrap items-center justify-between gap-3 border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-sm text-foreground">
            {selectedIds.size} conta(s) selecionada(s)
          </p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setSelectedIds(new Set())}>
              Limpar seleção
            </Button>
            {!confirmingBulkDelete ? (
              <Button
                size="sm"
                variant="destructive"
                className="gap-1.5"
                onClick={() => setConfirmingBulkDelete(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Excluir selecionadas
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">Confirma a exclusão?</span>
                <Button size="sm" variant="outline" onClick={() => setConfirmingBulkDelete(false)} disabled={bulkDeleting}>
                  Cancelar
                </Button>
                <Button size="sm" variant="destructive" onClick={handleBulkDelete} disabled={bulkDeleting}>
                  {bulkDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Confirmar"}
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {bulkError && (
        <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{bulkError}</span>
        </div>
      )}

      <Tabs defaultValue="ativos" className="gap-6">
        <TabsList>
          <TabsTrigger value="ativos">Ativos ({active.length})</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes ({pending.length})</TabsTrigger>
          <TabsTrigger value="excluidos">Excluídos ({deleted.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="ativos">
          <Card className="border border-border bg-card p-0">
            <UsersTable
              users={active}
              onSelect={handleSelect}
              selectedIds={selectedIds}
              onToggleOne={toggleOne}
              onToggleAll={toggleAll(active)}
            />
          </Card>
        </TabsContent>

        <TabsContent value="pendentes">
          <Card className="border border-border bg-card p-0">
            <UsersTable
              users={pending}
              onSelect={handleSelect}
              selectedIds={selectedIds}
              onToggleOne={toggleOne}
              onToggleAll={toggleAll(pending)}
            />
          </Card>
        </TabsContent>

        <TabsContent value="excluidos">
          <Card className="border border-border bg-card p-0">
            <UsersTable
              users={deleted}
              onSelect={handleSelect}
              selectedIds={selectedIds}
              onToggleOne={toggleOne}
              onToggleAll={toggleAll(deleted)}
            />
          </Card>
        </TabsContent>
      </Tabs>

      <UserDetailDialog user={selected} open={dialogOpen} onOpenChange={setDialogOpen} onSaved={load} />
    </>
  )
}
