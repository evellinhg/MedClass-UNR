"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, MessageSquare, Send } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FeedbackRow {
  id: string
  user_id: string
  tipo: string
  materia: string
  mensagem: string
  status: "pendente" | "respondido"
  resposta_admin: string | null
  respondido_em: string | null
  created_at: string
  usuario: { id: string; email: string; full_name: string | null } | null
}

const TIPO_LABEL: Record<string, string> = {
  duvida: "Dúvida",
  sugestao: "Sugestão",
  erro: "Erro",
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

export function AdminFeedbacksContent() {
  const [feedbacks, setFeedbacks] = useState<FeedbackRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("todos")
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [enviandoId, setEnviandoId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const res = await authedFetch("/api/admin/feedbacks")
    if (res.ok) {
      const json = await res.json()
      setFeedbacks(json.feedbacks ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    if (filterStatus === "todos") return feedbacks
    return feedbacks.filter((f) => f.status === filterStatus)
  }, [feedbacks, filterStatus])

  const stats = useMemo(() => {
    const total = feedbacks.length
    const pendentes = feedbacks.filter((f) => f.status === "pendente").length
    return { total, pendentes }
  }, [feedbacks])

  const handleResponder = async (id: string) => {
    const resposta = (respostas[id] ?? "").trim()
    if (!resposta) return

    setEnviandoId(id)
    const res = await authedFetch(`/api/admin/feedbacks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ resposta_admin: resposta }),
    })
    setEnviandoId(null)

    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      alert(`Erro ao responder: ${json.error ?? "erro desconhecido"}`)
      return
    }

    const json = await res.json()
    setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, ...json.feedback } : f)))
    setRespostas((prev) => ({ ...prev, [id]: "" }))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Feedbacks dos Usuários</h2>
          <p className="text-sm text-muted-foreground">
            {stats.total} feedbacks · {stats.pendentes} pendentes
          </p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos ({feedbacks.length})</SelectItem>
            <SelectItem value="pendente">
              Pendentes ({feedbacks.filter((f) => f.status === "pendente").length})
            </SelectItem>
            <SelectItem value="respondido">
              Respondidos ({feedbacks.filter((f) => f.status === "respondido").length})
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando feedbacks...
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Nenhum feedback encontrado.
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => (
            <Card key={f.id} className="border border-border bg-card p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{TIPO_LABEL[f.tipo] ?? f.tipo}</Badge>
                <Badge variant="outline">{f.materia}</Badge>
                <Badge variant={f.status === "respondido" ? "default" : "outline"}>
                  {f.status === "respondido" ? "Respondido" : "Pendente"}
                </Badge>
                <span className="ml-auto text-xs text-muted-foreground">{formatDate(f.created_at)}</span>
              </div>

              <p className="mb-1 text-xs text-muted-foreground">
                {f.usuario?.full_name || f.usuario?.email || `Usuário ${f.user_id.slice(0, 8)}`}
              </p>
              <p className="font-medium text-foreground">{f.mensagem}</p>

              {f.status === "respondido" && f.resposta_admin && (
                <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Sua resposta {f.respondido_em ? `· ${formatDate(f.respondido_em)}` : ""}
                  </p>
                  <p className="text-sm text-foreground">{f.resposta_admin}</p>
                </div>
              )}

              {f.status === "pendente" && (
                <div className="mt-3 flex items-start gap-2">
                  <Textarea
                    value={respostas[f.id] ?? ""}
                    onChange={(e) => setRespostas((prev) => ({ ...prev, [f.id]: e.target.value }))}
                    placeholder="Escreva a resposta que o usuário vai ver..."
                    className="min-h-[70px] text-sm"
                  />
                  <Button
                    size="sm"
                    variant="gradient"
                    className="mt-1 shrink-0 gap-1.5"
                    disabled={enviandoId === f.id || !(respostas[f.id] ?? "").trim()}
                    onClick={() => handleResponder(f.id)}
                  >
                    {enviandoId === f.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Responder
                      </>
                    )}
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
