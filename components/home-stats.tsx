import { TrendingUp, BookOpen, Clock, Target } from "lucide-react"

export function HomeStats() {
  const stats = [
    {
      label: "Taxa de Acerto",
      value: "78%",
      icon: Target,
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Questões Feitas",
      value: "342",
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Tempo de Estudo",
      value: "24h 30m",
      icon: Clock,
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-500/10",
    },
    {
      label: "Melhora em 7d",
      value: "+5.2%",
      icon: TrendingUp,
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-emerald-500/10",
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-6 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className="mt-3 text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`rounded-lg ${stat.bgColor} p-3`}>
                <Icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
