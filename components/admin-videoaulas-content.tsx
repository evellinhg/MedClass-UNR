"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, Layers, Loader2, PlayCircle, Pencil, Plus, Search, Trash2 } from "lucide-react"
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
import { getYoutubeEmbedUrl, getYoutubePlaylistId } from "@/lib/youtube"
import { NEON_COLORS, hexToRgba } from "@/lib/neon-colors"

interface VideoaulaForm {
  titulo: string
  especialidade: string
  duracao: string
  ordem: number
  ativo: boolean
  tags: string
  youtubeUrl: string
  corHex: string
}

export function AdminVideoaulasContent() {
  const [videoaulas, setVideoaulas] = useState<VideoaulaDB[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogKind, setDialogKind] = useState<"video" | "playlist">("video")
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
      youtubeUrl: "",
      corHex: NEON_COLORS[0].hex,
    }
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return videoaulas
    return videoaulas.filter(
      (v) => v.titulo.toLowerCase().includes(term) || v.especialidade.toLowerCase().includes(term)
    )
  }, [videoaulas, search])

  const openNew = (kind: "video" | "playlist") => {
    const proximaOrdem = videoaulas.length > 0 ? Math.max(...videoaulas.map((v) => v.ordem)) + 1 : 1
    setEditingId(null)
    setDialogKind(kind)
    setForm(emptyForm(proximaOrdem))
    setDialogOpen(true)
  }

  const openEdit = (videoaula: VideoaulaDB) => {
    setEditingId(videoaula.id)
    setDialogKind(getYoutubePlaylistId(videoaula.youtube_url ?? "") ? "playlist" : "video")
    setForm({
      titulo: videoaula.titulo,
      especialidade: videoaula.especialidade,
      duracao: videoaula.duracao,
      ordem: videoaula.ordem,
      ativo: videoaula.ativo,
      tags: videoaula.tags.join(", "),
      youtubeUrl: videoaula.youtube_url ?? "",
      corHex: videoaula.cor_hex ?? NEON_COLORS[0].hex,
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
    const youtubeUrl = form.youtubeUrl.trim()
    if (youtubeUrl && !getYoutubeEmbedUrl(youtubeUrl)) {
      alert("Link do YouTube inválido. Cole o link de uma playlist (youtube.com/playlist?list=...) ou de um vídeo (youtube.com/watch?v=... ou youtu.be/...).")
      return
    }
    if (dialogKind === "playlist" && youtubeUrl && !getYoutubePlaylistId(youtubeUrl)) {
      alert("Esse link não é de uma playlist. Cole um link no formato youtube.com/playlist?list=...")
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
      youtube_url: youtubeUrl || null,
      cor_hex: form.corHex,
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
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1.5" onClick={() => openNew("playlist")}>
            <Layers className="h-4 w-4" />
            Nova Playlist
          </Button>
          <Button variant="gradient" className="gap-1.5" onClick={() => openNew("video")}>
            <Plus className="h-4 w-4" />
            Nova Videoaula
          </Button>
        </div>
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
          {filtered.map((videoaula) => {
            const isPlaylist = !!getYoutubePlaylistId(videoaula.youtube_url ?? "")
            const cor = videoaula.cor_hex ?? NEON_COLORS[0].hex
            return (
            <Card key={videoaula.id} className="border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {videoaula.youtube_url && (
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: cor, boxShadow: `0 0 6px ${hexToRgba(cor, 0.8)}` }}
                        title="Cor de classificação"
                      />
                    )}
                    <Badge variant="secondary">{videoaula.especialidade}</Badge>
                    <Badge variant="outline">Ordem {videoaula.ordem}</Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <PlayCircle className="h-3.5 w-3.5" />
                      {videoaula.duracao}
                    </span>
                    {videoaula.youtube_url && (
                      <Badge variant="secondary" className="gap-1 bg-red-500/10 text-red-500">
                        {isPlaylist ? "Playlist" : "Vídeo"}
                      </Badge>
                    )}
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
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Videoaula" : dialogKind === "playlist" ? "Nova Playlist" : "Nova Videoaula"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={form.titulo}
                onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
                placeholder={
                  dialogKind === "playlist" ? "Ex: Playlist Oficial UNR — 4º Ano" : "Ex: Insuficiência Cardíaca Congestiva"
                }
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

            <div className="space-y-1.5">
              <Label htmlFor="youtubeUrl">
                {dialogKind === "playlist" ? "Link da playlist do YouTube" : "Link do YouTube (playlist ou vídeo)"}
              </Label>
              <p className="text-xs text-muted-foreground">
                {dialogKind === "playlist"
                  ? "Cole o link da playlist inteira (youtube.com/playlist?list=...). Os vídeos aparecem lado a lado para os alunos."
                  : "Cole o link de uma playlist (youtube.com/playlist?list=...) ou de um vídeo específico. Fica incorporado direto na página."}
              </p>
              <Input
                id="youtubeUrl"
                value={form.youtubeUrl}
                onChange={(e) => setForm((p) => ({ ...p, youtubeUrl: e.target.value }))}
                placeholder="https://www.youtube.com/playlist?list=..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Cor de classificação (neon)</Label>
              <p className="text-xs text-muted-foreground">
                Usada para destacar essa {dialogKind === "playlist" ? "playlist" : "videoaula"} na página de Materiais.
              </p>
              <div className="flex flex-wrap gap-2">
                {NEON_COLORS.map((c) => {
                  const selected = form.corHex === c.hex
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      title={c.label}
                      onClick={() => setForm((p) => ({ ...p, corHex: c.hex }))}
                      className="flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c.hex,
                        boxShadow: selected ? `0 0 0 2px var(--background), 0 0 0 4px ${c.hex}` : `0 0 8px ${hexToRgba(c.hex, 0.6)}`,
                      }}
                    >
                      {selected && <Check className="h-4 w-4 text-black/70" />}
                    </button>
                  )
                })}
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
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : dialogKind === "playlist" ? "Salvar Playlist" : "Salvar Videoaula"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
