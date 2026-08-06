"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, Loader2, Phone, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PagamentoRow {
  id: string
  email: string
  nome_completo: string | null
  telefone: string | null
  plano: "mensal" | "trimestral"
  valor: number
  status: "pendente" | "aprovado" | "rejeitado" | "cancelado"
  aplicado_em: string | null
  created_at: string
}

const PLANO_LABEL: Record<string, string> = { mensal: "Mensal", trimestral: "Trimestral" }

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

export function AdminPagamentosContent() {
  const [pagamentos, setPagamentos] = useState<PagamentoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("pendente")
  const [processandoId, setProcessandoId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("pagamentos_mercadopago")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
    setPagamentos(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    if (filterStatus === "todos") return pagamentos
    return pagamentos.filter((p) => p.status === filterStatus)
  }, [pagamentos, filterStatus])

  const stats = useMemo(() => {
    const total = pagamentos.length
    const pendentes = pagamentos.filter((p) => p.status === "pendente").length
    return { total, pendentes }
  }, [pagamentos])

  const handleAtualizar = async (id: string, status: "aprovado" | "rejeitado") => {
    setProcessandoId(id)
    const res = await authedFetch(`/api/admin/pagamentos/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
    setProcessandoId(null)

    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      alert(`Erro ao atualizar: ${json.error ?? "erro desconhecido"}`)
      return
    }

    const json = await res.json()
    setPagamentos((prev) => prev.map((p) => (p.id === id ? { ...p, ...json.pagamento } : p)))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Pagamentos (Mercado Pago)</h2>
          <p className="text-sm text-muted-foreground">
            {stats.total} solicitações · {stats.pendentes} pendentes
          </p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos ({pagamentos.length})</SelectItem>
            <SelectItem value="pendente">
              Pendentes ({pagamentos.filter((p) => p.status === "pendente").length})
            </SelectItem>
            <SelectItem value="aprovado">
              Aprovados ({pagamentos.filter((p) => p.status === "aprovado").length})
            </SelectItem>
            <SelectItem value="rejeitado">
              Rejeitados ({pagamentos.filter((p) => p.status === "rejeitado").length})
            </SelectItem>
            <SelectItem value="cancelado">
              Cancelados ({pagamentos.filter((p) => p.status === "cancelado").length})
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando pagamentos...
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Nenhuma solicitação de pagamento encontrada.
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <Card key={p.id} className="border border-border bg-card p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge
                  variant={
                    p.status === "aprovado" ? "default" : p.status === "pendente" ? "outline" : "destructive"
                  }
                >
                  {p.status === "aprovado"
                    ? "Aprovado"
                    : p.status === "rejeitado"
                      ? "Rejeitado"
                      : p.status === "cancelado"
                        ? "Cancelado"
                        : "Pendente"}
                </Badge>
                <Badge variant="secondary">{PLANO_LABEL[p.plano] ?? p.plano}</Badge>
                <span className="text-sm font-medium text-foreground">$ {p.valor.toLocaleString("es-AR")}</span>
                <span className="ml-auto text-xs text-muted-foreground">{formatDate(p.created_at)}</span>
              </div>

              <div className="grid gap-x-4 gap-y-0.5 sm:grid-cols-2">
                <p className="font-medium text-foreground">{p.nome_completo || "(sem nome)"}</p>
                <p className="text-sm text-muted-foreground">{p.email}</p>
                {p.telefone && (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    {p.telefone}
                  </p>
                )}
              </div>

              {p.status === "aprovado" && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {p.aplicado_em
                    ? `Acesso liberado em ${formatDate(p.aplicado_em)}`
                    : "Aprovado — a conta ainda não existe, o acesso será aplicado automaticamente assim que o aluno criar a conta/logar com esse e-mail."}
                </p>
              )}

              {p.status === "pendente" && (
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="gradient"
                    className="gap-1.5"
                    disabled={processandoId === p.id}
                    onClick={() => handleAtualizar(p.id, "aprovado")}
                  >
                    {processandoId === p.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Ativar acesso
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    disabled={processandoId === p.id}
                    onClick={() => handleAtualizar(p.id, "rejeitado")}
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
    </div>
  )
}
