"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Plus, Trash2, ChevronUp, ChevronDown, ClipboardList, Stethoscope } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { AREAS, DIFFICULTIES, PROVAS } from "@/lib/quiz-config"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CronogramaTrilha, CronogramaTrilhaEtapa, TrilhaEtapaTipo } from "@/lib/cronograma-types"

interface UnidadeRow {
  id: string
  trilha_id: string
  titulo: string
  descricao: string | null
  ordem: number
}

interface EtapaComDesafio extends CronogramaTrilhaEtapa {
  desafio_clinico: { titulo: string } | null
}

interface UnidadeComEtapas extends UnidadeRow {
  etapas: EtapaComDesafio[]
}

interface DesafioOption {
  id: string
  titulo: string
}

const SEM_FILTRO = "qualquer"

interface NovaEtapaForm {
  tipo: TrilhaEtapaTipo
  area: string
  dificuldade: string
  prova: string
  quantidade: number
  desafioId: string
}

const defaultEtapaForm: NovaEtapaForm = {
  tipo: "simulado",
  area: SEM_FILTRO,
  dificuldade: SEM_FILTRO,
  prova: SEM_FILTRO,
  quantidade: 20,
  desafioId: "",
}

export function AdminTrilhaDetailContent({ trilhaId }: { trilhaId: string }) {
  const [trilha, setTrilha] = useState<CronogramaTrilha | null>(null)
  const [unidades, setUnidades] = useState<UnidadeComEtapas[]>([])
  const [desafios, setDesafios] = useState<DesafioOption[]>([])
  const [loading, setLoading] = useState(true)

  const [novaUnidade, setNovaUnidade] = useState("")
  const [addingUnidade, setAddingUnidade] = useState(false)
  const [etapaForms, setEtapaForms] = useState<Record<string, NovaEtapaForm>>({})
  const [addingEtapaFor, setAddingEtapaFor] = useState<string | null>(null)

  const load = async () => {
    const [{ data: trilhaData }, { data: unidadesData }, { data: desafiosData }] = await Promise.all([
      supabase.from("cronograma_trilhas").select("*").eq("id", trilhaId).single(),
      supabase
        .from("cronograma_trilhas_unidades")
        .select("*, etapas:cronograma_trilhas_etapas(*, desafio_clinico:desafios_clinicos(titulo))")
        .eq("trilha_id", trilhaId)
        .order("ordem", { ascending: true }),
      supabase.from("desafios_clinicos").select("id, titulo").order("titulo", { ascending: true }),
    ])

    setTrilha((trilhaData as CronogramaTrilha) ?? null)
    const unidadesOrdenadas = ((unidadesData as unknown as UnidadeComEtapas[]) ?? []).map((u) => ({
      ...u,
      etapas: (u.etapas ?? []).slice().sort((a, b) => a.ordem - b.ordem),
    }))
    setUnidades(unidadesOrdenadas)
    setDesafios((desafiosData as DesafioOption[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trilhaId])

  const handleAddUnidade = async () => {
    if (!novaUnidade.trim()) return
    setAddingUnidade(true)
    await supabase.from("cronograma_trilhas_unidades").insert({
      trilha_id: trilhaId,
      titulo: novaUnidade.trim(),
      ordem: unidades.length,
    })
    setNovaUnidade("")
    setAddingUnidade(false)
    load()
  }

  const handleDeleteUnidade = async (id: string) => {
    if (!confirm("Excluir esta unidade e todas as suas etapas?")) return
    await supabase.from("cronograma_trilhas_unidades").delete().eq("id", id)
    load()
  }

  const moveUnidade = async (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= unidades.length) return
    const a = unidades[index]
    const b = unidades[target]
    await Promise.all([
      supabase.from("cronograma_trilhas_unidades").update({ ordem: b.ordem }).eq("id", a.id),
      supabase.from("cronograma_trilhas_unidades").update({ ordem: a.ordem }).eq("id", b.id),
    ])
    load()
  }

  const getForm = (unidadeId: string): NovaEtapaForm => etapaForms[unidadeId] ?? defaultEtapaForm
  const updateForm = (unidadeId: string, patch: Partial<NovaEtapaForm>) =>
    setEtapaForms((prev) => ({ ...prev, [unidadeId]: { ...getForm(unidadeId), ...patch } }))

  const handleAddEtapa = async (unidade: UnidadeComEtapas) => {
    const form = getForm(unidade.id)
    if (form.tipo === "desafio_clinico" && !form.desafioId) {
      alert("Selecione um desafio clínico.")
      return
    }
    setAddingEtapaFor(unidade.id)
    const payload = {
      unidade_id: unidade.id,
      ordem: unidade.etapas.length,
      tipo: form.tipo,
      area: form.tipo === "simulado" && form.area !== SEM_FILTRO ? form.area : null,
      dificuldade: form.tipo === "simulado" && form.dificuldade !== SEM_FILTRO ? form.dificuldade : null,
      prova: form.tipo === "simulado" && form.prova !== SEM_FILTRO ? form.prova : null,
      quantidade_questoes: form.tipo === "simulado" ? form.quantidade : null,
      desafio_clinico_id: form.tipo === "desafio_clinico" ? form.desafioId : null,
    }
    const { error } = await supabase.from("cronograma_trilhas_etapas").insert(payload)
    setAddingEtapaFor(null)
    if (error) {
      alert(`Erro ao adicionar etapa: ${error.message}`)
      return
    }
    setEtapaForms((prev) => ({ ...prev, [unidade.id]: defaultEtapaForm }))
    load()
  }

  const handleDeleteEtapa = async (id: string) => {
    await supabase.from("cronograma_trilhas_etapas").delete().eq("id", id)
    load()
  }

  const moveEtapa = async (unidade: UnidadeComEtapas, index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= unidade.etapas.length) return
    const a = unidade.etapas[index]
    const b = unidade.etapas[target]
    await Promise.all([
      supabase.from("cronograma_trilhas_etapas").update({ ordem: b.ordem }).eq("id", a.id),
      supabase.from("cronograma_trilhas_etapas").update({ ordem: a.ordem }).eq("id", b.id),
    ])
    load()
  }

  const totalEtapas = useMemo(() => unidades.reduce((acc, u) => acc + u.etapas.length, 0), [unidades])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando trilha...
      </div>
    )
  }

  if (!trilha) {
    return <p className="text-muted-foreground">Trilha não encontrada.</p>
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/trilhas" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Voltar às trilhas
        </Link>
        <h2 className="mt-2 text-2xl font-bold text-gradient-brand">{trilha.nome}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {unidades.length} unidade(s) · {totalEtapas} etapa(s)
        </p>
      </div>

      <div className="max-w-2xl space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Unidades e Etapas</h3>

        {unidades.map((unidade, uIndex) => {
          const form = getForm(unidade.id)
          return (
            <Card key={unidade.id} className="border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{unidade.titulo}</p>
                  <p className="text-xs text-muted-foreground">{unidade.etapas.length} etapa(s)</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon-sm" variant="ghost" disabled={uIndex === 0} onClick={() => moveUnidade(uIndex, -1)}>
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    disabled={uIndex === unidades.length - 1}
                    onClick={() => moveUnidade(uIndex, 1)}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteUnidade(unidade.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-3 space-y-2 border-t border-border pt-3">
                {unidade.etapas.map((etapa, eIndex) => (
                  <div key={etapa.id} className="flex items-center justify-between rounded-lg border border-border p-2.5">
                    <div className="flex items-center gap-2">
                      {etapa.tipo === "simulado" ? (
                        <ClipboardList className="h-4 w-4 text-primary" />
                      ) : (
                        <Stethoscope className="h-4 w-4 text-primary" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {etapa.tipo === "simulado"
                            ? `Simulado — ${etapa.area ?? "Todas as áreas"}`
                            : etapa.desafio_clinico?.titulo ?? "Desafio removido"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {etapa.tipo === "simulado"
                            ? `${etapa.quantidade_questoes ?? 10} questões${etapa.dificuldade ? ` · ${etapa.dificuldade}` : ""}${etapa.prova ? ` · ${etapa.prova}` : ""}`
                            : "Desafio clínico"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon-sm" variant="ghost" disabled={eIndex === 0} onClick={() => moveEtapa(unidade, eIndex, -1)}>
                        <ChevronUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        disabled={eIndex === unidade.etapas.length - 1}
                        onClick={() => moveEtapa(unidade, eIndex, 1)}
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteEtapa(etapa.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateForm(unidade.id, { tipo: "simulado" })}
                      className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        form.tipo === "simulado" ? "border-primary bg-primary/10 text-primary" : "border-input text-foreground hover:bg-accent"
                      }`}
                    >
                      Simulado
                    </button>
                    <button
                      type="button"
                      onClick={() => updateForm(unidade.id, { tipo: "desafio_clinico" })}
                      className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        form.tipo === "desafio_clinico" ? "border-primary bg-primary/10 text-primary" : "border-input text-foreground hover:bg-accent"
                      }`}
                    >
                      Desafio Clínico
                    </button>
                  </div>

                  {form.tipo === "simulado" ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Select value={form.area} onValueChange={(v) => updateForm(unidade.id, { area: v })}>
                        <SelectTrigger className="text-xs"><SelectValue placeholder="Área" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SEM_FILTRO}>Todas as áreas</SelectItem>
                          {AREAS.map((a) => (
                            <SelectItem key={a} value={a}>{a}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={form.dificuldade} onValueChange={(v) => updateForm(unidade.id, { dificuldade: v })}>
                        <SelectTrigger className="text-xs"><SelectValue placeholder="Nível" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SEM_FILTRO}>Qualquer nível</SelectItem>
                          {DIFFICULTIES.filter((d) => d.value !== "aleatorio").map((d) => (
                            <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={form.prova} onValueChange={(v) => updateForm(unidade.id, { prova: v })}>
                        <SelectTrigger className="text-xs"><SelectValue placeholder="Prova" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SEM_FILTRO}>Qualquer prova</SelectItem>
                          {PROVAS.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={form.quantidade}
                        onChange={(e) => updateForm(unidade.id, { quantidade: Number(e.target.value) || 1 })}
                        placeholder="Questões"
                        className="text-xs"
                      />
                    </div>
                  ) : (
                    <Select value={form.desafioId} onValueChange={(v) => updateForm(unidade.id, { desafioId: v })}>
                      <SelectTrigger className="text-xs"><SelectValue placeholder="Selecione um desafio clínico" /></SelectTrigger>
                      <SelectContent>
                        {desafios.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.titulo}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full gap-1.5"
                    disabled={addingEtapaFor === unidade.id}
                    onClick={() => handleAddEtapa(unidade)}
                  >
                    {addingEtapaFor === unidade.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                    Adicionar etapa
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}

        <Card className="border border-dashed border-border bg-card/50 p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nome da nova unidade (ex: Unidade 1)"
              value={novaUnidade}
              onChange={(e) => setNovaUnidade(e.target.value)}
            />
            <Button variant="gradient" onClick={handleAddUnidade} disabled={addingUnidade} className="shrink-0 gap-1.5">
              {addingUnidade ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Adicionar
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
