"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { translations } from "@/lib/i18n"
import {
  ANO_KEYS,
  MATERIA_KEYS_BY_ANO,
  PARCIAL_KEYS,
  parciaisDaMateria,
  DISCIPLINA_BASE_KEYS,
  anoDaMateria,
  type AnoKey,
  type ParcialKey,
  type DisciplinaBaseKey,
} from "@/lib/unr-curriculum"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Pagination, PAGE_SIZE } from "@/components/pagination"

interface Questao {
  id: string
  enunciado: string
  materia: string | null
  parcial: string | null
  disciplina_base: string | null
  dificuldade: string
  opcoes: string[]
  indice_correta: number
  justificativa: string | null
  opcoes_comentario: string[] | null
  mecanismo_pergunta: string | null
  mecanismo_opcoes: string[] | null
  mecanismo_indice_correta: number | null
  ativo: boolean
  tags: string[]
  created_at: string
}

const DIFFICULTIES = ["fácil", "médio", "difícil"]

const anoLabel = translations.pt.cronograma.anoLabel
const materiaLabel = translations.pt.cronograma.materiaLabel
const parcialLabel = translations.pt.cronograma.parcialLabel
const disciplinaBaseLabel = translations.pt.cronograma.disciplinaBaseLabel

const MATERIA_OPTIONS_FLAT = ANO_KEYS.flatMap((ano) =>
  MATERIA_KEYS_BY_ANO[ano].map((m) => ({ key: m, label: `${anoLabel[ano]} · ${materiaLabel[m]}` }))
)

const emptyForm = {
  enunciado: "",
  ano: ANO_KEYS[0] as AnoKey,
  materia: MATERIA_KEYS_BY_ANO[ANO_KEYS[0]][0],
  parcial: PARCIAL_KEYS[0] as ParcialKey,
  disciplinaBase: "" as DisciplinaBaseKey | "",
  dificuldade: "médio",
  opcoes: ["", ""],
  opcoesComentario: ["", ""],
  indiceCorreta: 0,
  justificativa: "",
  mecanismoPergunta: "",
  mecanismoOpcoes: ["", ""],
  mecanismoIndiceCorreta: 0,
  tags: "",
}

function parseTags(input: string): string[] {
  return input
    .split(",")
    .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
    .filter(Boolean)
}

const LETRA = ["A", "B", "C", "D", "E", "F", "G", "H"]

export function AdminQuestoesContent() {
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterMateria, setFilterMateria] = useState<string>("todas")
  const [filterParcial, setFilterParcial] = useState<string>("todas")
  const [filterDificuldade, setFilterDificuldade] = useState<string>("todas")
  const [filterDisciplinaBase, setFilterDisciplinaBase] = useState<string>("todas")
  const [page, setPage] = useState(1)

  const load = async () => {
    setLoading(true)
    // O Supabase limita cada select a 1000 linhas por padrão; com milhares
    // de questões no banco, é preciso paginar com .range() até esgotar.
    const PAGE = 1000
    let allRows: Questao[] = []
    let from = 0
    while (true) {
      const { data, error } = await supabase
        .from("questoes")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, from + PAGE - 1)
      if (error) {
        console.error(error)
        break
      }
      const rows = (data as Questao[]) ?? []
      allRows = allRows.concat(rows)
      if (rows.length < PAGE) break
      from += PAGE
    }
    setQuestoes(allRows)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return questoes.filter((q) => {
      const matchSearch =
        !term ||
        q.enunciado.toLowerCase().includes(term) ||
        (q.materia ?? "").toLowerCase().includes(term) ||
        (materiaLabel[q.materia ?? ""] ?? "").toLowerCase().includes(term) ||
        (q.tags ?? []).some((tag) => tag.toLowerCase().includes(term))
      const matchMateria = filterMateria === "todas" || q.materia === filterMateria
      const matchParcial = filterParcial === "todas" || q.parcial === filterParcial
      const matchDificuldade = filterDificuldade === "todas" || q.dificuldade === filterDificuldade
      const matchDisciplinaBase =
        filterDisciplinaBase === "todas" ||
        (filterDisciplinaBase === "sem_categoria" ? !q.disciplina_base : q.disciplina_base === filterDisciplinaBase)
      return matchSearch && matchMateria && matchParcial && matchDificuldade && matchDisciplinaBase
    })
  }, [questoes, search, filterMateria, filterParcial, filterDificuldade, filterDisciplinaBase])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const stats = useMemo(() => {
    const total = filtered.length
    const ativas = filtered.filter((q) => q.ativo).length
    return { total, ativas }
  }, [filtered])

  // Contagem de questões por matéria e por disciplina base (sobre o total,
  // não sobre o filtrado, para servir de referência fixa nos selects).
  const materiaCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const q of questoes) {
      if (!q.materia) continue
      counts[q.materia] = (counts[q.materia] ?? 0) + 1
    }
    return counts
  }, [questoes])

  const disciplinaBaseCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    let semCategoria = 0
    for (const q of questoes) {
      if (!q.disciplina_base) {
        semCategoria += 1
        continue
      }
      counts[q.disciplina_base] = (counts[q.disciplina_base] ?? 0) + 1
    }
    return { counts, semCategoria }
  }, [questoes])

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const handleAnoChange = (novoAno: AnoKey) => {
    const novaMateria = MATERIA_KEYS_BY_ANO[novoAno][0]
    setForm((p) => ({
      ...p,
      ano: novoAno,
      materia: novaMateria,
      parcial: parciaisDaMateria(novaMateria).includes(p.parcial) ? p.parcial : parciaisDaMateria(novaMateria)[0],
    }))
  }

  const handleMateriaChange = (novaMateria: string) => {
    setForm((p) => ({
      ...p,
      materia: novaMateria,
      parcial: parciaisDaMateria(novaMateria).includes(p.parcial) ? p.parcial : parciaisDaMateria(novaMateria)[0],
    }))
  }

  const openEdit = (q: Questao) => {
    const anoDerivado = (q.materia && anoDaMateria(q.materia)) || ANO_KEYS[0]
    setEditingId(q.id)
    setForm({
      enunciado: q.enunciado,
      ano: anoDerivado,
      materia:
        q.materia && MATERIA_KEYS_BY_ANO[anoDerivado].includes(q.materia)
          ? q.materia
          : MATERIA_KEYS_BY_ANO[anoDerivado][0],
      parcial: (q.parcial as ParcialKey) || PARCIAL_KEYS[0],
      disciplinaBase: (q.disciplina_base as DisciplinaBaseKey) || "",
      dificuldade: q.dificuldade,
      opcoes: q.opcoes?.length ? [...q.opcoes] : ["", ""],
      opcoesComentario: q.opcoes_comentario?.length
        ? [...q.opcoes_comentario]
        : q.opcoes?.map(() => "") ?? ["", ""],
      indiceCorreta: q.indice_correta,
      justificativa: q.justificativa ?? "",
      mecanismoPergunta: q.mecanismo_pergunta ?? "",
      mecanismoOpcoes: q.mecanismo_opcoes?.length ? [...q.mecanismo_opcoes] : ["", ""],
      mecanismoIndiceCorreta: q.mecanismo_indice_correta ?? 0,
      tags: (q.tags ?? []).join(", "),
    })
    setDialogOpen(true)
  }

  const updateOpcao = (idx: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      opcoes: prev.opcoes.map((o, i) => (i === idx ? value : o)),
    }))
  }

  const updateOpcaoComentario = (idx: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      opcoesComentario: prev.opcoesComentario.map((c, i) => (i === idx ? value : c)),
    }))
  }

  const addOpcao = () =>
    setForm((prev) => ({
      ...prev,
      opcoes: [...prev.opcoes, ""],
      opcoesComentario: [...prev.opcoesComentario, ""],
    }))

  const removeOpcao = (idx: number) => {
    setForm((prev) => {
      const opcoes = prev.opcoes.filter((_, i) => i !== idx)
      const opcoesComentario = prev.opcoesComentario.filter((_, i) => i !== idx)
      const indiceCorreta =
        prev.indiceCorreta >= opcoes.length ? 0 : prev.indiceCorreta
      return { ...prev, opcoes, opcoesComentario, indiceCorreta }
    })
  }

  const updateMecanismoOpcao = (idx: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      mecanismoOpcoes: prev.mecanismoOpcoes.map((o, i) => (i === idx ? value : o)),
    }))
  }

  const addMecanismoOpcao = () =>
    setForm((prev) => ({
      ...prev,
      mecanismoOpcoes: [...prev.mecanismoOpcoes, ""],
    }))

  const removeMecanismoOpcao = (idx: number) => {
    setForm((prev) => {
      const mecanismoOpcoes = prev.mecanismoOpcoes.filter((_, i) => i !== idx)
      const mecanismoIndiceCorreta =
        prev.mecanismoIndiceCorreta >= mecanismoOpcoes.length
          ? 0
          : prev.mecanismoIndiceCorreta
      return { ...prev, mecanismoOpcoes, mecanismoIndiceCorreta }
    })
  }

  const handleSave = async () => {
    const opcoesLimpa = form.opcoes.map((o) => o.trim()).filter(Boolean)
    if (!form.enunciado.trim() || opcoesLimpa.length < 2) {
      alert("Preencha o enunciado e ao menos duas opções.")
      return
    }

    const mecanismoOpcoesLimpa = form.mecanismoOpcoes
      .map((o) => o.trim())
      .filter(Boolean)
    const hasMecanismo =
      form.mecanismoPergunta.trim() && mecanismoOpcoesLimpa.length >= 2

    // Só salva comentários que correspondam a opções válidas
    const opcoesComentarioLimpa = form.opcoesComentario.slice(
      0,
      opcoesLimpa.length
    )

    setSaving(true)
    const payload = {
      enunciado: form.enunciado.trim(),
      materia: form.materia || null,
      parcial: form.parcial || null,
      disciplina_base: form.disciplinaBase || null,
      dificuldade: form.dificuldade,
      opcoes: opcoesLimpa,
      indice_correta: Math.min(form.indiceCorreta, opcoesLimpa.length - 1),
      justificativa: form.justificativa.trim() || null,
      opcoes_comentario: opcoesComentarioLimpa.some((c) => c.trim())
        ? opcoesComentarioLimpa.map((c) => c.trim())
        : null,
      mecanismo_pergunta: hasMecanismo ? form.mecanismoPergunta.trim() : null,
      mecanismo_opcoes: hasMecanismo ? mecanismoOpcoesLimpa : null,
      mecanismo_indice_correta: hasMecanismo
        ? Math.min(form.mecanismoIndiceCorreta, mecanismoOpcoesLimpa.length - 1)
        : null,
      tags: parseTags(form.tags),
    }

    const { error } = editingId
      ? await supabase.from("questoes").update(payload).eq("id", editingId)
      : await supabase.from("questoes").insert(payload)

    setSaving(false)
    if (error) {
      alert(`Erro ao salvar: ${error.message}`)
      return
    }
    setDialogOpen(false)
    load()
  }

  const handleToggleAtivo = async (q: Questao) => {
    setQuestoes((prev) =>
      prev.map((p) => (p.id === q.id ? { ...p, ativo: !p.ativo } : p))
    )
    await supabase.from("questoes").update({ ativo: !q.ativo }).eq("id", q.id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta questão? Essa ação não pode ser desfeita."))
      return
    const { error } = await supabase.from("questoes").delete().eq("id", id)
    if (error) {
      alert(`Erro ao excluir: ${error.message}`)
      return
    }
    setQuestoes((prev) => prev.filter((q) => q.id !== id))
  }

  return (
    <div className="space-y-4">
      {/* Header com stats */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Banco de Questões
          </h2>
          <p className="text-sm text-muted-foreground">
            {stats.total} questões{filterMateria !== "todas" ? ` (${materiaLabel[filterMateria] ?? filterMateria})` : ""}
            {" · "}
            {stats.ativas} ativas
          </p>
        </div>
        <Button variant="gradient" className="gap-1.5" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Nova Questão
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por enunciado, matéria ou tag..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        <Select
          value={filterMateria}
          onValueChange={(v) => {
            setFilterMateria(v)
            if (!parciaisDaMateria(v === "todas" ? "" : v).includes(filterParcial as ParcialKey)) setFilterParcial("todas")
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Matéria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as matérias ({questoes.length})</SelectItem>
            {MATERIA_OPTIONS_FLAT.map((m) => (
              <SelectItem key={m.key} value={m.key}>
                {m.label} ({materiaCounts[m.key] ?? 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterParcial} onValueChange={(v) => { setFilterParcial(v); setPage(1) }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Parcial" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todos os parciais</SelectItem>
            {(filterMateria === "todas" ? PARCIAL_KEYS : parciaisDaMateria(filterMateria)).map((p) => (
              <SelectItem key={p} value={p}>
                {parcialLabel[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterDificuldade} onValueChange={(v) => { setFilterDificuldade(v); setPage(1) }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Dificuldade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as dificuldades</SelectItem>
            {DIFFICULTIES.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterDisciplinaBase} onValueChange={(v) => { setFilterDisciplinaBase(v); setPage(1) }}>
          <SelectTrigger className="w-[190px]">
            <SelectValue placeholder="Disciplina Base" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as disciplinas ({questoes.length})</SelectItem>
            <SelectItem value="sem_categoria">
              Sem categoria ({disciplinaBaseCounts.semCategoria})
            </SelectItem>
            {DISCIPLINA_BASE_KEYS.map((d) => (
              <SelectItem key={d} value={d}>
                {disciplinaBaseLabel[d]} ({disciplinaBaseCounts.counts[d] ?? 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de questões */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando questões...
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Nenhuma questão encontrada.
        </Card>
      ) : (
        <div className="space-y-3">
          {paginated.map((q) => {
            const isExpanded = expandedId === q.id
            return (
              <Card key={q.id} className="border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {/* Badges */}
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {q.materia && (
                        <Badge variant="secondary">{materiaLabel[q.materia] ?? q.materia}</Badge>
                      )}
                      {q.parcial && (
                        <Badge variant="outline">{parcialLabel[q.parcial] ?? q.parcial}</Badge>
                      )}
                      {q.disciplina_base && (
                        <Badge variant="outline">{disciplinaBaseLabel[q.disciplina_base] ?? q.disciplina_base}</Badge>
                      )}
                      <Badge>{q.dificuldade}</Badge>
                      {q.mecanismo_pergunta && (
                        <Badge variant="outline">+ mecanismo</Badge>
                      )}
                    </div>

                    {/* Enunciado */}
                    <p className="font-medium text-foreground">{q.enunciado}</p>

                    {/* Tags */}
                    {q.tags?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {q.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Opções resumidas */}
                    <ul className="mt-2 space-y-1">
                      {q.opcoes?.map((op, idx) => (
                        <li
                          key={idx}
                          className={`text-sm ${
                            idx === q.indice_correta
                              ? "font-semibold text-success"
                              : "text-muted-foreground"
                          }`}
                        >
                          {idx === q.indice_correta ? (
                            <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />
                          ) : (
                            <span className="mr-1 inline-block h-3.5 w-3.5 text-center text-xs">
                              •
                            </span>
                          )}
                          <span className="font-medium">{LETRA[idx]}:</span>{" "}
                          {op}
                        </li>
                      ))}
                    </ul>

                    {/* Toggle expandir para ver comentários */}
                    {(q.justificativa || q.opcoes_comentario?.some(Boolean)) && (
                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : q.id)
                        }
                        className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        {isExpanded ? "Ocultar comentários" : "Ver comentários"}
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}

                    {/* Comentários expandidos */}
                    {isExpanded && (
                      <div className="mt-3 space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                        {q.justificativa && (
                          <div>
                            <p className="mb-1 text-xs font-semibold text-foreground">
                              Justificativa:
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {q.justificativa}
                            </p>
                          </div>
                        )}
                        {q.opcoes_comentario?.map((comentario, idx) =>
                          comentario ? (
                            <div key={idx} className="flex gap-2">
                              <span
                                className={`shrink-0 text-xs font-bold ${
                                  idx === q.indice_correta
                                    ? "text-success"
                                    : "text-destructive"
                                }`}
                              >
                                {LETRA[idx]}:
                              </span>
                              <p className="text-sm text-muted-foreground">
                                {comentario}
                              </p>
                            </div>
                          ) : null
                        )}
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">
                        Ativa
                      </span>
                      <Switch
                        checked={q.ativo}
                        onCheckedChange={() => handleToggleAtivo(q)}
                      />
                    </div>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => openEdit(q)}
                      aria-label="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(q.id)}
                      aria-label="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* ============================================================ */}
      {/* DIALOG DE CRIAÇÃO/EDIÇÃO */}
      {/* ============================================================ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Questão" : "Nova Questão"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* ── ENUNCIADO ── */}
            <div className="space-y-1.5">
              <Label htmlFor="enunciado">Enunciado da Questão</Label>
              <Textarea
                id="enunciado"
                value={form.enunciado}
                onChange={(e) =>
                  setForm((p) => ({ ...p, enunciado: e.target.value }))
                }
                placeholder="Cole ou digite o enunciado completo da questão..."
                className="min-h-[120px]"
              />
            </div>

            {/* ── CLASSIFICAÇÃO ── */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Ano</Label>
                <Select value={form.ano} onValueChange={(v) => handleAnoChange(v as AnoKey)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ANO_KEYS.map((a) => (
                      <SelectItem key={a} value={a}>
                        {anoLabel[a]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Matéria</Label>
                <Select
                  value={form.materia}
                  onValueChange={handleMateriaChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MATERIA_KEYS_BY_ANO[form.ano].map((m) => (
                      <SelectItem key={m} value={m}>
                        {materiaLabel[m]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Dificuldade</Label>
                <Select
                  value={form.dificuldade}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, dificuldade: v }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Parcial</Label>
                <Select
                  value={form.parcial}
                  onValueChange={(v) => setForm((p) => ({ ...p, parcial: v as ParcialKey }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {parciaisDaMateria(form.materia).map((p) => (
                      <SelectItem key={p} value={p}>
                        {parcialLabel[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Disciplina Base</Label>
              <Select
                value={form.disciplinaBase || "nenhuma"}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, disciplinaBase: v === "nenhuma" ? "" : (v as DisciplinaBaseKey) }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhuma">Nenhuma</SelectItem>
                  {DISCIPLINA_BASE_KEYS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {disciplinaBaseLabel[d]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tags">
                Tags{" "}
                <span className="text-muted-foreground font-normal">
                  (separadas por vírgula)
                </span>
              </Label>
              <Input
                id="tags"
                value={form.tags}
                onChange={(e) =>
                  setForm((p) => ({ ...p, tags: e.target.value }))
                }
                placeholder="Ex: hipertensao, clinica-medica, anti-hipertensivos"
              />
            </div>

            {/* ── ALTERNATIVAS COM COMENTÁRIOS ── */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Alternativas
              </Label>
              <p className="text-xs text-muted-foreground">
                Clique na letra para marcar como correta. Adicione um
                comentário para cada alternativa explicando por que está
                certa ou errada.
              </p>

              {form.opcoes.map((opcao, idx) => {
                const isCorreta = form.indiceCorreta === idx
                return (
                  <div
                    key={idx}
                    className={`rounded-lg border p-3 transition-colors ${
                      isCorreta
                        ? "border-success/50 bg-success/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() =>
                          setForm((p) => ({ ...p, indiceCorreta: idx }))
                        }
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-xs font-bold transition-colors ${
                          isCorreta
                            ? "border-success bg-success text-white"
                            : "border-input text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        {LETRA[idx]}
                      </button>
                      <Input
                        value={opcao}
                        onChange={(e) => updateOpcao(idx, e.target.value)}
                        placeholder={`Texto da alternativa ${LETRA[idx]}`}
                        className={isCorreta ? "border-success/50" : ""}
                      />
                      {form.opcoes.length > 2 && (
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => removeOpcao(idx)}
                          aria-label="Remover alternativa"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-start gap-2 ml-11">
                      {isCorreta ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      ) : (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      )}
                      <Textarea
                        value={form.opcoesComentario[idx] ?? ""}
                        onChange={(e) =>
                          updateOpcaoComentario(idx, e.target.value)
                        }
                        placeholder={
                          isCorreta
                            ? "Explique por que esta alternativa está CORRETA..."
                            : "Explique por que esta alternativa está ERRADA..."
                        }
                        className="min-h-[60px] text-sm"
                      />
                    </div>
                  </div>
                )
              })}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={addOpcao}
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar alternativa
              </Button>
            </div>

            {/* ── JUSTIFICATIVA GERAL ── */}
            <div className="space-y-1.5">
              <Label htmlFor="justificativa">
                Justificativa Geral{" "}
                <span className="text-muted-foreground font-normal">
                  (opcional — resumo da resposta correta)
                </span>
              </Label>
              <Textarea
                id="justificativa"
                value={form.justificativa}
                onChange={(e) =>
                  setForm((p) => ({ ...p, justificativa: e.target.value }))
                }
                placeholder="Parabéns! A resposta correta é X. [explique o raciocínio médico...]"
                className="min-h-[80px]"
              />
            </div>

            {/* ── PERGUNTA DE MECANISMO ── */}
            <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
              <div>
                <Label htmlFor="mecanismo-pergunta">
                  Pergunta de mecanismo{" "}
                  <span className="text-muted-foreground font-normal">
                    (opcional)
                  </span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Aparece como bônus quando o aluno acerta — "Prova que não
                  foi sorte!". Deixe em branco para não usar.
                </p>
              </div>
              <Textarea
                id="mecanismo-pergunta"
                value={form.mecanismoPergunta}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    mecanismoPergunta: e.target.value,
                  }))
                }
                placeholder="Ex: Qual o mecanismo pelo qual essa conduta é a mais adequada?"
              />
              {form.mecanismoPergunta.trim() && (
                <div className="space-y-2">
                  <Label>Opções do mecanismo (marque a correta)</Label>
                  {form.mecanismoOpcoes.map((opcao, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            mecanismoIndiceCorreta: idx,
                          }))
                        }
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-xs font-semibold transition-colors ${
                          form.mecanismoIndiceCorreta === idx
                            ? "border-success bg-success/15 text-success"
                            : "border-input text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        {LETRA[idx]}
                      </button>
                      <Input
                        value={opcao}
                        onChange={(e) =>
                          updateMecanismoOpcao(idx, e.target.value)
                        }
                        placeholder={`Opção ${LETRA[idx]}`}
                      />
                      {form.mecanismoOpcoes.length > 2 && (
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => removeMecanismoOpcao(idx)}
                          aria-label="Remover opção"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={addMecanismoOpcao}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar opção
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="gradient"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Salvar Questão"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
