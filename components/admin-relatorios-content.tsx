"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { AlertTriangle, Loader2, TrendingUp, Users, ClipboardX, MessageSquareWarning } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

interface ReportsData {
  resumo: {
    simulados_total: number
    simulados_finalizados: number
    simulados_abandonados: number
    taxa_abandono_simulados_pct: number
    tentativas_total: number
    desafios_total: number
    feedback_total: number
    feedback_pendente: number
    ativos_7d: number
    ativos_30d: number
  }
  dificuldade_por_area: { area: string; tentativas: number; acerto_medio_pct: number; abandono_pct: number }[]
  desempenho_por_assunto: { assunto: string; tentativas: number; acerto_medio_pct: number }[]
  dificuldade_desafios_por_area: { area: string; tentativas: number; acerto_medio_pct: number }[]
  questoes_mais_reportadas: { question_id: string; total: number; pendentes: number }[]
  progresso_semanal: { semana: string; acerto_medio_pct: number; tentativas: number }[]
}

const chartConfig = {
  acerto_medio_pct: { label: "Acerto médio (%)", color: "var(--chart-1)" },
} satisfies ChartConfig

async function authedFetch(input: string) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return fetch(input, { headers: { Authorization: `Bearer ${token}` } })
}

function StatTile({ label, value, icon: Icon }: { label: string; value: string | number; icon: typeof Users }) {
  return (
    <Card className="border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">{value}</p>
          <p className="text-[11px] text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  )
}

function formatWeek(value: string) {
  const d = new Date(`${value}T00:00:00Z`)
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}

export function AdminRelatoriosContent() {
  const [data, setData] = useState<ReportsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    authedFetch("/api/admin/reports").then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? "Erro ao carregar relatórios.")
        setLoading(false)
        return
      }
      setData(await res.json())
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando relatórios...
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card className="border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error ?? "Nenhum dado disponível."}</span>
        </div>
      </Card>
    )
  }

  const { resumo } = data

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Simulados finalizados" value={resumo.simulados_finalizados} icon={TrendingUp} />
        <StatTile label="Taxa de desistência" value={`${resumo.taxa_abandono_simulados_pct}%`} icon={ClipboardX} />
        <StatTile label="Alunos ativos (7 dias)" value={resumo.ativos_7d} icon={Users} />
        <StatTile label="Feedback pendente" value={resumo.feedback_pendente} icon={MessageSquareWarning} />
      </div>

      <Card className="border border-border bg-card p-4">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Progresso — acerto médio semanal (últimas 12 semanas)</h3>
        <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
          <LineChart data={data.progresso_semanal} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="semana"
              tickFormatter={formatWeek}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={[0, 100]} width={40} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => formatWeek(String(value))}
                  formatter={(value, _name, item) => [`${value}% (${item.payload.tentativas} tentativas)`, "Acerto médio"]}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="acerto_medio_pct"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>
      </Card>

      <Card className="border border-border bg-card p-0">
        <div className="border-b border-border p-4">
          <h3 className="text-sm font-semibold text-foreground">Dificuldade por área (simulados)</h3>
          <p className="text-xs text-muted-foreground">Acerto médio e desistência por área clínica.</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Área</TableHead>
              <TableHead>Tentativas</TableHead>
              <TableHead>Acerto médio</TableHead>
              <TableHead>Desistência</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.dificuldade_por_area.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                  Sem dados ainda.
                </TableCell>
              </TableRow>
            ) : (
              data.dificuldade_por_area.map((row) => (
                <TableRow key={row.area}>
                  <TableCell className="font-medium text-foreground">{row.area}</TableCell>
                  <TableCell>{row.tentativas}</TableCell>
                  <TableCell>{row.acerto_medio_pct}%</TableCell>
                  <TableCell>{row.abandono_pct}%</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Card className="border border-border bg-card p-0">
        <div className="border-b border-border p-4">
          <h3 className="text-sm font-semibold text-foreground">Desempenho por assunto (treino avulso)</h3>
          <p className="text-xs text-muted-foreground">Tentativas de questões individuais fora de um simulado.</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assunto</TableHead>
              <TableHead>Tentativas</TableHead>
              <TableHead>Acerto médio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.desempenho_por_assunto.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                  Sem dados ainda.
                </TableCell>
              </TableRow>
            ) : (
              data.desempenho_por_assunto.map((row) => (
                <TableRow key={row.assunto}>
                  <TableCell className="font-medium text-foreground">{row.assunto}</TableCell>
                  <TableCell>{row.tentativas}</TableCell>
                  <TableCell>{row.acerto_medio_pct}%</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Card className="border border-border bg-card p-0">
        <div className="border-b border-border p-4">
          <h3 className="text-sm font-semibold text-foreground">Dificuldade por área (desafios clínicos)</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Área</TableHead>
              <TableHead>Tentativas</TableHead>
              <TableHead>Acerto médio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.dificuldade_desafios_por_area.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                  Sem dados ainda.
                </TableCell>
              </TableRow>
            ) : (
              data.dificuldade_desafios_por_area.map((row) => (
                <TableRow key={row.area}>
                  <TableCell className="font-medium text-foreground">{row.area}</TableCell>
                  <TableCell>{row.tentativas}</TableCell>
                  <TableCell>{row.acerto_medio_pct}%</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Card className="border border-border bg-card p-0">
        <div className="border-b border-border p-4">
          <h3 className="text-sm font-semibold text-foreground">Questões mais reportadas com erro/dúvida</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Questão (ID)</TableHead>
              <TableHead>Total de relatos</TableHead>
              <TableHead>Pendentes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.questoes_mais_reportadas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                  Nenhum relato ainda.
                </TableCell>
              </TableRow>
            ) : (
              data.questoes_mais_reportadas.map((row) => (
                <TableRow key={row.question_id}>
                  <TableCell className="break-all font-mono text-xs text-foreground">{row.question_id}</TableCell>
                  <TableCell>{row.total}</TableCell>
                  <TableCell>{row.pendentes}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
