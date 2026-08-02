"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, Loader2, Send, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { AvisoConteudo } from "@/lib/avisos"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const TIPO_LABEL: Record<string, string> = {
  flashcards: "Flashcards",
  videoaulas: "Videoaula",
  resumos: "Resumo",
  desafios_clinicos: "Desafio Clínico",
}

function formatDate(value: string) {
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

export function AdminAvisosContent() {
  const [avisos, setAvisos] = useState<AvisoConteudo[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("pendente")
  const [processandoId, setProcessandoId] = useState<string | null>(null)
  const [edits, setEdits] = useState<Record<string, { titulo: string; mensagem: string }>>({})

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from("avisos_conteudo").select("*").order("created_at", { ascending: false })
    setAvisos((data as AvisoConteudo[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    if (filterStatus === "todos") return avisos
    return avisos.filter((a) => a.status === filterStatus)
  }, [avisos, filterStatus])

  const stats = useMemo(() => {
    const total = avisos.length
    const pendentes = avisos.filter((a) => a.status === "pendente").length
    return { total, pendentes }
  }, [avisos])

  const getEdit = (aviso: AvisoConteudo) => edits[aviso.id] ?? { titulo: aviso.titulo, mensagem: aviso.mensagem }

  const updateEdit = (id: string, field: "titulo" | "mensagem", value: string) => {
    setEdits((prev) => {
      const current = prev[id] ?? { titulo: "", mensagem: "" }
      return { ...prev, [id]: { ...current, [field]: value } }
    })
  }

  const handleEnviar = async (aviso: AvisoConteudo) => {
    const edit = getEdit(aviso)
    if (!edit.titulo.trim() || !edit.mensagem.trim()) {
      alert("Preencha o título e a mensagem do aviso.")
      return
    }
    if (!confirm("Enviar esse aviso para todos os alunos agora?")) return

    setProcessandoId(aviso.id)
    const res = await authedFetch(`/api/admin/avisos/${aviso.id}/enviar`, {
      method: "POST",
      body: JSON.stringify({ titulo: edit.titulo.trim(), mensagem: edit.mensagem.trim() }),
    })
    setProcessandoId(null)

    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      alert(`Erro ao enviar: ${json.error ?? "erro desconhecido"}`)
      return
    }

    const json = await res.json()
    setAvisos((prev) => prev.map((a) => (a.id === aviso.id ? json.aviso : a)))
  }

  const handleDescartar = async (aviso: AvisoConteudo) => {
    if (!confirm("Descartar esse aviso? Ele não será enviado para os alunos.")) return
    setProcessandoId(aviso.id)
    const { error } = await supabase.from("avisos_conteudo").update({ status: "descartado" }).eq("id", aviso.id)
    setProcessandoId(null)

    if (error) {
      alert(`Erro ao descartar: ${error.message}`)
      return
    }
    setAvisos((prev) => prev.map((a) => (a.id === aviso.id ? { ...a, status: "descartado" } : a)))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Avisos de Conteúdo Novo</h2>
          <p className="text-sm text-muted-foreground">
            {stats.total} avisos · {stats.pendentes} pendentes
          </p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos ({avisos.length})</SelectItem>
            <SelectItem value="pendente">
              Pendentes ({avisos.filter((a) => a.status === "pendente").length})
            </SelectItem>
            <SelectItem value="enviado">Enviados ({avisos.filter((a) => a.status === "enviado").length})</SelectItem>
            <SelectItem value="descartado">
              Descartados ({avisos.filter((a) => a.status === "descartado").length})
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando avisos...
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Nenhum aviso encontrado.
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((aviso) => {
            const edit = getEdit(aviso)
            const isPendente = aviso.status === "pendente"
            return (
              <Card key={aviso.id} className="border border-border bg-card p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{TIPO_LABEL[aviso.tipo] ?? aviso.tipo}</Badge>
                  <Badge
                    variant={aviso.status === "enviado" ? "default" : aviso.status === "descartado" ? "destructive" : "outline"}
                  >
                    {aviso.status === "enviado" ? "Enviado" : aviso.status === "descartado" ? "Descartado" : "Pendente"}
                  </Badge>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {aviso.status === "enviado" && aviso.enviado_em
                      ? `Enviado em ${formatDate(aviso.enviado_em)}`
                      : `Criado em ${formatDate(aviso.created_at)}`}
                  </span>
                </div>

                {isPendente ? (
                  <div className="space-y-2">
                    <Input
                      value={edit.titulo}
                      onChange={(e) => updateEdit(aviso.id, "titulo", e.target.value)}
                      placeholder="Título do aviso"
                      className="font-medium"
                    />
                    <Textarea
                      value={edit.mensagem}
                      onChange={(e) => updateEdit(aviso.id, "mensagem", e.target.value)}
                      placeholder="Mensagem do aviso"
                      className="min-h-[70px] text-sm"
                    />
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-foreground">{aviso.titulo}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{aviso.mensagem}</p>
                  </div>
                )}

                {isPendente && (
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="gradient"
                      className="gap-1.5"
                      disabled={processandoId === aviso.id}
                      onClick={() => handleEnviar(aviso)}
                    >
                      {processandoId === aviso.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Enviar para todos os alunos
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-destructive hover:text-destructive"
                      disabled={processandoId === aviso.id}
                      onClick={() => handleDescartar(aviso)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Descartar
                    </Button>
                  </div>
                )}
                {aviso.status === "enviado" && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-success">
                    <Check className="h-3.5 w-3.5" />
                    Enviado para todos os alunos
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
