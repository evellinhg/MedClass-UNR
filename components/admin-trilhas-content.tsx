"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, Plus, Route, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { CronogramaTrilha } from "@/lib/cronograma-types"

export function AdminTrilhasContent() {
  const [trilhas, setTrilhas] = useState<CronogramaTrilha[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const { data } = await supabase.from("cronograma_trilhas").select("*").order("created_at", { ascending: false })
    setTrilhas((data as CronogramaTrilha[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async () => {
    if (!nome.trim()) return
    setSaving(true)
    const { error } = await supabase
      .from("cronograma_trilhas")
      .insert({ nome: nome.trim(), descricao: descricao.trim() || null })
    setSaving(false)
    if (error) {
      alert(`Erro ao criar trilha: ${error.message}`)
      return
    }
    setNome("")
    setDescricao("")
    setDialogOpen(false)
    load()
  }

  const handleToggleAtivo = async (trilha: CronogramaTrilha) => {
    setTrilhas((prev) => prev.map((t) => (t.id === trilha.id ? { ...t, ativo: !t.ativo } : t)))
    await supabase.from("cronograma_trilhas").update({ ativo: !trilha.ativo }).eq("id", trilha.id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta trilha? Isso remove todas as unidades e etapas associadas.")) return
    await supabase.from("cronograma_trilhas").delete().eq("id", id)
    setTrilhas((prev) => prev.filter((t) => t.id !== id))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando trilhas...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient-brand">Trilhas de Cronograma</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Monte trilhas de treinamento com etapas (simulados ou desafios clínicos) em ordem.
          </p>
        </div>
        <Button variant="gradient" onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Trilha
        </Button>
      </div>

      {trilhas.length === 0 ? (
        <Card className="border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">Nenhuma trilha criada ainda.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trilhas.map((trilha) => (
            <Card key={trilha.id} className="border border-border bg-card p-5">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Route className="h-5 w-5 text-primary" />
                </div>
                <button
                  onClick={() => handleDelete(trilha.id)}
                  className="rounded-lg p-1.5 text-destructive transition-colors hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <h3 className="font-semibold text-foreground">{trilha.nome}</h3>
              {trilha.descricao && <p className="mt-1 text-xs text-muted-foreground">{trilha.descricao}</p>}
              <div className="mt-3 flex items-center gap-1.5">
                <Switch checked={trilha.ativo} onCheckedChange={() => handleToggleAtivo(trilha)} />
                <span className="text-xs text-muted-foreground">Ativa</span>
              </div>
              <Link href={`/admin/trilhas/${trilha.id}`}>
                <Button variant="outline" size="sm" className="mt-4 w-full">
                  Gerenciar
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nova Trilha</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              autoFocus
              placeholder="Ex: Revalida 2026.1"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <Textarea
              placeholder="Descrição (opcional)"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
            <Button variant="gradient" className="w-full gap-2" onClick={handleCreate} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Criar Trilha
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
