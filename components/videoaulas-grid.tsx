"use client"

import { useEffect, useState } from "react"
import { Clock, Loader2, PlayCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAreaColor } from "@/lib/area-colors"
import type { VideoaulaDB } from "@/lib/videoaulas-types"

export function VideoaulasGrid() {
  const [videoaulas, setVideoaulas] = useState<VideoaulaDB[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from("materiais_videoaulas")
      .select("*")
      .eq("ativo", true)
      .order("ordem")
      .then(({ data }) => {
        setVideoaulas((data as VideoaulaDB[]) ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando...
      </div>
    )
  }

  if (videoaulas.length === 0) {
    return (
      <Card className="border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">Nenhuma videoaula disponível no momento.</p>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {videoaulas.map((videoaula) => {
        const cor = getAreaColor(videoaula.especialidade)
        return (
          <Card
            key={videoaula.id}
            className={`group overflow-hidden border p-0 transition-all ${cor.borderSoft} bg-card ${cor.hoverBorder} ${cor.hoverGlow}`}
          >
            <div className="flex h-28 items-center justify-center bg-gradient-to-br from-[#8b5cf6]/15 to-[#6366f1]/15">
              <PlayCircle className="h-9 w-9 text-primary transition-transform group-hover:scale-110" />
            </div>
            <div className="space-y-2 p-4">
              <Badge variant="secondary" className="text-[11px]">
                {videoaula.especialidade}
              </Badge>
              <h3 className="text-sm font-semibold leading-snug text-foreground">{videoaula.titulo}</h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {videoaula.duracao}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
