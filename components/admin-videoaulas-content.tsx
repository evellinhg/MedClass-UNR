"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, PlayCircle, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { AREAS } from "@/lib/quiz-config"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { VideoaulaDB } from "@/lib/videoaulas-types"

interface VideoaulaForm {
  titulo: string
  especialidade: string
  duracao: string
  ordem: number
  ativo: boolean
  tags: string
}

export function AdminVideoaulasContent() {
  const [videoaulas, setVideoaulas] = useState<VideoaulaDB[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<VideoaulaForm>(emptyForm(1))

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from("materiais_videoaulas").select("*").order("ordem")
    setVideoaulas((data as VideoaulaDB[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function emptyForm(proximaOrdem: number): VideoaulaForm {
    return {
      titulo: "",
      especialidade: AREAS[0],
      duracao: "",
      ordem: proximaOrdem,
      ativo: true,
      tags: "",
    }
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return videoaulas
    return videoaulas.filter(
      (v) => v.titulo.toLowerCase().includes(term) || v.especialidade.toLowerCase().includes(term)
    )
  }, [videoaulas, search])

  const openNew = () => {
    const proximaOrdem = videoaulas.length > 0 ? Math.max(...videoaulas.map((v) => v.ordem)) + 1 : 1
    setEditingId(null)
    setForm(emptyForm(proximaOrdem))
    setDialogOpen(true)
  }

  const openEdit = (videoaula: VideoaulaDB) => {
    setEditingId(videoaula.id)
    setForm({
      titulo: videoaula.titulo,
      especialidade: videoaula.especialidade,
      duracao: videoaula.duracao,
      ordem: videoaula.ordem,
      ativo: videoaula.ativo,
      tags: videoaula.tags.join(", "),
    })
    setDialogOpen(true)
  }

  const handleToggleAtivo = async (videoaula: VideoaulaDB) => {
    setVideoaulas((prev) => prev.map((v) => (v.id === videoaula.id ? { ...v, ativo: !v.ativo } : v)))
    await supabase.from("materiais_videoaulas").update({ ativo: !videoaula.ativo }).eq("id", videoaula.id)
  }

  const handleSave = async () => {
    if (!form.titulo.trim()) {
      alert("Preencha o título da videoaula.")
      return
    }
    setSaving(true)
    const payload = {
      titulo: form.titulo.trim(),
      especialidade: form.especialidade,
      duracao: form.duracao.trim(),
      ordem: form.ordem,
      ativo: form.ativo,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    }

    const { error } = editingId
      ? await supabase.from("materiais_videoaulas").update(payload).eq("id", editingId)
      : await supabase.from("materiais_videoaulas").insert(payload)

    setSaving(false)
    if (error) {
      alert(`Erro ao salvar: ${error.message}`)
      return
    }
    setDialogOpen(false)
    load()
  }

  const handleDelete = async (videoaula: VideoaulaDB) => {
    if (!confirm(`Excluir a videoaula "${videoaula.titulo}"? Essa ação não pode ser desfeita.`)) return
    const { error } = await supabase.from("materiais_videoaulas").delete().eq("id", videoaula.id)
    if (error) {
      alert(`Erro ao excluir: ${error.message}`)
      return
    }
    setVideoaulas((prev) => prev.filter((v) => v.id !== videoaula.id))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou especialidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="gradient" className="gap-1.5" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Nova Videoaula
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando videoaulas...
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Nenhuma videoaula encontrada.
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((videoaula) => (
            <Card key={videoaula.id} className="border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{videoaula.especialidade}</Badge>
                    <Badge variant="outline">Ordem {videoaula.ordem}</Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <PlayCircle className="h-3.5 w-3.5" />
                      {videoaula.duracao}
                    </span>
                  </div>
                  <p className="font-medium text-foreground">{videoaula.titulo}</p>
                  {videoaula.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {videoaula.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Ativo</span>
                    <Switch checked={videoaula.ativo} onCheckedChange={() => handleToggleAtivo(videoaula)} />
                  </div>
                  <Button size="icon-sm" variant="ghost" onClick={() => openEdit(videoaula)} aria-label="Editar">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(videoaula)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Videoaula" : "Nova Videoaula"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={form.titulo}
                onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
                placeholder="Ex: Insuficiência Cardíaca Congestiva"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Especialidade</Label>
                <Select value={form.especialidade} onValueChange={(v) => setForm((p) => ({ ...p, especialidade: v }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AREAS.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="duracao">Duração</Label>
                <Input
                  id="duracao"
                  value={form.duracao}
                  onChange={(e) => setForm((p) => ({ ...p, duracao: e.target.value }))}
                  placeholder="Ex: 42 min"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ordem">Ordem de exibição</Label>
                <Input
                  id="ordem"
                  type="number"
                  min={1}
                  value={form.ordem}
                  onChange={(e) => setForm((p) => ({ ...p, ordem: Number(e.target.value) || 1 }))}
                />
              </div>
              <div className="flex items-end gap-2 pb-2">
                <Switch checked={form.ativo} onCheckedChange={(v) => setForm((p) => ({ ...p, ativo: v }))} />
                <Label>Visível para os alunos</Label>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
              <p className="text-xs text-muted-foreground">
                Usadas na busca da plataforma. Inclua o tema central e a especialidade.
              </p>
              <Input
                id="tags"
                value={form.tags}
                onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                placeholder="Ex: Insuficiência Cardíaca, Clínica Médica"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="gradient" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Videoaula"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
