"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, Heart, Skull } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import type { HospitalSimulacaoCaso, HospitalSimulacaoDesenlaceInfo } from "@/lib/hospital-simulacao-types"
import { HOSPITAL_SIMULACAO_ETAPA_INICIAL } from "@/lib/hospital-simulacao-types"
import { HospitalSimulacaoMonitor } from "@/components/hospital-simulacao-monitor"

interface HospitalSimulacaoJogoProps {
  caso: HospitalSimulacaoCaso
}

interface RespostaHistorico {
  etapa: string
  letra: string
  impacto_bp: number
}

const TOTAL_ETAPAS_REFERENCIA = 19

function clampVital(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

export function HospitalSimulacaoJogo({ caso }: HospitalSimulacaoJogoProps) {
  const conteudo = caso.conteudo!
  const { regras_globais: regras } = conteudo

  const [etapaId, setEtapaId] = useState(HOSPITAL_SIMULACAO_ETAPA_INICIAL)
  const [bp, setBp] = useState(conteudo.puntos_biologicos_iniciales)
  const [vitais, setVitais] = useState({ fc: conteudo.vitais_base.fc, pas: conteudo.vitais_base.pas, spo2: conteudo.vitais_base.spo2 })
  const [historico, setHistorico] = useState<RespostaHistorico[]>([])
  const [letraEscolhida, setLetraEscolhida] = useState<string | null>(null)
  const [desfecho, setDesfecho] = useState<{ info: HospitalSimulacaoDesenlaceInfo; falecido: boolean } | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [segundosNaEtapa, setSegundosNaEtapa] = useState(0)

  const etapa = conteudo.etapas[etapaId]
  const finalizado = !!desfecho

  // Enquanto o aluno delibera (sem responder ainda), o quadro do paciente
  // continua se deteriorando -- tempo de decisao tem custo clinico real,
  // igual numa guardia de verdade. Reseta a cada etapa nova; para assim que
  // a alternativa e escolhida. Os coeficientes vem do proprio conteudo do
  // caso (regras_globais.custo_tempo_segundo), nao sao fixos no codigo.
  useEffect(() => {
    if (finalizado || letraEscolhida) return
    const intervalo = setInterval(() => {
      setSegundosNaEtapa((s) => s + 1)
      setVitais((v) => ({
        fc: clampVital(v.fc + regras.custo_tempo_segundo.fc, 30, 180),
        pas: clampVital(v.pas + regras.custo_tempo_segundo.pas, 40, 180),
        spo2: clampVital(v.spo2 + regras.custo_tempo_segundo.spo2, 60, 100),
      }))
    }, 1000)
    return () => clearInterval(intervalo)
  }, [finalizado, letraEscolhida, etapaId, regras.custo_tempo_segundo])

  useEffect(() => {
    setSegundosNaEtapa(0)
  }, [etapaId])

  const stElevacao = Math.max(0, Math.min(1, (85 - bp) / 85))
  const g = regras.gatilho_alarme_critico
  const critico =
    vitais.pas < g.pas_menor_que || vitais.spo2 < g.spo2_menor_que || vitais.fc > g.fc_maior_que || vitais.fc < g.fc_menor_que || bp <= g.bp_menor_ou_igual_a

  const salvarTentativa = async (bpFinal: number, historicoFinal: RespostaHistorico[], info: HospitalSimulacaoDesenlaceInfo, falecido: boolean) => {
    setSalvando(true)
    const { data: userData } = await supabase.auth.getUser()
    if (userData.user) {
      await supabase.from("hospital_simulacao_tentativas").insert({
        user_id: userData.user.id,
        caso_id: caso.id,
        desenlace: info.titulo,
        camino: info.camino ?? null,
        bp_final: bpFinal,
        falecido,
        dificuldade: 1,
        registro: historicoFinal,
        finalizado_em: new Date().toISOString(),
      })
    }
    setSalvando(false)
    setSalvo(true)
  }

  const resolverDesfecho = (proximaEtapa: string, bpAtual: number, historicoFinal: RespostaHistorico[]) => {
    if (proximaEtapa === "desenlace_obito") {
      const info = conteudo.desenlaces_finales.desenlace_obito
      setDesfecho({ info, falecido: true })
      salvarTentativa(bpAtual, historicoFinal, info, true)
      return true
    }
    if (proximaEtapa === "desenlace_vivo") {
      const opcoes = Object.values(conteudo.desenlaces_finales.desenlace_vivo)
      const info =
        opcoes.find((o) => bpAtual >= o.bp_faixa[0] && bpAtual <= o.bp_faixa[1]) ?? opcoes[opcoes.length - 1]
      setDesfecho({ info, falecido: false })
      salvarTentativa(bpAtual, historicoFinal, info, false)
      return true
    }
    return false
  }

  const escolher = (letra: string) => {
    if (letraEscolhida) return
    setLetraEscolhida(letra)
  }

  const continuar = () => {
    if (!letraEscolhida) return
    const opcao = etapa.opciones[letraEscolhida]
    const novoBp = Math.max(0, Math.min(100, bp + opcao.impacto_bp))
    const novoHistorico = [...historico, { etapa: etapaId, letra: letraEscolhida, impacto_bp: opcao.impacto_bp }]
    setHistorico(novoHistorico)
    setBp(novoBp)
    setVitais((v) => ({
      fc: clampVital(v.fc + opcao.deltas_vitais.fc, 30, 180),
      pas: clampVital(v.pas + opcao.deltas_vitais.pas, 40, 180),
      spo2: clampVital(v.spo2 + opcao.deltas_vitais.spo2, 60, 100),
    }))
    setLetraEscolhida(null)

    if (resolverDesfecho(opcao.proxima_etapa, novoBp, novoHistorico)) return
    setEtapaId(opcao.proxima_etapa)
  }

  const progresso = useMemo(() => Math.min(100, Math.round((etapa.numero / TOTAL_ETAPAS_REFERENCIA) * 100)), [etapa.numero])

  if (finalizado && desfecho) {
    return (
      <Card className="flex flex-col items-center gap-4 rounded-[24px] border border-border bg-card p-8 text-center sm:p-10">
        {desfecho.falecido ? <Skull className="h-12 w-12 text-red-500" /> : <Heart className="h-12 w-12 text-primary" />}
        <div>
          <p className="text-xl font-bold text-foreground">{desfecho.info.titulo}</p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{desfecho.info.descricao_detalhada}</p>
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
      <HospitalSimulacaoMonitor
        nome="Paciente, Masculino"
        idade={58}
        fc={vitais.fc}
        pas={vitais.pas}
        pad={Math.round(vitais.pas * 0.64)}
        spo2={vitais.spo2}
        stElevacao={stElevacao}
        critico={critico}
      />

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {etapa.fase} · {etapa.titulo} ({progresso}%)
        </p>
        <div className="flex items-center gap-2">
          {!letraEscolhida && (
            <span
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold tabular-nums ${
                segundosNaEtapa > 30 ? "bg-red-500/15 text-red-500" : "bg-muted text-muted-foreground"
              }`}
              title="Tempo decidindo -- o paciente segue descompensando enquanto você delibera"
            >
              <Clock className="h-3 w-3" />
              {Math.floor(segundosNaEtapa / 60)}:{String(segundosNaEtapa % 60).padStart(2, "0")}
            </span>
          )}
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              bp > 70 ? "bg-emerald-500/15 text-emerald-500" : bp > 40 ? "bg-amber-500/15 text-amber-500" : "bg-red-500/15 text-red-500"
            }`}
          >
            BP {bp}/100
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={etapaId}
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
