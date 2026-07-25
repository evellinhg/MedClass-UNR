"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Row = Record<string, any>

interface AdminDataTableProps {
  table: string
  title: string
  createSql?: string
}

const HIDDEN_ON_FORM = new Set(["id", "created_at", "updated_at"])

function formatCell(value: unknown) {
  if (value === null || value === undefined) return <span className="text-muted-foreground">—</span>
  if (typeof value === "boolean") return <Badge variant={value ? "default" : "secondary"}>{value ? "sim" : "não"}</Badge>
  if (typeof value === "object") {
    const text = JSON.stringify(value)
    return <span className="font-mono text-xs">{text.length > 40 ? text.slice(0, 40) + "…" : text}</span>
  }
  const text = String(value)
  return text.length > 60 ? text.slice(0, 60) + "…" : text
}

export function AdminDataTable({ table, title, createSql }: AdminDataTableProps) {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [formValues, setFormValues] = useState<Record<string, string>>({})

  const isMissing = error?.toLowerCase().includes("could not find the table")

  const load = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.from(table).select("*").limit(200)
    if (error) {
      setError(error.message)
      setRows([])
    } else {
      setRows(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table])

  const columns = rows[0] ? Object.keys(rows[0]) : []
  const formFields = columns.filter((c) => !HIDDEN_ON_FORM.has(c))

  const handleDelete = async (row: Row) => {
    if (!row.id) return
    if (!confirm("Excluir este registro? Essa ação não pode ser desfeita.")) return
    const { error } = await supabase.from(table).delete().eq("id", row.id)
    if (error) {
      alert(`Erro ao excluir: ${error.message}`)
      return
    }
    setRows((prev) => prev.filter((r) => r.id !== row.id))
  }

  const handleCreate = async () => {
    setSaving(true)
    const payload: Row = {}
    for (const field of formFields) {
      if (formValues[field] !== undefined && formValues[field] !== "") {
        payload[field] = formValues[field]
      }
    }
    const { error } = await supabase.from(table).insert(payload)
    setSaving(false)
    if (error) {
      alert(`Erro ao salvar: ${error.message}`)
      return
    }
    setFormOpen(false)
    setFormValues({})
    load()
  }

  return (
    <Card className="border border-border bg-card p-0">
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <Badge variant="secondary">{table}</Badge>
          {!loading && !error && <span className="text-xs text-muted-foreground">{rows.length} registro(s)</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon-sm" variant="ghost" onClick={load} aria-label="Atualizar">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="gradient" className="gap-1.5" disabled={formFields.length === 0}>
                <Plus className="h-4 w-4" />
                Novo registro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo registro em {table}</DialogTitle>
              </DialogHeader>
              <div className="max-h-[60vh] space-y-3 overflow-y-auto py-2">
                {formFields.map((field) => (
                  <div key={field} className="space-y-1.5">
                    <Label htmlFor={`field-${field}`}>{field}</Label>
                    <Input
                      id={`field-${field}`}
                      value={formValues[field] ?? ""}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, [field]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setFormOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="gradient" onClick={handleCreate} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando...
        </div>
      ) : isMissing ? (
        <div className="space-y-3 p-6">
          <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Tabela "{table}" ainda não existe no Supabase.</p>
              <p className="mt-1 text-warning/80">
                Crie-a no editor SQL do Supabase para habilitar este CRUD.
              </p>
            </div>
          </div>
          {createSql && (
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs text-foreground">
              <code>{createSql}</code>
            </pre>
          )}
        </div>
      ) : error ? (
        <div className="p-6 text-sm text-destructive">Erro: {error}</div>
      ) : rows.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted-foreground">
          Tabela vazia. Adicione o primeiro registro pelo Supabase para habilitar o formulário dinâmico aqui.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col}>{col}</TableHead>
              ))}
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={row.id ?? idx}>
                {columns.map((col) => (
                  <TableCell key={col}>{formatCell(row[col])}</TableCell>
                ))}
                <TableCell className="text-right">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(row)}
                    aria-label="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  )
}
