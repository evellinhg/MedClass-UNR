"use client"

import { useEffect, useMemo, useState } from "react"
import { FileText, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { enfileirarAviso } from "@/lib/avisos"
import { AREAS } from "@/lib/quiz-config"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Resumo, ResumoSecao } from "@/lib/resumos-types"

interface ResumoForm {
  titulo: string
  especialidade: string
  ordem: number
  ativo: boolean
  secoes: ResumoSecao[]
  bibliografia: string[]
  tags: string
}

const emptySecao = (): ResumoSecao => ({ titulo: "", corpo: "" })

export function AdminResumosContent() {
  const [resumos, setResumos] = useState<Resumo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ResumoForm>(emptyForm(1))

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from("materiais_resumos").select("*").order("ordem")
    setResumos((data as Resumo[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function emptyForm(proximaOrdem: number): ResumoForm {
    return {
      titulo: "",
      especialidade: AREAS[0],
      ordem: proximaOrdem,
      ativo: true,
      secoes: [emptySecao()],
      bibliografia: [""],
      tags: "",
    }
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return resumos
    return resumos.filter((r) => r.titulo.toLowerCase().includes(term) || r.especialidade.toLowerCase().includes(term))
  }, [resumos, search])

  const openNew = () => {
    const proximaOrdem = resumos.length > 0 ? Math.max(...resumos.map((r) => r.ordem)) + 1 : 1
    setEditingId(null)
    setForm(emptyForm(proximaOrdem))
    setDialogOpen(true)
  }

  const openEdit = (resumo: Resumo) => {
    setEditingId(resumo.id)
    setForm({
      titulo: resumo.titulo,
      especialidade: resumo.especialidade,
      ordem: resumo.ordem,
      ativo: resumo.ativo,
      secoes: resumo.secoes.length ? resumo.secoes : [emptySecao()],
      bibliografia: resumo.bibliografia.length ? resumo.bibliografia : [""],
      tags: resumo.tags.join(", "),
    })
    setDialogOpen(true)
  }

  const handleToggleAtivo = async (resumo: Resumo) => {
    setResumos((prev) => prev.map((r) => (r.id === resumo.id ? { ...r, ativo: !r.ativo } : r)))
    await supabase.from("materiais_resumos").update({ ativo: !resumo.ativo }).eq("id", resumo.id)
  }

  const addSecao = () => setForm((p) => ({ ...p, secoes: [...p.secoes, emptySecao()] }))
  const removeSecao = (idx: number) => setForm((p) => ({ ...p, secoes: p.secoes.filter((_, i) => i !== idx) }))
  const updateSecao = (idx: number, field: keyof ResumoSecao, value: string) =>
    setForm((p) => ({ ...p, secoes: p.secoes.map((s, i) => (i === idx ? { ...s, [field]: value } : s)) }))

  const addRef = () => setForm((p) => ({ ...p, bibliografia: [...p.bibliografia, ""] }))
  const removeRef = (idx: number) => setForm((p) => ({ ...p, bibliografia: p.bibliografia.filter((_, i) => i !== idx) }))
  const updateRef = (idx: number, value: string) =>
    setForm((p) => ({ ...p, bibliografia: p.bibliografia.map((r, i) => (i === idx ? value : r)) }))

  const handleSave = async () => {
    if (!form.titulo.trim()) {
      alert("Preencha o título do resumo.")
      return
    }
    const secoesLimpa = form.secoes
      .map((s) => ({ titulo: s.titulo.trim(), corpo: s.corpo.trim() }))
      .filter((s) => s.titulo && s.corpo)
    if (secoesLimpa.length === 0) {
      alert("Adicione ao menos uma seção com título e conteúdo.")
      return
    }

    setSaving(true)
    const payload = {
      titulo: form.titulo.trim(),
      especialidade: form.especialidade,
      ordem: form.ordem,
      ativo: form.ativo,
      secoes: secoesLimpa,
      bibliografia: form.bibliografia.map((b) => b.trim()).filter(Boolean),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    }

    const isNew = !editingId
    const { error } = editingId
      ? await supabase.from("materiais_resumos").update(payload).eq("id", editingId)
      : await supabase.from("materiais_resumos").insert(payload)

    setSaving(false)
    if (error) {
      alert(`Erro ao salvar: ${error.message}`)
      return
    }
    if (isNew) {
      enfileirarAviso(
        "resumos",
        "Novo resumo disponível",
        `Adicionamos um novo resumo: "${payload.titulo}" (${payload.especialidade}). Já está disponível pra estudar!`,
        "/dashboard/materiais?tab=resumos"
      )
    }
    setDialogOpen(false)
    load()
  }

  const handleDelete = async (resumo: Resumo) => {
    if (!confirm(`Excluir o resumo "${resumo.titulo}"? Essa ação não pode ser desfeita.`)) return
    const { error } = await supabase.from("materiais_resumos").delete().eq("id", resumo.id)
    if (error) {
      alert(`Erro ao excluir: ${error.message}`)
      return
    }
    setResumos((prev) => prev.filter((r) => r.id !== resumo.id))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou especialidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="gradient" className="gap-1.5" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Novo Resumo
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando resumos...
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Nenhum resumo encontrado.
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((resumo) => (
            <Card key={resumo.id} className="border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{resumo.especialidade}</Badge>
                    <Badge variant="outline">Ordem {resumo.ordem}</Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      {resumo.secoes.length} seções
                    </span>
                  </div>
                  <p className="font-medium text-foreground">{resumo.titulo}</p>
                  {resumo.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {resumo.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Ativo</span>
                    <Switch checked={resumo.ativo} onCheckedChange={() => handleToggleAtivo(resumo)} />
                  </div>
                  <Button size="icon-sm" variant="ghost" onClick={() => openEdit(resumo)} aria-label="Editar">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(resumo)}
                    aria-label="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Resumo" : "Novo Resumo"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={form.titulo}
                  onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
                  placeholder="Ex: Arritmias Cardíacas — Guia Rápido"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Especialidade</Label>
                  <Select value={form.especialidade} onValueChange={(v) => setForm((p) => ({ ...p, especialidade: v }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AREAS.map((a) => (
                        <SelectItem key={a} value={a}>
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ordem">Ordem de exibição</Label>
                  <Input
                    id="ordem"
                    type="number"
                    min={1}
                    value={form.ordem}
                    onChange={(e) => setForm((p) => ({ ...p, ordem: Number(e.target.value) || 1 }))}
                  />
                </div>
                <div className="flex items-end gap-2 pb-2">
                  <Switch checked={form.ativo} onCheckedChange={(v) => setForm((p) => ({ ...p, ativo: v }))} />
                  <Label>Visível para os alunos</Label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                <p className="text-xs text-muted-foreground">
                  Usadas na busca da plataforma. Inclua o tema central (ex: Hipertensão) e a especialidade (ex: Clínica
                  Médica).
                </p>
                <Input
                  id="tags"
                  value={form.tags}
                  onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                  placeholder="Ex: Arritmia, Fibrilação Atrial, Clínica Médica"
                />
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
              <Label className="text-sm font-semibold">Seções do resumo</Label>
              <p className="text-xs text-muted-foreground">
                Use <code>**texto**</code> para negrito e linhas começando com <code>- </code> para listas dentro do
                conteúdo de cada seção.
              </p>

              {form.secoes.map((secao, idx) => (
                <div key={idx} className="space-y-2 rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={secao.titulo}
                      onChange={(e) => updateSecao(idx, "titulo", e.target.value)}
                      placeholder={`Título da seção ${idx + 1} (ex: Anamnese)`}
                      className="flex-1"
                    />
                    {form.secoes.length > 1 && (
                      <Button size="icon-sm" variant="ghost" onClick={() => removeSecao(idx)} aria-label="Remover seção">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={secao.corpo}
                    onChange={(e) => updateSecao(idx, "corpo", e.target.value)}
                    placeholder="Conteúdo da seção..."
                    className="min-h-32"
                  />
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addSecao}>
                <Plus className="h-3.5 w-3.5" />
                Adicionar seção
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Bibliografia</Label>
              {form.bibliografia.map((ref, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input value={ref} onChange={(e) => updateRef(idx, e.target.value)} placeholder={`Referência ${idx + 1}`} />
                  {form.bibliografia.length > 1 && (
                    <Button size="icon-sm" variant="ghost" onClick={() => removeRef(idx)} aria-label="Remover referência">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addRef}>
                <Plus className="h-3.5 w-3.5" />
                Adicionar referência
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="gradient" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Resumo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
