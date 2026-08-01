"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Info, Loader2, PlayCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VIDEOAULA_FONTE_KEYS, type VideoaulaArquivoDB, type VideoaulaDB } from "@/lib/videoaulas-types"
import { getYoutubeEmbedUrl, getYoutubePlaylistId } from "@/lib/youtube"
import { NEON_COLORS, hexToRgba } from "@/lib/neon-colors"
import { useLanguage } from "@/lib/i18n"

interface PlaylistVideo {
  videoId: string
  title: string
  thumbnail: string
}

interface VideoItem {
  key: string
  title: string
  thumbnail: string | null
  embedUrl: string
  type: "youtube" | "file"
}

function VideoCard({ video, onPlay }: { video: VideoItem; onPlay: () => void }) {
  return (
    <button type="button" onClick={onPlay} className="w-64 shrink-0 text-left sm:w-72">
      <Card className="group overflow-hidden rounded-[24px] border border-border bg-card p-0 transition-all hover:border-primary/50 hover:shadow-lg">
        <div className="relative aspect-video w-full bg-black">
          {video.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#c6ff3a]/15 to-[#84cc16]/15">
              <PlayCircle className="h-8 w-8 text-primary" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
            <PlayCircle className="h-10 w-10 text-white opacity-0 drop-shadow-lg transition-opacity group-hover:opacity-100" />
          </div>
        </div>
        <div className="p-3">
          <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">{video.title}</p>
        </div>
      </Card>
    </button>
  )
}

function VideoRow({ videos, onPlay }: { videos: VideoItem[]; onPlay: (video: VideoItem) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateArrows = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    updateArrows()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos])

  const scrollByPage = (direction: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: direction * scrollRef.current.clientWidth * 0.85, behavior: "smooth" })
  }

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          aria-label="Rolar para a esquerda"
          className="absolute -left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#c6ff3a] text-[#0a1f00] shadow-md transition-colors hover:bg-[#84cc16]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      <div
        ref={scrollRef}
        onScroll={updateArrows}
        className="-mx-1 flex gap-4 overflow-x-auto scroll-smooth px-1 pb-2"
      >
        {videos.map((video) => (
          <VideoCard key={video.key} video={video} onPlay={() => onPlay(video)} />
        ))}
      </div>
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByPage(1)}
          aria-label="Rolar para a direita"
          className="absolute -right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#c6ff3a] text-[#0a1f00] shadow-md transition-colors hover:bg-[#84cc16]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export function VideoaulasGrid() {
  const { t, lang } = useLanguage()
  const [videoaulas, setVideoaulas] = useState<VideoaulaDB[]>([])
  const [loading, setLoading] = useState(true)
  const [playlistItems, setPlaylistItems] = useState<Record<string, PlaylistVideo[] | "loading" | "error">>({})
  const [arquivosItems, setArquivosItems] = useState<Record<string, VideoaulaArquivoDB[] | "loading" | "error">>({})
  const [playing, setPlaying] = useState<VideoItem | null>(null)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  useEffect(() => {
    supabase
      .from("materiais_videoaulas")
      .select("*")
      .eq("ativo", true)
      .order("ordem")
      .then(({ data }) => {
        const list = (data as VideoaulaDB[]) ?? []
        setVideoaulas(list)
        setCollapsed(new Set(list.map((v) => v.id)))
        setLoading(false)
      })
  }, [])

  const toggleSection = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  useEffect(() => {
    videoaulas.forEach((videoaula) => {
      if (collapsed.has(videoaula.id)) return

      if (videoaula.fonte === "propria") {
        if (arquivosItems[videoaula.id]) return
        setArquivosItems((prev) => ({ ...prev, [videoaula.id]: "loading" }))
        supabase
          .from("materiais_videoaulas_arquivos")
          .select("*")
          .eq("videoaula_id", videoaula.id)
          .order("ordem")
          .then(({ data, error }) => {
            setArquivosItems((prev) => ({
              ...prev,
              [videoaula.id]: error ? "error" : ((data as VideoaulaArquivoDB[]) ?? []),
            }))
          })
        return
      }

      if (!videoaula.youtube_url) return
      const listId = getYoutubePlaylistId(videoaula.youtube_url)
      if (!listId || playlistItems[videoaula.id]) return

      setPlaylistItems((prev) => ({ ...prev, [videoaula.id]: "loading" }))
      fetch(`/api/youtube/playlist?list=${encodeURIComponent(listId)}`)
        .then((res) => res.json())
        .then((json) => {
          setPlaylistItems((prev) => ({ ...prev, [videoaula.id]: json.items ?? "error" }))
        })
        .catch(() => {
          setPlaylistItems((prev) => ({ ...prev, [videoaula.id]: "error" }))
        })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoaulas, collapsed])

  const aviso = t.videoaulasGrid.aviso

  const avisoBox = (
    <div className="relative overflow-hidden rounded-2xl border border-[#c6ff3a]/40 bg-[#c6ff3a]/[0.04] p-5 shadow-[0_0_24px_-8px_rgba(198,255,58,0.35)]">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#c6ff3a]/40 bg-[#c6ff3a]/10 text-[#bef264]">
          <Info className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-foreground">{aviso.titulo}</p>
          <p className="text-sm text-muted-foreground">{aviso.paragrafo1}</p>
          <p className="text-sm text-muted-foreground">{aviso.paragrafo2}</p>
          <p className="text-sm text-muted-foreground">{aviso.paragrafo3}</p>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        {avisoBox}
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t.videoaulasGrid.carregando}
        </div>
      </div>
    )
  }

  if (videoaulas.length === 0) {
    return (
      <div className="space-y-6">
        {avisoBox}
        <Card className="border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">{t.videoaulasGrid.vazio}</p>
        </Card>
      </div>
    )
  }

  const grupos = VIDEOAULA_FONTE_KEYS.map((fonteKey) => ({
    fonteKey,
    items: videoaulas
      .map((videoaula, index) => ({ videoaula, index }))
      .filter(({ videoaula }) => (videoaula.fonte || "unr") === fonteKey),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="space-y-8">
      {avisoBox}
      {grupos.map(({ fonteKey, items }) => (
        <div key={fonteKey} className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">{t.videoaulasGrid.fonteLabel[fonteKey] ?? fonteKey}</h2>
          <div className="space-y-8">
            {items.map(({ videoaula, index }) => {
              const color = videoaula.cor_hex || NEON_COLORS[index % NEON_COLORS.length].hex
              const listId = videoaula.youtube_url ? getYoutubePlaylistId(videoaula.youtube_url) : null
              const titulo = (lang === "es" && videoaula.titulo_es) || videoaula.titulo
              const especialidade = (lang === "es" && videoaula.especialidade_es) || videoaula.especialidade

              let videos: VideoItem[] = []
              let sectionStatus: "ok" | "loading" | "error" = "ok"

              if (videoaula.fonte === "propria") {
                const arquivoData = arquivosItems[videoaula.id]
                if (arquivoData === "loading" || arquivoData === undefined) {
                  sectionStatus = "loading"
                } else if (arquivoData === "error") {
                  sectionStatus = "error"
                } else {
                  videos = arquivoData.map((arquivo) => ({
                    key: arquivo.id,
                    title: arquivo.titulo,
                    thumbnail: null,
                    embedUrl: supabase.storage.from("videoaulas-arquivos").getPublicUrl(arquivo.arquivo_path).data.publicUrl,
                    type: "file",
                  }))
                }
              } else if (listId) {
                const playlistData = playlistItems[videoaula.id]
                if (playlistData === "loading" || playlistData === undefined) {
                  sectionStatus = "loading"
                } else if (playlistData === "error") {
                  sectionStatus = "error"
                } else {
                  videos = playlistData.map((item) => ({
                    key: item.videoId,
                    title: item.title,
                    thumbnail: item.thumbnail,
                    embedUrl: `https://www.youtube-nocookie.com/embed/${item.videoId}`,
                    type: "youtube",
                  }))
                }
              } else if (videoaula.youtube_url) {
                const embedUrl = getYoutubeEmbedUrl(videoaula.youtube_url)
                if (embedUrl) {
                  videos = [{ key: videoaula.id, title: titulo, thumbnail: null, embedUrl, type: "youtube" }]
                }
              }

              const isOpen = !collapsed.has(videoaula.id)

              return (
                <section key={videoaula.id}>
                  <button
                    type="button"
                    onClick={() => toggleSection(videoaula.id)}
                    className="mb-3 flex w-full items-center justify-between gap-2 rounded-2xl border-2 px-4 py-3 text-left transition-transform hover:scale-[1.005]"
                    style={{
                      borderColor: hexToRgba(color, 0.5),
                      backgroundColor: hexToRgba(color, 0.06),
                      boxShadow: `0 0 20px -8px ${hexToRgba(color, 0.6)}`,
                    }}
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <Badge
                        className="border-0 text-[11px]"
                        style={{ backgroundColor: hexToRgba(color, 0.18), color }}
                      >
                        {especialidade}
                      </Badge>
                      <h3 className="text-base font-semibold text-foreground">{titulo}</h3>
                      {isOpen && videos.length > 0 && (
                        <Badge
                          variant="outline"
                          className="text-[11px]"
                          style={{ borderColor: hexToRgba(color, 0.4), color }}
                        >
                          {videos.length}
                        </Badge>
                      )}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 shrink-0" style={{ color }} />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0" style={{ color }} />
                    )}
                  </button>

                  {isOpen &&
                    (sectionStatus === "loading" ? (
                      <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t.videoaulasGrid.carregandoPlaylist}
                      </div>
                    ) : sectionStatus === "error" ? (
                      <p className="py-6 text-sm text-muted-foreground">{t.videoaulasGrid.erroPlaylist}</p>
                    ) : videos.length > 0 ? (
                      <VideoRow videos={videos} onPlay={setPlaying} />
                    ) : (
                      <Card className="flex h-28 items-center justify-center border border-dashed border-border bg-card">
                        <PlayCircle className="h-8 w-8 text-muted-foreground" />
                      </Card>
                    ))}
                </section>
              )
            })}
          </div>
        </div>
      ))}

      <Dialog open={!!playing} onOpenChange={(open) => !open && setPlaying(null)}>
        <DialogContent className="max-w-3xl overflow-hidden p-0 sm:max-w-3xl">
          <DialogTitle className="sr-only">{playing?.title}</DialogTitle>
          {playing &&
            (playing.type === "file" ? (
              <div className="aspect-video w-full bg-black">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video src={playing.embedUrl} controls autoPlay className="h-full w-full" />
              </div>
            ) : (
              <div className="aspect-video w-full bg-black">
                <iframe
                  src={playing.embedUrl}
                  title={playing.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            ))}
        </DialogContent>
      </Dialog>
    </div>
  )
}
