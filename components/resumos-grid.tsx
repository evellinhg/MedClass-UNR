"use client"

import { useEffect, useState } from "react"
import { FileText, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAreaIcon } from "@/lib/area-icons"
import { getAreaColor } from "@/lib/area-colors"
import { ResumoDialog } from "@/components/resumo-dialog"
import type { Resumo } from "@/lib/resumos-types"
import { useLanguage } from "@/lib/i18n"

export function ResumosGrid() {
  const { t } = useLanguage()
  const [resumos, setResumos] = useState<Resumo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from("materiais_resumos")
      .select("*")
      .eq("ativo", true)
      .order("ordem")
      .then(({ data }) => {
        setResumos((data as Resumo[]) ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t.resumosGrid.carregando}
      </div>
    )
  }

  if (resumos.length === 0) {
    return (
      <Card className="border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">{t.resumosGrid.vazio}</p>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resumos.map((resumo) => {
          const Icon = getAreaIcon(resumo.especialidade)
          const cor = getAreaColor(resumo.especialidade)
          return (
            <button key={resumo.id} type="button" onClick={() => setSelectedId(resumo.id)} className="text-left">
              <Card
                className={`group overflow-hidden border p-0 transition-all ${cor.borderSoft} bg-card ${cor.hoverBorder} ${cor.hoverGlow}`}
              >
                <div className="flex h-28 items-center justify-center bg-gradient-to-br from-[#c6ff3a]/15 to-[#84cc16]/15">
                  <Icon className="h-9 w-9 text-primary transition-transform group-hover:scale-110" />
                </div>
                <div className="space-y-2 p-4">
                  <Badge variant="secondary" className="text-[11px]">
                    {resumo.especialidade}
                  </Badge>
                  <h3 className="text-sm font-semibold leading-snug text-foreground">{resumo.titulo}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    {resumo.secoes.length} {t.resumosGrid.secoes}
                  </div>
                </div>
              </Card>
            </button>
          )
        })}
      </div>

      <ResumoDialog resumoId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  )
}
