"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, ExternalLink, Loader2, Pencil, Plus, Trash2, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarioEventoEditDialog } from "@/components/calendario-evento-edit-dialog"
import type { CalendarioEvento, CalendarioSugestao } from "@/lib/calendario-types"

const TIPO_LABEL: Record<string, string> = {
  inscricao: "Inscrição",
  prova: "Prova",
  comunidade: "Comunidade",
}

async function authedFetch(input: string, init: RequestInit = {}) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return fetch(input, {
    ...init,
    headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  })
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
}

function EventosTab() {
  const [eventos, setEventos] = useState<CalendarioEvento[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CalendarioEvento | null>(null)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from("calendario_eventos").select("*").order("data", { ascending: false })
    setEventos((data as CalendarioEvento[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const openNew = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (evento: CalendarioEvento) => {
    setEditing(evento)
    setDialogOpen(true)
  }

  const handleToggleAtivo = async (evento: CalendarioEvento) => {
    setEventos((prev) => prev.map((e) => (e.id === evento.id ? { ...e, ativo: !e.ativo } : e)))
    await supabase.from("calendario_eventos").update({ ativo: !evento.ativo }).eq("id", evento.id)
  }

  const handleDelete = async (evento: CalendarioEvento) => {
    if (!confirm(`Excluir o evento "${evento.titulo}"? Essa ação não pode ser desfeita.`)) return
    const { error } = await supabase.from("calendario_eventos").delete().eq("id", evento.id)
    if (error) {
      alert(`Erro ao excluir: ${error.message}`)
      return
    }
    setEventos((prev) => prev.filter((e) => e.id !== evento.id))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="gradient" className="gap-1.5" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Novo Evento
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando eventos...
        </div>
      ) : eventos.length === 0 ? (
        <Card className="border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Nenhum evento cadastrado.
        </Card>
      ) : (
        <div className="space-y-3">
          {eventos.map((evento) => (
            <Card key={evento.id} className="border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{TIPO_LABEL[evento.tipo] ?? evento.tipo}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(`${evento.data}T00:00:00`).toLocaleDateString("pt-BR")}
                      {evento.hora ? ` · ${evento.hora}` : ""}
                    </span>
                  </div>
                  <p className="font-medium text-foreground">{evento.titulo}</p>
                  {evento.descricao && <p className="mt-1 text-sm text-muted-foreground">{evento.descricao}</p>}
                  {evento.link && (
                    <a
                      href={evento.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      {evento.link}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Ativo</span>
                    <Switch checked={evento.ativo} onCheckedChange={() => handleToggleAtivo(evento)} />
                  </div>
                  <Button size="icon-sm" variant="ghost" onClick={() => openEdit(evento)} aria-label="Editar">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(evento)}
                    aria-label="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CalendarioEventoEditDialog open={dialogOpen} onOpenChange={setDialogOpen} evento={editing} onSaved={load} />
    </div>
  )
}

function SugestoesTab() {
  const [sugestoes, setSugestoes] = useState<CalendarioSugestao[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("pendente")
  const [processandoId, setProcessandoId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const res = await authedFetch("/api/admin/calendario-sugestoes")
    if (res.ok) {
      const json = await res.json()
      setSugestoes(json.sugestoes ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    if (filterStatus === "todos") return sugestoes
    return sugestoes.filter((s) => s.status === filterStatus)
  }, [sugestoes, filterStatus])

  const handleModerar = async (id: string, status: "aprovado" | "rejeitado") => {
    setProcessandoId(id)
    const res = await authedFetch(`/api/admin/calendario-sugestoes/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
    setProcessandoId(null)
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      alert(`Erro ao moderar: ${json.error ?? "erro desconhecido"}`)
      return
    }
    const json = await res.json()
    setSugestoes((prev) => prev.map((s) => (s.id === id ? { ...s, ...json.sugestao } : s)))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos ({sugestoes.length})</SelectItem>
            <SelectItem value="pendente">Pendentes ({sugestoes.filter((s) => s.status === "pendente").length})</SelectItem>
            <SelectItem value="aprovado">Aprovadas ({sugestoes.filter((s) => s.status === "aprovado").length})</SelectItem>
            <SelectItem value="rejeitado">Rejeitadas ({sugestoes.filter((s) => s.status === "rejeitado").length})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando sugestões...
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Nenhuma sugestão encontrada.
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <Card key={s.id} className="border border-border bg-card p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant={s.status === "aprovado" ? "default" : s.status === "rejeitado" ? "destructive" : "outline"}>
                  {s.status === "aprovado" ? "Aprovada" : s.status === "rejeitado" ? "Rejeitada" : "Pendente"}
                </Badge>
                <span className="ml-auto text-xs text-muted-foreground">{formatDate(s.created_at)}</span>
              </div>
              <p className="text-sm font-medium text-foreground">
                {s.nome} <span className="font-normal text-muted-foreground">· {s.email}</span>
              </p>
              {s.data_sugerida && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Nova data sugerida: {new Date(`${s.data_sugerida}T00:00:00`).toLocaleDateString("pt-BR")}
                </p>
              )}
              <p className="mt-1.5 text-sm text-foreground">{s.mensagem}</p>

              {s.status === "pendente" && (
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="gradient"
                    className="gap-1.5"
                    disabled={processandoId === s.id}
                    onClick={() => handleModerar(s.id, "aprovado")}
                  >
                    {processandoId === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Marcar como aprovada
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    disabled={processandoId === s.id}
                    onClick={() => handleModerar(s.id, "rejeitado")}
                  >
                    <X className="h-4 w-4" />
                    Rejeitar
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Aprovar uma sugestão só marca ela como revisada — não cria nem edita nenhum evento automaticamente. Use a aba
        "Eventos" pra aplicar a mudança manualmente.
      </p>
    </div>
  )
}

export function AdminCalendarioContent() {
  return (
    <Tabs defaultValue="eventos" className="gap-6">
      <TabsList>
        <TabsTrigger value="eventos">Eventos</TabsTrigger>
        <TabsTrigger value="sugestoes">Sugestões de Alunos</TabsTrigger>
      </TabsList>
      <TabsContent value="eventos">
        <EventosTab />
      </TabsContent>
      <TabsContent value="sugestoes">
        <SugestoesTab />
      </TabsContent>
    </Tabs>
  )
}
