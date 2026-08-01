"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Check, Loader2, Trash2, User, X } from "lucide-react"
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

interface DepoimentoRow {
  id: string
  nome: string
  ano_cursado: string
  foto_path: string | null
  comentario: string
  status: "pendente" | "aprovado" | "rejeitado"
  created_at: string
  moderado_em: string | null
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

export function AdminDepoimentosContent() {
  const [depoimentos, setDepoimentos] = useState<DepoimentoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("pendente")
  const [processandoId, setProcessandoId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const res = await authedFetch("/api/admin/depoimentos")
    if (res.ok) {
      const json = await res.json()
      setDepoimentos(json.depoimentos ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    if (filterStatus === "todos") return depoimentos
    return depoimentos.filter((d) => d.status === filterStatus)
  }, [depoimentos, filterStatus])

  const stats = useMemo(() => {
    const total = depoimentos.length
    const pendentes = depoimentos.filter((d) => d.status === "pendente").length
    return { total, pendentes }
  }, [depoimentos])

  const handleModerar = async (id: string, status: "aprovado" | "rejeitado") => {
    setProcessandoId(id)
    const res = await authedFetch(`/api/admin/depoimentos/${id}`, {
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
    setDepoimentos((prev) => prev.map((d) => (d.id === id ? { ...d, ...json.depoimento } : d)))
  }

  const handleExcluir = async (id: string) => {
    if (!confirm("Excluir este depoimento definitivamente?")) return
    setProcessandoId(id)
    const res = await authedFetch(`/api/admin/depoimentos/${id}`, { method: "DELETE" })
    setProcessandoId(null)

    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      alert(`Erro ao excluir: ${json.error ?? "erro desconhecido"}`)
      return
    }
    setDepoimentos((prev) => prev.filter((d) => d.id !== id))
  }

  const fotoUrl = (path: string) =>
    supabase.storage.from("depoimentos-fotos").getPublicUrl(path).data.publicUrl

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Depoimentos da Landing Page</h2>
          <p className="text-sm text-muted-foreground">
            {stats.total} depoimentos · {stats.pendentes} pendentes
          </p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos ({depoimentos.length})</SelectItem>
            <SelectItem value="pendente">
              Pendentes ({depoimentos.filter((d) => d.status === "pendente").length})
            </SelectItem>
            <SelectItem value="aprovado">
              Aprovados ({depoimentos.filter((d) => d.status === "aprovado").length})
            </SelectItem>
            <SelectItem value="rejeitado">
              Rejeitados ({depoimentos.filter((d) => d.status === "rejeitado").length})
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando depoimentos...
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Nenhum depoimento encontrado.
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <Card key={d.id} className="border border-border bg-card p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge
                  variant={d.status === "aprovado" ? "default" : d.status === "rejeitado" ? "destructive" : "outline"}
                >
                  {d.status === "aprovado" ? "Aprovado" : d.status === "rejeitado" ? "Rejeitado" : "Pendente"}
                </Badge>
                <span className="ml-auto text-xs text-muted-foreground">{formatDate(d.created_at)}</span>
              </div>

              <div className="flex items-start gap-3">
                {d.foto_path ? (
                  <Image
                    src={fotoUrl(d.foto_path)}
                    alt={d.nome}
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <User className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{d.nome}</p>
                  <p className="text-xs text-muted-foreground">{d.ano_cursado}</p>
                  <p className="mt-1.5 text-sm text-foreground">{d.comentario}</p>
                </div>
              </div>

              {d.status === "pendente" && (
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="gradient"
                    className="gap-1.5"
                    disabled={processandoId === d.id}
                    onClick={() => handleModerar(d.id, "aprovado")}
                  >
                    {processandoId === d.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    disabled={processandoId === d.id}
                    onClick={() => handleModerar(d.id, "rejeitado")}
                  >
                    <X className="h-4 w-4" />
                    Rejeitar
                  </Button>
                </div>
              )}
              {d.status !== "pendente" && (
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-destructive hover:text-destructive"
                    disabled={processandoId === d.id}
                    onClick={() => handleExcluir(d.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
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
