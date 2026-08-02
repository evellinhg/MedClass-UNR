"use client"

import { useEffect, useMemo, useState } from "react"
import { Layers, Loader2, PlayCircle, Pencil, Plus, Search, Trash2, Upload } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { VideoaulaEditDialog, type DialogKind } from "@/components/videoaula-edit-dialog"
import { type VideoaulaDB } from "@/lib/videoaulas-types"
import { getYoutubePlaylistId } from "@/lib/youtube"
import { hexToRgba, NEON_COLORS } from "@/lib/neon-colors"

const FONTE_LABEL: Record<string, string> = {
  unr: "Facultad de Ciencias Médicas – UNR",
  alde: "ALDE",
  propria: "MedClass UNR (própria)",
}

export function AdminVideoaulasContent() {
  const [videoaulas, setVideoaulas] = useState<VideoaulaDB[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogKind, setDialogKind] = useState<DialogKind>("video")
  const [editing, setEditing] = useState<VideoaulaDB | null>(null)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from("materiais_videoaulas").select("*").order("ordem")
    setVideoaulas((data as VideoaulaDB[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return videoaulas
    return videoaulas.filter(
      (v) => v.titulo.toLowerCase().includes(term) || v.especialidade.toLowerCase().includes(term)
    )
  }, [videoaulas, search])

  const openNew = (kind: DialogKind) => {
    setEditing(null)
    setDialogKind(kind)
    setDialogOpen(true)
  }

  const openEdit = (videoaula: VideoaulaDB) => {
    setEditing(videoaula)
    setDialogOpen(true)
  }

  const handleToggleAtivo = async (videoaula: VideoaulaDB) => {
    setVideoaulas((prev) => prev.map((v) => (v.id === videoaula.id ? { ...v, ativo: !v.ativo } : v)))
    await supabase.from("materiais_videoaulas").update({ ativo: !videoaula.ativo }).eq("id", videoaula.id)
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

  const proximaOrdem = videoaulas.length > 0 ? Math.max(...videoaulas.map((v) => v.ordem)) + 1 : 1

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
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-1.5" onClick={() => openNew("playlist")}>
            <Layers className="h-4 w-4" />
            Nova Playlist
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={() => openNew("propria")}>
            <Upload className="h-4 w-4" />
            Playlist Própria
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
                    <Badge variant="outline">{FONTE_LABEL[videoaula.fonte] ?? videoaula.fonte}</Badge>
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

      <VideoaulaEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        videoaula={editing}
        novoTipo={dialogKind}
        proximaOrdem={proximaOrdem}
        onSaved={load}
      />
    </div>
  )
}
