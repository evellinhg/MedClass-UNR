"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { CalendarioEvento, CalendarioEventoTipo } from "@/lib/calendario-types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  evento: CalendarioEvento | null
  onSaved: () => void
}

interface FormState {
  titulo: string
  descricao: string
  data: string
  hora: string
  tipo: CalendarioEventoTipo
  link: string
  ativo: boolean
}

function emptyForm(): FormState {
  return { titulo: "", descricao: "", data: "", hora: "", tipo: "comunidade", link: "", ativo: true }
}

export function CalendarioEventoEditDialog({ open, onOpenChange, evento, onSaved }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (evento) {
      setForm({
        titulo: evento.titulo,
        descricao: evento.descricao ?? "",
        data: evento.data,
        hora: evento.hora ?? "",
        tipo: evento.tipo,
        link: evento.link ?? "",
        ativo: evento.ativo,
      })
    } else {
      setForm(emptyForm())
    }
  }, [open, evento])

  const handleSave = async () => {
    if (!form.titulo.trim() || !form.data) {
      alert("Preencha ao menos o título e a data.")
      return
    }
    setSaving(true)
    const payload = {
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim() || null,
      data: form.data,
      hora: form.hora || null,
      tipo: form.tipo,
      link: form.link.trim() || null,
      ativo: form.ativo,
    }

    const { error } = evento
      ? await supabase.from("calendario_eventos").update(payload).eq("id", evento.id)
      : await supabase.from("calendario_eventos").insert(payload)

    setSaving(false)
    if (error) {
      alert(`Erro ao salvar: ${error.message}`)
      return
    }
    onOpenChange(false)
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{evento ? "Editar Evento" : "Novo Evento do Calendário"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="ce-titulo">Título</Label>
            <Input
              id="ce-titulo"
              value={form.titulo}
              onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
              placeholder="Ex: Abertura de inscrições — Revalida INEP"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ce-data">Data</Label>
              <Input
                id="ce-data"
                type="date"
                value={form.data}
                onChange={(e) => setForm((p) => ({ ...p, data: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ce-hora">Horário (opcional)</Label>
              <Input
                id="ce-hora"
                type="time"
                value={form.hora}
                onChange={(e) => setForm((p) => ({ ...p, hora: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={form.tipo} onValueChange={(v) => setForm((p) => ({ ...p, tipo: v as CalendarioEventoTipo }))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inscricao">Abertura de Inscrição</SelectItem>
                <SelectItem value="prova">Data de Prova</SelectItem>
                <SelectItem value="comunidade">Evento da Comunidade</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ce-descricao">Descrição (opcional)</Label>
            <Textarea
              id="ce-descricao"
              value={form.descricao}
              onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
              className="min-h-24"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ce-link">Link (opcional)</Label>
            <Input
              id="ce-link"
              type="url"
              value={form.link}
              onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={form.ativo} onCheckedChange={(v) => setForm((p) => ({ ...p, ativo: v }))} />
            <Label>Visível para os alunos</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="gradient" onClick={handleSave} disabled={saving} className="gap-1.5">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
