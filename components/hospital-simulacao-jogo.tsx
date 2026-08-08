"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, Heart, Skull, Wind } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import type { HospitalSimulacaoCaso } from "@/lib/hospital-simulacao-types"

interface HospitalSimulacaoJogoProps {
  caso: HospitalSimulacaoCaso
}

interface RespostaHistorico {
  etapa: number
  letra: string
  impacto_bp: number
}

// Vitais derivados do BP (0-100) pra dar feedback visual em tempo real sem
// exigir dado clinico granular por opcao (o conteudo so tem impacto_bp).
// Direcao clinicamente coerente pra um paciente coronariano descompensando:
// BP caindo -> taquicardia, queda de PA sistolica e de SatO2.
function vitaisDoBp(bp: number) {
  const clamped = Math.max(0, Math.min(100, bp))
  const fc = Math.round(70 + (100 - clamped) * 0.6) // 70 -> 130 bpm
  const pas = Math.round(70 + clamped * 0.6) // 70 -> 130 mmHg
  const sat = Math.round(80 + clamped * 0.19) // 80 -> 99%
  return { fc, pas, sat }
}

export function HospitalSimulacaoJogo({ caso }: HospitalSimulacaoJogoProps) {
  const conteudo = caso.conteudo!
  const [etapaIndex, setEtapaIndex] = useState(0)
  const [bp, setBp] = useState(conteudo.puntos_biologicos_iniciales)
  const [historico, setHistorico] = useState<RespostaHistorico[]>([])
  const [letraEscolhida, setLetraEscolhida] = useState<string | null>(null)
  const [obito, setObito] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  const etapa = conteudo.etapas[etapaIndex]
  const finalizado = obito || etapaIndex >= conteudo.etapas.length
  const vitais = vitaisDoBp(bp)

  const desenlace = useMemo(() => {
    if (!finalizado) return null
    if (bp <= 0) return conteudo.desenlaces_finales.camino_4
    if (bp <= 49) return conteudo.desenlaces_finales.camino_3
    if (bp <= 84) return conteudo.desenlaces_finales.camino_2
    return conteudo.desenlaces_finales.camino_1
  }, [finalizado, bp, conteudo.desenlaces_finales])

  const salvarTentativa = async (bpFinal: number, historicoFinal: RespostaHistorico[], desenlaceTitulo: string) => {
    setSalvando(true)
    const { data: userData } = await supabase.auth.getUser()
    if (userData.user) {
      await supabase.from("hospital_simulacao_tentativas").insert({
        user_id: userData.user.id,
        caso_id: caso.id,
        desenlace: desenlaceTitulo,
        bp_final: bpFinal,
        falecido: bpFinal <= 0,
        dificuldade: 1,
        registro: historicoFinal,
        finalizado_em: new Date().toISOString(),
      })
    }
    setSalvando(false)
    setSalvo(true)
  }

  const escolher = (letra: string) => {
    if (letraEscolhida) return
    setLetraEscolhida(letra)
  }

  const continuar = () => {
    if (!letraEscolhida) return
    const opcao = etapa.opciones[letraEscolhida]
    const novoBp = Math.max(0, Math.min(100, bp + opcao.impacto_bp))
    const novoHistorico = [...historico, { etapa: etapa.numero, letra: letraEscolhida, impacto_bp: opcao.impacto_bp }]
    setHistorico(novoHistorico)
    setBp(novoBp)
    setLetraEscolhida(null)

    if (novoBp <= 0) {
      setObito(true)
      salvarTentativa(novoBp, novoHistorico, conteudo.desenlaces_finales.camino_4.titulo)
      return
    }

    const proximoIndex = etapaIndex + 1
    setEtapaIndex(proximoIndex)
    if (proximoIndex >= conteudo.etapas.length) {
      const rango = novoBp > 85 ? "camino_1" : novoBp >= 50 ? "camino_2" : "camino_3"
      salvarTentativa(novoBp, novoHistorico, conteudo.desenlaces_finales[rango].titulo)
    }
  }

  if (finalizado && desenlace) {
    return (
      <Card className="flex flex-col items-center gap-4 rounded-[24px] border border-border bg-card p-8 text-center sm:p-10">
        {bp <= 0 ? (
          <Skull className="h-12 w-12 text-red-500" />
        ) : (
          <Heart className="h-12 w-12 text-primary" />
        )}
        <div>
          <p className="text-xl font-bold text-foreground">{desenlace.titulo}</p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{desenlace.descripcion}</p>
        </div>
        <div className="rounded-xl border border-border p-4 text-sm">
          <p className="text-xs text-muted-foreground">Pontuação Biológica final</p>
          <p className="text-2xl font-bold text-foreground">{bp} / 100</p>
        </div>
        {salvando && <p className="text-xs text-muted-foreground">Salvando desempenho...</p>}
        {salvo && <p className="text-xs text-emerald-500">Desempenho registrado.</p>}
        <Link href="/dashboard/hospital-simulacao" className="text-sm font-medium text-primary hover:underline">
          Voltar para Hospital Simulação
        </Link>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Monitor de sinais vitais, reage em tempo real ao BP acumulado */}
      <Card className="rounded-[24px] border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Etapa {etapa.numero}/{conteudo.etapas.length} · {etapa.fase}
          </p>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              bp > 70 ? "bg-emerald-500/15 text-emerald-500" : bp > 40 ? "bg-amber-500/15 text-amber-500" : "bg-red-500/15 text-red-500"
            }`}
          >
            BP {bp}/100
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl border border-border p-3">
            <Heart className="mx-auto h-4 w-4 text-red-500" />
            <p className="mt-1 text-lg font-bold tabular-nums text-foreground">{vitais.fc}</p>
            <p className="text-[10px] text-muted-foreground">FC bpm</p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <Activity className="mx-auto h-4 w-4 text-blue-500" />
            <p className="mt-1 text-lg font-bold tabular-nums text-foreground">{vitais.pas}</p>
            <p className="text-[10px] text-muted-foreground">PA sist. mmHg</p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <Wind className="mx-auto h-4 w-4 text-cyan-500" />
            <p className="mt-1 text-lg font-bold tabular-nums text-foreground">{vitais.sat}%</p>
            <p className="text-[10px] text-muted-foreground">SatO₂</p>
          </div>
        </div>
      </Card>

      <AnimatePresence mode="wait">
        <motion.div
          key={etapa.numero}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="rounded-[24px] border border-border bg-card p-6 sm:p-8">
            <p className="text-base leading-relaxed text-foreground">{etapa.descripcion_clinica}</p>

            <div className="mt-6 space-y-3">
              {Object.entries(etapa.opciones).map(([letra, opcao]) => {
                const selecionada = letraEscolhida === letra
                const desabilitado = !!letraEscolhida && !selecionada
                return (
                  <button
                    key={letra}
                    type="button"
                    disabled={!!letraEscolhida}
                    onClick={() => escolher(letra)}
                    className={`w-full rounded-xl border p-4 text-left text-sm transition-colors ${
                      selecionada
                        ? opcao.impacto_bp >= 0
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-red-500 bg-red-500/10"
                        : "border-border hover:bg-secondary"
                    } ${desabilitado ? "opacity-40" : ""}`}
                  >
                    <span className="font-semibold text-foreground">{letra}) </span>
                    <span className="text-foreground">{opcao.texto}</span>
                    {selecionada && (
                      <div className="mt-3 space-y-1 border-t border-border/60 pt-3">
                        <p className={`text-xs font-bold ${opcao.impacto_bp >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                          {opcao.impacto_bp >= 0 ? "+" : ""}
                          {opcao.impacto_bp} BP
                        </p>
                        <p className="text-xs text-muted-foreground">{opcao.feedback}</p>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {letraEscolhida && (
              <div className="mt-6 flex justify-end">
                <Button onClick={continuar}>Continuar</Button>
              </div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
