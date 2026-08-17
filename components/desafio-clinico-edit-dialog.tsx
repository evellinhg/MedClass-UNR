"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, Plus, Trash2, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { enfileirarAviso } from "@/lib/avisos"
import { AREAS } from "@/lib/quiz-config"
import { DESAFIO_SECAO_KEYS } from "@/lib/desafio-icons"
import { translations } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TextFormattingToolbar } from "@/components/text-formatting-toolbar"
import type { DesafioClinico, DesafioClinicoPergunta, DesafioCategoria } from "@/lib/desafios-types"

export const DESAFIO_ICONES = [
  "HeartPulse",
  "Thermometer",
  "Baby",
  "Stethoscope",
  "Brain",
  "Bone",
  "Eye",
  "Ear",
  "Pill",
  "Syringe",
  "Activity",
  "Microscope",
]

const desafioSecaoLabel = translations.pt.cronograma.desafioSecaoLabel

const CATEGORIAS: { value: DesafioCategoria; label: string }[] = [
  { value: "anamnese", label: "Anamnese" },
  { value: "exame_fisico", label: "Exame Físico" },
  { value: "exames_complementares", label: "Exames Complementares" },
  { value: "diagnostico", label: "Diagnóstico" },
  { value: "conduta", label: "Conduta" },
]

const LETRAS = ["a", "b", "c", "d"]

interface AlternativaForm {
  texto: string
  correta: boolean
}

interface PerguntaForm {
  id?: string
  categoria: DesafioCategoria
  enunciado: string
  alternativas: AlternativaForm[]
  explicacao: string
}

interface BibliografiaForm {
  titulo: string
  url: string
}

interface DesafioForm {
  titulo: string
  icone: string
  area: string
  secao: string
  imagemUrl: string
  descricao_caso: string
  ativo: boolean
  bibliografia: BibliografiaForm[]
  perguntas: PerguntaForm[]
}

const SEM_AREA = "none"
const SEM_SECAO = "none"

const emptyAlternativas = (): AlternativaForm[] => [
  { texto: "", correta: true },
  { texto: "", correta: false },
  { texto: "", correta: false },
  { texto: "", correta: false },
]

const emptyPergunta = (): PerguntaForm => ({
  categoria: "anamnese",
  enunciado: "",
  alternativas: emptyAlternativas(),
  explicacao: "",
})

const emptyBibliografia = (): BibliografiaForm => ({ titulo: "", url: "" })

const emptyForm = (): DesafioForm => ({
  titulo: "",
  icone: DESAFIO_ICONES[0],
  area: SEM_AREA,
  secao: SEM_SECAO,
  imagemUrl: "",
  descricao_caso: "",
  ativo: true,
  bibliografia: [emptyBibliografia()],
  perguntas: [emptyPergunta()],
})

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** null cria um novo desafio; um DesafioClinico existente abre em modo de edição */
  desafio: DesafioClinico | null
  onSaved: () => void
}

export function DesafioClinicoEditDialog({ open, onOpenChange, desafio, onSaved }: Props) {
  const [saving, setSaving] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [form, setForm] = useState<DesafioForm>(emptyForm())
  const descricaoRef = useRef<HTMLTextAreaElement>(null)
  const enunciadoRefs = useRef<(HTMLTextAreaElement | null)[]>([])
  const explicacaoRefs = useRef<(HTMLTextAreaElement | null)[]>([])

  const carregarForm = async () => {
    if (!desafio) {
      setForm(emptyForm())
      return
    }
    setCarregando(true)
    const { data: perguntasRows } = await supabase
      .from("desafios_clinicos_perguntas")
      .select("*")
      .eq("desafio_id", desafio.id)
      .order("ordem")
    setForm({
      titulo: desafio.titulo,
      icone: desafio.icone || DESAFIO_ICONES[0],
      area: desafio.area ?? SEM_AREA,
      secao: desafio.secao ?? SEM_SECAO,
      imagemUrl: desafio.imagem_url ?? "",
      descricao_caso: desafio.descricao_caso ?? "",
      ativo: desafio.ativo,
      bibliografia: desafio.bibliografia.length
        ? desafio.bibliografia.map((b) => ({ titulo: b.titulo, url: b.url ?? "" }))
        : [emptyBibliografia()],
      perguntas: (perguntasRows ?? []).length
        ? (perguntasRows as DesafioClinicoPergunta[]).map((p) => ({
            id: p.id,
            categoria: p.categoria,
            enunciado: p.enunciado,
            alternativas: p.alternativas.map((a) => ({ texto: a.texto, correta: a.correta })),
            explicacao: p.explicacao ?? "",
          }))
        : [emptyPergunta()],
    })
    setCarregando(false)
  }

  useEffect(() => {
    if (open) carregarForm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, desafio])

  // --- Bibliografia ---
  const addBibliografia = () => setForm((p) => ({ ...p, bibliografia: [...p.bibliografia, emptyBibliografia()] }))
  const removeBibliografia = (idx: number) =>
    setForm((p) => ({ ...p, bibliografia: p.bibliografia.filter((_, i) => i !== idx) }))
  const updateBibliografia = (idx: number, field: keyof BibliografiaForm, value: string) =>
    setForm((p) => ({
      ...p,
      bibliografia: p.bibliografia.map((b, i) => (i === idx ? { ...b, [field]: value } : b)),
    }))

  // --- Perguntas ---
  const addPergunta = () => setForm((p) => ({ ...p, perguntas: [...p.perguntas, emptyPergunta()] }))
  const removePergunta = (idx: number) => setForm((p) => ({ ...p, perguntas: p.perguntas.filter((_, i) => i !== idx) }))
  const updatePergunta = (idx: number, field: "categoria" | "enunciado" | "explicacao", value: string) =>
    setForm((p) => ({
      ...p,
      perguntas: p.perguntas.map((q, i) => (i === idx ? { ...q, [field]: value } : q)),
    }))
  const updateAlternativaTexto = (perguntaIdx: number, altIdx: number, texto: string) =>
    setForm((p) => ({
      ...p,
      perguntas: p.perguntas.map((q, i) =>
        i === perguntaIdx ? { ...q, alternativas: q.alternativas.map((a, j) => (j === altIdx ? { ...a, texto } : a)) } : q
      ),
    }))
  const setAlternativaCorreta = (perguntaIdx: number, altIdx: number) =>
    setForm((p) => ({
      ...p,
      perguntas: p.perguntas.map((q, i) =>
        i === perguntaIdx
          ? { ...q, alternativas: q.alternativas.map((a, j) => ({ ...a, correta: j === altIdx })) }
          : q
      ),
    }))

  const handleSave = async () => {
    if (!form.titulo.trim()) {
      alert("Preencha o título do desafio.")
      return
    }
    const perguntasLimpa = form.perguntas
      .map((q) => ({
        ...q,
        enunciado: q.enunciado.trim(),
        explicacao: q.explicacao.trim(),
        alternativas: q.alternativas.map((a) => ({ ...a, texto: a.texto.trim() })),
      }))
      .filter((q) => q.enunciado && q.alternativas.every((a) => a.texto) && q.alternativas.some((a) => a.correta))
    if (perguntasLimpa.length === 0) {
      alert("Adicione ao menos uma pergunta com enunciado, as 4 alternativas preenchidas e uma marcada como correta.")
      return
    }

    setSaving(true)
    const desafioPayload = {
      titulo: form.titulo.trim(),
      icone: form.icone,
      area: form.area === SEM_AREA ? null : form.area,
      secao: form.secao === SEM_SECAO ? null : form.secao,
      imagem_url: form.imagemUrl.trim() || null,
      descricao_caso: form.descricao_caso.trim(),
      ativo: form.ativo,
      bibliografia: form.bibliografia
        .map((b) => ({ titulo: b.titulo.trim(), url: b.url.trim() || null }))
        .filter((b) => b.titulo),
    }

    const isNew = !desafio
    let desafioId = desafio?.id ?? null
    if (desafio) {
      const { error } = await supabase.from("desafios_clinicos").update(desafioPayload).eq("id", desafio.id)
      if (error) {
        alert(`Erro ao salvar: ${error.message}`)
        setSaving(false)
        return
      }
      await supabase.from("desafios_clinicos_perguntas").delete().eq("desafio_id", desafio.id)
    } else {
      const { data, error } = await supabase.from("desafios_clinicos").insert(desafioPayload).select("id").single()
      if (error || !data) {
        alert(`Erro ao salvar: ${error?.message}`)
        setSaving(false)
        return
      }
      desafioId = data.id
    }

    const perguntasPayload = perguntasLimpa.map((q, idx) => ({
      desafio_id: desafioId,
      ordem: idx + 1,
      categoria: q.categoria,
      enunciado: q.enunciado,
      explicacao: q.explicacao || null,
      alternativas: q.alternativas.map((a, i) => ({ id: LETRAS[i], texto: a.texto, correta: a.correta })),
    }))
    const { error: perguntasError } = await supabase.from("desafios_clinicos_perguntas").insert(perguntasPayload)

    setSaving(false)
    if (perguntasError) {
      alert(`Erro ao salvar perguntas: ${perguntasError.message}`)
      return
    }
    if (isNew) {
      enfileirarAviso(
        "desafios_clinicos",
        "Novo desafio clínico disponível",
        `Adicionamos um novo desafio clínico: "${desafioPayload.titulo}". Já está disponível pra treinar!`,
        "/dashboard/desafios-clinicos"
      )
    }
    onOpenChange(false)
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{desafio ? "Editar Desafio Clínico" : "Novo Desafio Clínico"}</DialogTitle>
        </DialogHeader>

        {carregando ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando...
          </div>
        ) : (
          <>
            <div className="space-y-6 py-2">
              <div className="space-y-4">
                <div className="flex items-end gap-3">
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor="titulo">Título</Label>
                    <Input
                      id="titulo"
                      value={form.titulo}
                      onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
                      placeholder="Ex: Caso 6 — Diagnóstico por Imagens"
                    />
                  </div>
                  <div className="flex items-center gap-2 pb-2">
                    <Switch checked={form.ativo} onCheckedChange={(v) => setForm((p) => ({ ...p, ativo: v }))} />
                    <Label>Visível para os alunos</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Ícone</Label>
                    <Select value={form.icone} onValueChange={(v) => setForm((p) => ({ ...p, icone: v }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DESAFIO_ICONES.map((nome) => (
                          <SelectItem key={nome} value={nome}>
                            {nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Área</Label>
                    <Select value={form.area} onValueChange={(v) => setForm((p) => ({ ...p, area: v }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SEM_AREA}>Sem área definida</SelectItem>
                        {AREAS.map((a) => (
                          <SelectItem key={a} value={a}>
                            {a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Seção</Label>
                    <Select value={form.secao} onValueChange={(v) => setForm((p) => ({ ...p, secao: v }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SEM_SECAO}>Sem seção definida</SelectItem>
                        {DESAFIO_SECAO_KEYS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {desafioSecaoLabel[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">
                      Agrupamento por formato do caso (ex: Diagnóstico por Imagens), separado da área médica.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="imagemUrl">Imagem do caso (opcional)</Label>
                    <Input
                      id="imagemUrl"
                      value={form.imagemUrl}
                      onChange={(e) => setForm((p) => ({ ...p, imagemUrl: e.target.value }))}
                      placeholder="/desafios-clinicos/caso-01.jpg"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Mostrada ao aluno junto com a descrição do caso (ex: radiografia, ECG).
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="descricao">Descrição do caso (apresentado ao aluno)</Label>
                    <TextFormattingToolbar
                      textareaRef={descricaoRef}
                      value={form.descricao_caso}
                      onChange={(v) => setForm((p) => ({ ...p, descricao_caso: v }))}
                    />
                  </div>
                  <Textarea
                    id="descricao"
                    ref={descricaoRef}
                    value={form.descricao_caso}
                    onChange={(e) => setForm((p) => ({ ...p, descricao_caso: e.target.value }))}
                    placeholder="Contexto clínico do paciente..."
                    className="min-h-28"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Cada linha vira um parágrafo. Use *palavra* para negrito e _palavra_ para itálico.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Bibliografia</Label>
                  {form.bibliografia.map((ref, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={ref.titulo}
                        onChange={(e) => updateBibliografia(idx, "titulo", e.target.value)}
                        placeholder="Referência"
                        className="flex-1"
                      />
                      <Input
                        value={ref.url}
                        onChange={(e) => updateBibliografia(idx, "url", e.target.value)}
                        placeholder="URL (opcional)"
                        className="flex-1"
                      />
                      {form.bibliografia.length > 1 && (
                        <Button size="icon-sm" variant="ghost" onClick={() => removeBibliografia(idx)} aria-label="Remover referência">
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addBibliografia}>
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar referência
                  </Button>
                </div>
              </div>

              <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                <Label className="text-sm font-semibold">Perguntas</Label>

                {form.perguntas.map((pergunta, idx) => (
                  <div key={idx} className="space-y-3 rounded-lg border border-border bg-card p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-muted-foreground">Pergunta {idx + 1}</span>
                      {form.perguntas.length > 1 && (
                        <Button size="icon-sm" variant="ghost" onClick={() => removePergunta(idx)} aria-label="Remover pergunta">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Categoria</Label>
                      <Select value={pergunta.categoria} onValueChange={(v) => updatePergunta(idx, "categoria", v)}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIAS.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-xs text-muted-foreground">Enunciado</Label>
                        <TextFormattingToolbar
                          textareaRef={{ current: enunciadoRefs.current[idx] ?? null }}
                          value={pergunta.enunciado}
                          onChange={(v) => updatePergunta(idx, "enunciado", v)}
                        />
                      </div>
                      <Textarea
                        ref={(el) => {
                          enunciadoRefs.current[idx] = el
                        }}
                        value={pergunta.enunciado}
                        onChange={(e) => updatePergunta(idx, "enunciado", e.target.value)}
                        placeholder="Pergunta feita ao aluno..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Alternativas (marque a correta)</Label>
                      {pergunta.alternativas.map((alt, altIdx) => (
                        <div key={altIdx} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setAlternativaCorreta(idx, altIdx)}
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold uppercase transition-colors ${
                              alt.correta
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-border text-muted-foreground hover:border-emerald-500/50"
                            }`}
                            aria-label={`Marcar alternativa ${LETRAS[altIdx]} como correta`}
                          >
                            {LETRAS[altIdx]}
                          </button>
                          <Input
                            value={alt.texto}
                            onChange={(e) => updateAlternativaTexto(idx, altIdx, e.target.value)}
                            placeholder={`Alternativa ${LETRAS[altIdx].toUpperCase()}`}
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-xs text-muted-foreground">Explicação (mostrada após responder)</Label>
                        <TextFormattingToolbar
                          textareaRef={{ current: explicacaoRefs.current[idx] ?? null }}
                          value={pergunta.explicacao}
                          onChange={(v) => updatePergunta(idx, "explicacao", v)}
                        />
                      </div>
                      <Textarea
                        ref={(el) => {
                          explicacaoRefs.current[idx] = el
                        }}
                        value={pergunta.explicacao}
                        onChange={(e) => updatePergunta(idx, "explicacao", e.target.value)}
                        placeholder="Por que essa é a resposta correta..."
                      />
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addPergunta}>
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar pergunta
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button variant="gradient" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Desafio"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
