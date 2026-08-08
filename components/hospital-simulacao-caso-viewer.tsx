"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import type { HospitalSimulacaoCaso, SimuladorResultado } from "@/lib/hospital-simulacao-types"
import { useLanguage } from "@/lib/i18n"

interface HospitalSimulacaoCasoViewerProps {
  casoId: string
}

export function HospitalSimulacaoCasoViewer({ casoId }: HospitalSimulacaoCasoViewerProps) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [caso, setCaso] = useState<HospitalSimulacaoCaso | null>(null)
  const salvouRef = useRef(false)

  useEffect(() => {
    supabase
      .from("hospital_simulacao_casos")
      .select("*")
      .eq("id", casoId)
      .maybeSingle()
      .then(({ data }) => {
        setCaso((data as HospitalSimulacaoCaso) ?? null)
        setLoading(false)
      })
  }, [casoId])

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (!event.data || event.data.tipo !== "simulador-iamcest:finalizado") return
      if (salvouRef.current) return
      salvouRef.current = true

      const resultado = event.data.resultado as SimuladorResultado
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      await supabase.from("hospital_simulacao_tentativas").insert({
        user_id: userData.user.id,
        caso_id: casoId,
        desenlace: resultado.desenlace,
        camino: resultado.camino,
        bp_final: resultado.bpFinal,
        reserva_excelencia: resultado.reservaExcelencia,
        omissoes: resultado.omisiones,
        iatrogenias: resultado.iatrogenias,
        isquemia_total_min: resultado.isquemiaTotalMin,
        porta_balao_min: resultado.puertaBalonMin,
        miocardio_salvavel: resultado.miocardioSalvable,
        vd_identificado: resultado.vdIdentificado,
        reperfundido: resultado.reperfundido,
        suporte_ventilatorio: resultado.soporteVentilatorio,
        tempo_perdido_min: resultado.tiempoPerdidoMin,
        falecido: resultado.fallecido,
        dificuldade: resultado.dificultad,
        registro: resultado.registro,
        finalizado_em: resultado.finalizadoEn,
      })
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [casoId])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t.hospitalSimulacaoViewer.carregando}
      </div>
    )
  }

  if (!caso) {
    return (
      <Card className="border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">{t.hospitalSimulacaoViewer.naoEncontrado}</p>
        <Link href="/dashboard/hospital-simulacao" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">
          {t.hospitalSimulacaoViewer.voltar}
        </Link>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/dashboard/hospital-simulacao"
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.hospitalSimulacaoViewer.voltar}
        </Link>
        <h1 className="text-sm font-semibold text-foreground">{caso.titulo}</h1>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-border">
        <iframe
          src={caso.arquivo_html}
          className="h-[900px] w-full border-0"
          title={caso.titulo}
          allow="autoplay"
        />
      </div>
    </div>
  )
}
