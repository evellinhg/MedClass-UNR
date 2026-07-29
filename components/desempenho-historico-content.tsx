"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pagination, PAGE_SIZE } from "@/components/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/lib/i18n"

interface Attempt {
  id: string
  subject: string | null
  total_questions: number
  correct_count: number
  wrong_count: number
  points: number
  created_at: string
}

const ALL_SUBJECTS = "__ALL__"

export function DesempenhoHistoricoContent() {
  const { t } = useLanguage()
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)
  const [subjectFilter, setSubjectFilter] = useState(ALL_SUBJECTS)
  const [page, setPage] = useState(1)

  function statusFor(accuracy: number) {
    if (accuracy >= 70) return { label: t.desempenhoHistorico.statusBom, className: "bg-success/15 text-success" }
    if (accuracy >= 50) return { label: t.desempenhoHistorico.statusRegular, className: "bg-warning/15 text-warning" }
    return { label: t.desempenhoHistorico.statusReforcar, className: "bg-destructive/15 text-destructive" }
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        setLoading(false)
        return
      }
      supabase
        .from("simulado_attempts")
        .select("id, subject, total_questions, correct_count, wrong_count, points, created_at")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false })
        .then(({ data: rows }) => {
          setAttempts((rows as Attempt[]) ?? [])
          setLoading(false)
        })
    })
  }, [])

  const subjects = useMemo(
    () => Array.from(new Set(attempts.map((a) => a.subject).filter(Boolean) as string[])),
    [attempts]
  )

  const filtered = useMemo(
    () => (subjectFilter === ALL_SUBJECTS ? attempts : attempts.filter((a) => a.subject === subjectFilter)),
    [attempts, subjectFilter]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t.desempenhoHistorico.carregando}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">{t.desempenhoHistorico.filtrarPorArea}</span>
          <Select value={subjectFilter} onValueChange={(v) => { setSubjectFilter(v); setPage(1) }}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder={t.desempenhoHistorico.area} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_SUBJECTS}>{t.desempenhoHistorico.todas}</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="border border-border bg-card p-0">
        {filtered.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">
            {attempts.length === 0 ? t.desempenhoHistorico.vazioGeral : t.desempenhoHistorico.vazioFiltro}
          </p>
        ) : (() => {
          const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
          const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
          return (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.desempenhoHistorico.data}</TableHead>
                    <TableHead>{t.desempenhoHistorico.colArea}</TableHead>
                    <TableHead className="text-right">{t.desempenhoHistorico.acertos}</TableHead>
                    <TableHead className="text-right">{t.desempenhoHistorico.erros}</TableHead>
                    <TableHead className="text-right">{t.desempenhoHistorico.pontos}</TableHead>
                    <TableHead className="text-right">{t.desempenhoHistorico.status}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((attempt) => {
                    const accuracy =
                      attempt.total_questions > 0
                        ? Math.round((attempt.correct_count / attempt.total_questions) * 100)
                        : 0
                    const status = statusFor(accuracy)
                    return (
                      <TableRow key={attempt.id}>
                        <TableCell className="text-muted-foreground">
                          {new Date(attempt.created_at).toLocaleDateString(t.desempenhoHistorico.localeData)}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{attempt.subject ?? "—"}</TableCell>
                        <TableCell className="text-right font-semibold text-success">
                          {attempt.correct_count}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-destructive">
                          {attempt.wrong_count}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-foreground">{attempt.points}</TableCell>
                        <TableCell className="text-right">
                          <Badge className={`border-0 ${status.className}`}>{status.label}</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              <div className="border-t border-border">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </>
          )
        })()}
      </Card>
    </div>
  )
}
