"use client"

import { useEffect, useState } from "react"
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
import { MedalIcon } from "@/components/medal-icon"
import {
  CATEGORIAS_MEDALHA,
  ICONES_MEDALHA,
  RARIDADE_LABEL,
  type Medalha,
  type MedalhaCriterioTipo,
  type MedalhaRaridade,
} from "@/lib/conquistas-types"

const CRITERIO_LABEL: Record<MedalhaCriterioTipo, string> = {
  manual: "Manual (concedida só pelo admin)",
  primeira_sessao: "Primeira sessão completada",
  contagem_total: "Contagem de sessões completadas",
  nota_media_minima: "Média de acerto mínima",
  streak_dias: "Dias seguidos estudando",
  medcoins_acumulados: "MedCoins acumulados",
  perfeitos_seguidos: "Sessões seguidas com 100% de acerto",
}

const RARIDADES: MedalhaRaridade[] = ["comum", "rara", "epica", "lendaria"]

const emptyForm = {
  chave: "",
  nome: "",
  descricao: "",
  categoria: "geral",
  icone: "award",
  raridade: "comum" as MedalhaRaridade,
  recompensaMedcoins: 0,
  ativo: true,
  criterioTipo: "manual" as MedalhaCriterioTipo,
  minimo: 1,
  sessao: "qualquer" as "qualquer" | "simulado" | "individual",
  sessoesMinimas: 5,
}

export function AdminMedalhasContent() {
  const [medalhas, setMedalhas] = useState<Medalha[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from("medcoins_medalhas").select("*").order("created_at", { ascending: false })
    setMedalhas((data as Medalha[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (m: Medalha) => {
    setEditingId(m.id)
    setForm({
      chave: m.chave,
      nome: m.nome,
      descricao: m.descricao ?? "",
      categoria: m.categoria,
      icone: m.icone,
      raridade: m.raridade,
      recompensaMedcoins: m.recompensa_medcoins,
      ativo: m.ativo,
      criterioTipo: m.criterio.tipo,
      minimo: m.criterio.minimo ?? 1,
      sessao: m.criterio.sessao ?? "qualquer",
      sessoesMinimas: m.criterio.sessoes_minimas ?? 5,
    })
    setDialogOpen(true)
  }

  const buildCriterio = () => {
    const c: Record<string, unknown> = { tipo: form.criterioTipo }
    if (["contagem_total", "nota_media_minima", "streak_dias", "medcoins_acumulados", "perfeitos_seguidos"].includes(form.criterioTipo)) {
      c.minimo = form.minimo
    }
    if (form.criterioTipo === "contagem_total" && form.sessao !== "qualquer") {
      c.sessao = form.sessao
    }
    if (form.criterioTipo === "nota_media_minima") {
      c.sessoes_minimas = form.sessoesMinimas
    }
    return c
  }

  const handleSave = async () => {
    if (!form.nome.trim() || !form.chave.trim()) return
    setSaving(true)

    const payload = {
      chave: form.chave.trim(),
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || null,
      categoria: form.categoria,
      icone: form.icone,
      raridade: form.raridade,
      recompensa_medcoins: form.recompensaMedcoins,
      ativo: form.ativo,
      criterio: buildCriterio(),
    }

    const { error } = editingId
      ? await supabase.from("medcoins_medalhas").update(payload).eq("id", editingId)
      : await supabase.from("medcoins_medalhas").insert(payload)

    setSaving(false)
    if (error) {
      alert(`Erro ao salvar: ${error.message}`)
      return
    }
    setDialogOpen(false)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta medalha? Os alunos que já a conquistaram vão perdê-la do histórico.")) return
    await supabase.from("medcoins_medalhas").delete().eq("id", id)
    setMedalhas((prev) => prev.filter((m) => m.id !== id))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {medalhas.length} medalha{medalhas.length !== 1 ? "s" : ""} cadastrada{medalhas.length !== 1 ? "s" : ""}
        </p>
        <Button variant="gradient" className="gap-1.5" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nova medalha
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {medalhas.map((m) => (
          <Card key={m.id} className="flex items-start gap-3 border border-border bg-card p-4">
            <MedalIcon icone={m.icone} raridade={m.raridade} conquistada={m.ativo} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{m.nome}</p>
              <p className="text-xs text-muted-foreground">{RARIDADE_LABEL[m.raridade]} · {CRITERIO_LABEL[m.criterio.tipo]}</p>
              {!m.ativo && <p className="mt-0.5 text-[11px] font-medium text-destructive">Inativa</p>}
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <Button size="icon-sm" variant="ghost" onClick={() => openEdit(m)} aria-label="Editar">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => handleDelete(m.id)}
                aria-label="Excluir"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar medalha" : "Nova medalha"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Chave única</Label>
                <Input
                  value={form.chave}
                  onChange={(e) => setForm({ ...form, chave: e.target.value })}
                  placeholder="ex: dez_simulados"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Nome</Label>
                <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="min-h-16"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS_MEDALHA.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Ícone</Label>
                <Select value={form.icone} onValueChange={(v) => setForm({ ...form, icone: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ICONES_MEDALHA.map((i) => (
                      <SelectItem key={i} value={i}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Raridade</Label>
                <Select value={form.raridade} onValueChange={(v) => setForm({ ...form, raridade: v as MedalhaRaridade })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RARIDADES.map((r) => (
                      <SelectItem key={r} value={r}>{RARIDADE_LABEL[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Critério de desbloqueio</Label>
              <Select
                value={form.criterioTipo}
                onValueChange={(v) => setForm({ ...form, criterioTipo: v as MedalhaCriterioTipo })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(CRITERIO_LABEL) as MedalhaCriterioTipo[]).map((t) => (
                    <SelectItem key={t} value={t}>{CRITERIO_LABEL[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {form.criterioTipo === "contagem_total" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Quantidade mínima</Label>
                  <Input
                    type="number"
                    value={form.minimo}
                    onChange={(e) => setForm({ ...form, minimo: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Tipo de sessão</Label>
                  <Select value={form.sessao} onValueChange={(v) => setForm({ ...form, sessao: v as typeof form.sessao })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="qualquer">Qualquer (simulado ou avulso)</SelectItem>
                      <SelectItem value="simulado">Só simulados salvos</SelectItem>
                      <SelectItem value="individual">Só treino avulso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {form.criterioTipo === "nota_media_minima" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Média mínima (%)</Label>
                  <Input
                    type="number"
                    value={form.minimo}
                    onChange={(e) => setForm({ ...form, minimo: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Mínimo de sessões consideradas</Label>
                  <Input
                    type="number"
                    value={form.sessoesMinimas}
                    onChange={(e) => setForm({ ...form, sessoesMinimas: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            )}

            {(form.criterioTipo === "streak_dias" ||
              form.criterioTipo === "medcoins_acumulados" ||
              form.criterioTipo === "perfeitos_seguidos") && (
              <div className="space-y-1.5">
                <Label>
                  {form.criterioTipo === "streak_dias"
                    ? "Dias seguidos mínimos"
                    : form.criterioTipo === "medcoins_acumulados"
                      ? "MedCoins acumulados mínimos"
                      : "Sessões perfeitas seguidas mínimas"}
                </Label>
                <Input
                  type="number"
                  value={form.minimo}
                  onChange={(e) => setForm({ ...form, minimo: parseInt(e.target.value) || 0 })}
                />
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Recompensa em MedCoins</Label>
                <Input
                  type="number"
                  value={form.recompensaMedcoins}
                  onChange={(e) => setForm({ ...form, recompensaMedcoins: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <Label>Ativa</Label>
                <Switch checked={form.ativo} onCheckedChange={(v) => setForm({ ...form, ativo: v })} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button variant="gradient" onClick={handleSave} disabled={saving || !form.nome.trim() || !form.chave.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
