"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getDesafioIcon } from "@/lib/desafio-icons"
import { translations } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { DesafioClinicoEditDialog } from "@/components/desafio-clinico-edit-dialog"
import type { DesafioClinico } from "@/lib/desafios-types"

const desafioSecaoLabel = translations.pt.cronograma.desafioSecaoLabel

export function AdminDesafiosContent() {
  const [desafios, setDesafios] = useState<DesafioClinico[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<DesafioClinico | null>(null)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from("desafios_clinicos").select("*").order("created_at", { ascending: false })
    setDesafios((data as DesafioClinico[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return desafios
    return desafios.filter(
      (d) =>
        d.titulo.toLowerCase().includes(term) ||
        (d.area ?? "").toLowerCase().includes(term) ||
        (desafioSecaoLabel[d.secao ?? ""] ?? "").toLowerCase().includes(term)
    )
  }, [desafios, search])

  const openNew = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (desafio: DesafioClinico) => {
    setEditing(desafio)
    setDialogOpen(true)
  }

  const handleToggleAtivo = async (desafio: DesafioClinico) => {
    setDesafios((prev) => prev.map((d) => (d.id === desafio.id ? { ...d, ativo: !d.ativo } : d)))
    await supabase.from("desafios_clinicos").update({ ativo: !desafio.ativo }).eq("id", desafio.id)
  }

  const handleDelete = async (desafio: DesafioClinico) => {
    if (!confirm(`Excluir o desafio "${desafio.titulo}"? Essa ação não pode ser desfeita.`)) return
    await supabase.from("desafios_clinicos_perguntas").delete().eq("desafio_id", desafio.id)
    const { error } = await supabase.from("desafios_clinicos").delete().eq("id", desafio.id)
    if (error) {
      alert(`Erro ao excluir: ${error.message}`)
      return
    }
    setDesafios((prev) => prev.filter((d) => d.id !== desafio.id))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou área..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="gradient" className="gap-1.5" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Novo Desafio
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando desafios...
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Nenhum desafio encontrado.
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((desafio) => {
            const Icon = getDesafioIcon(desafio.icone)
            return (
              <Card key={desafio.id} className="border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        {desafio.secao && (
                          <Badge variant="outline">{desafioSecaoLabel[desafio.secao] ?? desafio.secao}</Badge>
                        )}
                        {desafio.area && <Badge variant="secondary">{desafio.area}</Badge>}
                      </div>
                      <p className="font-medium text-foreground">{desafio.titulo}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">Ativo</span>
                      <Switch checked={desafio.ativo} onCheckedChange={() => handleToggleAtivo(desafio)} />
                    </div>
                    <Button size="icon-sm" variant="ghost" onClick={() => openEdit(desafio)} aria-label="Editar">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(desafio)}
                      aria-label="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <DesafioClinicoEditDialog open={dialogOpen} onOpenChange={setDialogOpen} desafio={editing} onSaved={load} />
    </div>
  )
}
