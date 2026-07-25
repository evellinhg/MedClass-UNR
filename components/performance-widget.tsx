"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"

const performanceData = [
  { week: "Sem 1", media: 62, corte: 70 },
  { week: "Sem 2", media: 65, corte: 70 },
  { week: "Sem 3", media: 68, corte: 70 },
  { week: "Sem 4", media: 71, corte: 70 },
  { week: "Sem 5", media: 74, corte: 70 },
  { week: "Sem 6", media: 73, corte: 70 },
  { week: "Sem 7", media: 78, corte: 70 },
  { week: "Sem 8", media: 81, corte: 70 },
]

const chartConfig = {
  media: { label: "Média", color: "var(--chart-1)" },
  corte: { label: "Nota de corte", color: "var(--muted-foreground)" },
} satisfies ChartConfig

const subjects = [
  { code: "CM", name: "Clínica Médica", value: 84 },
  { code: "CIR", name: "Cirurgia", value: 71 },
  { code: "GO", name: "Gineco/Obst.", value: 66 },
  { code: "PED", name: "Pediatria", value: 78 },
  { code: "PREV", name: "Prev. Social", value: 59 },
]

export function PerformanceWidget() {
  const currentAvg = performanceData[performanceData.length - 1].media
  const cutoff = performanceData[performanceData.length - 1].corte
  const diff = currentAvg - cutoff

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Performance / Rotina</CardTitle>
            <CardDescription>Evolução da média geral frente à nota de corte</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-semibold text-foreground">{currentAvg}%</p>
              <p className="text-xs text-muted-foreground">Média atual</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-muted-foreground">{cutoff}%</p>
              <p className="text-xs text-muted-foreground">Nota de corte</p>
            </div>
          </div>
        </div>
        <div className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
          <TrendingUp className="h-3.5 w-3.5" />
          {`+${diff} pts acima do corte`}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <LineChart data={performanceData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
            <YAxis
              domain={[40, 100]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              width={44}
              tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              dataKey="corte"
              type="monotone"
              stroke="var(--color-corte)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
            <Line
              dataKey="media"
              type="monotone"
              stroke="var(--color-media)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "var(--color-media)" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>

        <div className="mt-6">
          <p className="mb-3 text-sm font-medium text-foreground">Desempenho por matéria</p>
          <div className="space-y-3">
            {subjects.map((s) => (
              <div key={s.code} className="flex items-center gap-3">
                <span className="w-14 shrink-0 rounded-md bg-secondary px-2 py-1 text-center text-xs font-semibold text-secondary-foreground">
                  {s.code}
                </span>
                <span className="hidden w-28 shrink-0 truncate text-xs text-muted-foreground sm:block">{s.name}</span>
                <Progress value={s.value} className="h-2 flex-1" />
                <span className="w-9 shrink-0 text-right text-xs font-medium text-foreground">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
