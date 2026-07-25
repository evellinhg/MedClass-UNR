"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Stethoscope } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getAreaIcon } from "@/lib/area-icons"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TrilhaPath, type TrilhaPathUnidade } from "@/components/trilha-path"
import { SimuladoPlayer, type SimuladoConfig } from "@/components/simulado-player"
import type { CronogramaTrilha, CronogramaTrilhaEtapa } from "@/lib/cronograma-types"

interface UnidadeRow {
  id: string
  titulo: string
  descricao: string | null
  ordem: number
}

interface EtapaComDesafio extends CronogramaTrilhaEtapa {
  desafio_clinico: { titulo: string; icone: string } | null
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function TrilhaAtivaContent({ trilhaId, onSair }: { trilhaId: string; onSair: () => void }) {
  const router = useRouter()
  const [trilha, setTrilha] = useState<CronogramaTrilha | null>(null)
  const [unidades, setUnidades] = useState<UnidadeRow[]>([])
  const [etapas, setEtapas] = useState<EtapaComDesafio[]>([])
  const [simuladosConcluidos, setSimuladosConcluidos] = useState<Set<string>>(new Set())
  const [desafiosConcluidos, setDesafiosConcluidos] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saindo, setSaindo] = useState(false)
  const [iniciando, setIniciando] = useState<string | null>(null)

  const [playerConfig, setPlayerConfig] = useState<SimuladoConfig | null>(null)
  const [playerOpen, setPlayerOpen] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) {
      setLoading(false)
      return
    }

    const [{ data: trilhaData }, { data: unidadesData }] = await Promise.all([
      supabase.from("cronograma_trilhas").select("*").eq("id", trilhaId).single(),
      supabase
        .from("cronograma_trilhas_unidades")
        .select("*")
        .eq("trilha_id", trilhaId)
        .order("ordem", { ascending: true }),
    ])

    setTrilha((trilhaData as CronogramaTrilha) ?? null)
    const unidadesRows = (unidadesData as UnidadeRow[]) ?? []
    setUnidades(unidadesRows)

    const unidadeIds = unidadesRows.map((u) => u.id)
    if (unidadeIds.length === 0) {
      setEtapas([])
      setLoading(false)
      return
    }

    const { data: etapasData } = await supabase
      .from("cronograma_trilhas_etapas")
      .select("*, desafio_clinico:desafios_clinicos(titulo, icone)")
      .in("unidade_id", unidadeIds)
      .order("ordem", { ascending: true })

    const etapasRows = (etapasData as unknown as EtapaComDesafio[]) ?? []
    setEtapas(etapasRows)

    const etapaIds = etapasRows.map((e) => e.id)
    const [{ data: simuladosData }, { data: historicoData }] = await Promise.all([
      etapaIds.length > 0
        ? supabase
            .from("simulados")
            .select("origem_trilha_etapa_id")
            .eq("user_id", userId)
            .not("finished_at", "is", null)
            .in("origem_trilha_etapa_id", etapaIds)
        : Promise.resolve({ data: [] }),
      etapaIds.length > 0
        ? supabase
            .from("desafios_clinicos_historico")
            .select("origem_trilha_etapa_id")
            .eq("user_id", userId)
            .in("origem_trilha_etapa_id", etapaIds)
        : Promise.resolve({ data: [] }),
    ])

    setSimuladosConcluidos(
      new Set(((simuladosData as { origem_trilha_etapa_id: string }[]) ?? []).map((s) => s.origem_trilha_etapa_id))
    )
    setDesafiosConcluidos(
      new Set(((historicoData as { origem_trilha_etapa_id: string }[]) ?? []).map((h) => h.origem_trilha_etapa_id))
    )
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trilhaId])

  const isConcluida = (etapa: EtapaComDesafio) =>
    etapa.tipo === "simulado" ? simuladosConcluidos.has(etapa.id) : desafiosConcluidos.has(etapa.id)

  const handleIniciarSimulado = async (etapa: EtapaComDesafio) => {
    setIniciando(etapa.id)
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) {
      setIniciando(null)
      return
    }

    let query = supabase.from("questoes").select("id").limit(500)
    if (etapa.area) query = query.eq("area", etapa.area)
    if (etapa.dificuldade) query = query.eq("dificuldade", etapa.dificuldade)
    if (etapa.prova) query = query.eq("prova", etapa.prova)
    const { data: questoesDisponiveis } = await query
    const pool = (questoesDisponiveis as { id: string }[] | null) ?? []
    const quantidade = etapa.quantidade_questoes ?? 10

    if (pool.length < quantidade) {
      alert(`Só há ${pool.length} questão(ões) disponível(is) para esta etapa. Avise a equipe MedClass.`)
      setIniciando(null)
      return
    }

    const questaoIds = shuffle(pool).slice(0, quantidade).map((q) => q.id)

    const { data, error } = await supabase
      .from("simulados")
      .insert({
        user_id: userId,
        nome: `${trilha?.nome ?? "Trilha"} — Etapa`,
        areas: etapa.area ? [etapa.area] : [],
        dificuldade: etapa.dificuldade,
        prova: etapa.prova,
        quantidade_questoes: quantidade,
        questao_ids: questaoIds,
        origem_trilha_etapa_id: etapa.id,
      })
      .select()
      .single()

    setIniciando(null)
    if (error || !data) {
      alert("Não foi possível iniciar a etapa. Tente novamente.")
      return
    }

    setPlayerConfig({
      label: data.nome,
      count: quantidade,
      questionIds: questaoIds,
      mode: "simulado",
      simuladoId: data.id,
    })
    setPlayerOpen(true)
  }

  const handleIniciarEtapa = (etapa: EtapaComDesafio) => {
    if (etapa.tipo === "desafio_clinico") {
      if (!etapa.desafio_clinico_id) return
      router.push(`/dashboard/desafios-clinicos/${etapa.desafio_clinico_id}?origemEtapaId=${etapa.id}`)
      return
    }
    handleIniciarSimulado(etapa)
  }

  const unidadesPath: TrilhaPathUnidade[] = useMemo(() => {
    let primeiraNaoConcluidaEncontrada = false
    return unidades
      .map((u) => {
        const etapasDaUnidade = etapas.filter((e) => e.unidade_id === u.id)
        return {
          id: u.id,
          titulo: u.titulo,
          descricao: u.descricao,
          nodes: etapasDaUnidade.map((etapa) => {
            const concluida = isConcluida(etapa)
            let estado: "concluida" | "atual" | "bloqueada"
            let onClick: (() => void) | undefined
            if (concluida) {
              estado = "concluida"
            } else if (!primeiraNaoConcluidaEncontrada) {
              estado = "atual"
              primeiraNaoConcluidaEncontrada = true
              onClick = iniciando ? undefined : () => handleIniciarEtapa(etapa)
            } else {
              estado = "bloqueada"
            }
            const label =
              etapa.tipo === "simulado"
                ? `${etapa.area ?? "Todas as áreas"}`
                : etapa.desafio_clinico?.titulo ?? "Desafio clínico"
            const sublabel =
              etapa.tipo === "simulado" ? `${etapa.quantidade_questoes ?? 10} questões` : "Desafio clínico"
            return {
              id: etapa.id,
              label,
              sublabel,
              estado,
              icone: etapa.tipo === "simulado" ? getAreaIcon(etapa.area) : Stethoscope,
              onClick,
            }
          }),
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      })
  }, [unidades, etapas, simuladosConcluidos, desafiosConcluidos, iniciando])

  const total = etapas.length
  const concluidas = etapas.filter(isConcluida).length

  const handleSair = async () => {
    if (!confirm("Sair desta trilha? Seu cronograma pessoal voltará a ficar disponível.")) return
    setSaindo(true)
    await supabase.rpc("set_cronograma_trilha", { p_trilha_id: null })
    setSaindo(false)
    onSair()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando trilha...
      </div>
    )
  }

  if (!trilha) {
    return (
      <Card className="border border-border bg-card/50 p-8 text-center">
        <p className="text-muted-foreground">Trilha não encontrada.</p>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
      <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <Card className="border border-primary/20 bg-gradient-to-br from-[#8b5cf6]/5 to-[#6366f1]/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">Trilha de treinamento</p>
          <h2 className="text-lg font-bold leading-tight text-foreground">{trilha.nome}</h2>
          {trilha.descricao && <p className="mt-1 text-xs text-muted-foreground">{trilha.descricao}</p>}
          <p className="mt-2 text-xs text-muted-foreground">
            {concluidas} de {total} etapas concluídas
          </p>
          <Button variant="outline" size="sm" onClick={handleSair} disabled={saindo} className="mt-3 w-full">
            {saindo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sair da trilha"}
          </Button>
        </Card>
      </div>

      <div className="lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-2">
        {total === 0 ? (
          <Card className="border border-border bg-card/50 p-8 text-center">
            <p className="text-muted-foreground">Esta trilha ainda não possui etapas cadastradas.</p>
          </Card>
        ) : (
          <TrilhaPath unidades={unidadesPath} />
        )}
      </div>

      <SimuladoPlayer
        open={playerOpen}
        onOpenChange={(v) => {
          setPlayerOpen(v)
          if (!v) load()
        }}
        config={playerConfig}
      />
    </div>
  )
}
