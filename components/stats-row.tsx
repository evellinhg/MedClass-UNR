import { ListChecks, GraduationCap, Radio, Clock, type LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface Stat {
  label: string
  current: number
  total: number
  unit: string
  icon: LucideIcon
  iconClass: string
}

const stats: Stat[] = [
  { label: "Checklists", current: 4, total: 750, unit: "concluídos", icon: ListChecks, iconClass: "bg-accent text-accent-foreground" },
  { label: "Aulas", current: 2, total: 211, unit: "assistidas", icon: GraduationCap, iconClass: "bg-chart-3/15 text-chart-3" },
  { label: "Lives", current: 8, total: 24, unit: "participadas", icon: Radio, iconClass: "bg-chart-4/15 text-chart-4" },
  { label: "Horas de estudo", current: 37, total: 120, unit: "nesta semana", icon: Clock, iconClass: "bg-chart-5/15 text-chart-5" },
]

export function StatsRow() {
  return (
    <section aria-label="Resumo de progresso" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const pct = Math.round((stat.current / stat.total) * 100)
        return (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconClass}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{pct}%</span>
            </div>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold text-foreground">{stat.current}</span>
              <span className="text-sm text-muted-foreground">/ {stat.total}</span>
            </div>
            <p className="text-sm font-medium text-foreground">{stat.label}</p>
            <p className="mb-3 text-xs text-muted-foreground">{stat.unit}</p>
            <Progress value={pct} className="h-1.5" />
          </Card>
        )
      })}
    </section>
  )
}
