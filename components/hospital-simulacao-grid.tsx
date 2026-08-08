"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Loader2, PlayCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import type { HospitalSimulacaoCaso } from "@/lib/hospital-simulacao-types"
import { useLanguage } from "@/lib/i18n"

export function HospitalSimulacaoGrid() {
  const { t } = useLanguage()
  const [casos, setCasos] = useState<HospitalSimulacaoCaso[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from("hospital_simulacao_casos")
      .select("*")
      .eq("ativo", true)
      .order("ordem")
      .then(({ data }) => {
        setCasos((data as HospitalSimulacaoCaso[]) ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t.hospitalSimulacaoGrid.carregando}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t.hospitalSimulacaoGrid.titulo}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t.hospitalSimulacaoGrid.subtitulo}</p>
      </div>

      {casos.length === 0 ? (
        <Card className="border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">{t.hospitalSimulacaoGrid.vazio}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {casos.map((caso) => (
            <Link key={caso.id} href={`/dashboard/hospital-simulacao/${caso.id}`}>
              <Card className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-border bg-card transition-all hover:border-red-500/50 hover:shadow-[0_0_24px_-8px_rgba(220,38,38,0.35)]">
                <div className="relative h-36 w-full overflow-hidden">
                  <Image
                    src="/hospital-simulacao-capa.png"
                    alt=""
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h3 className="text-sm font-semibold leading-snug text-foreground">{caso.titulo}</h3>
                  {caso.descricao && <p className="line-clamp-2 text-xs text-muted-foreground">{caso.descricao}</p>}
                  <span className="mt-auto flex items-center gap-1.5 pt-2 text-xs font-medium text-red-500">
                    <PlayCircle className="h-4 w-4" />
                    {t.hospitalSimulacaoGrid.abrirCaso}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground/70">{t.hospitalSimulacaoGrid.avisoEducativo}</p>
    </div>
  )
}
