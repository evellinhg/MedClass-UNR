"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Loader2, Lock, PlayCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import type { HospitalSimulacaoCaso } from "@/lib/hospital-simulacao-types"
import { useLanguage } from "@/lib/i18n"
import { getPlanStatus } from "@/lib/plan-status"

export function HospitalSimulacaoGrid() {
  const { t } = useLanguage()
  const [casos, setCasos] = useState<HospitalSimulacaoCaso[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from("hospital_simulacao_casos").select("*").eq("ativo", true).order("ordem"),
      getPlanStatus(),
    ]).then(([{ data }, planStatus]) => {
      setCasos((data as HospitalSimulacaoCaso[]) ?? [])
      setIsAdmin(planStatus?.isAdmin ?? false)
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
          {casos.map((caso) => {
            const cardContent = (
              <Card
                className={`group flex h-full flex-col overflow-hidden rounded-[24px] border border-border bg-card transition-all ${
                  isAdmin ? "hover:border-red-500/50 hover:shadow-[0_0_24px_-8px_rgba(220,38,38,0.35)]" : "opacity-60"
                }`}
              >
                <div className="relative h-36 w-full overflow-hidden">
                  <Image
                    src="/hospital-simulacao-capa.png"
                    alt=""
                    fill
                    className={`object-cover transition-transform ${isAdmin ? "group-hover:scale-105" : ""}`}
                  />
                  {!isAdmin && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <Lock className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h3 className="text-sm font-semibold leading-snug text-foreground">{caso.titulo}</h3>
                  {caso.descricao && <p className="line-clamp-2 text-xs text-muted-foreground">{caso.descricao}</p>}
                  {isAdmin ? (
                    <span className="mt-auto flex items-center gap-1.5 pt-2 text-xs font-medium text-red-500">
                      <PlayCircle className="h-4 w-4" />
                      {t.hospitalSimulacaoGrid.abrirCaso}
                    </span>
                  ) : (
                    <span className="mt-auto pt-2 text-xs text-muted-foreground">{t.hospitalSimulacaoGrid.bloqueadoCard}</span>
                  )}
                </div>
              </Card>
            )

            if (!isAdmin) {
              return (
                <button
                  key={caso.id}
                  type="button"
                  onClick={() => alert(t.hospitalSimulacaoGrid.acessoRestritoAlerta)}
                  className="cursor-not-allowed text-left"
                >
                  {cardContent}
                </button>
              )
            }

            return (
              <Link key={caso.id} href={`/dashboard/hospital-simulacao/${caso.id}`}>
                {cardContent}
              </Link>
            )
          })}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground/70">{t.hospitalSimulacaoGrid.avisoEducativo}</p>
    </div>
  )
}
