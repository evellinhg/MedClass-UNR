import Link from "next/link"
import { ListChecks, GraduationCap, Radio, History, LineChart, ArrowUpRight, type LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"

interface QuickItem {
  label: string
  description: string
  href: string
  icon: LucideIcon
  iconClass: string
}

const items: QuickItem[] = [
  { label: "Checklists", description: "Revise seus tópicos", href: "/checklists", icon: ListChecks, iconClass: "bg-accent text-accent-foreground" },
  { label: "Aulas", description: "Continue de onde parou", href: "/materias", icon: GraduationCap, iconClass: "bg-chart-3/15 text-chart-3" },
  { label: "Lives", description: "Próximas transmissões", href: "/tutoriais", icon: Radio, iconClass: "bg-chart-4/15 text-chart-4" },
  { label: "Histórico", description: "Simulados anteriores", href: "/performance", icon: History, iconClass: "bg-chart-5/15 text-chart-5" },
  { label: "Desempenho", description: "Análise detalhada", href: "/performance", icon: LineChart, iconClass: "bg-chart-2/15 text-chart-2" },
]

export function QuickAccess() {
  return (
    <section aria-labelledby="quick-access-title">
      <h2 id="quick-access-title" className="mb-3 text-base font-semibold text-foreground">
        Acesso Rápido
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((item) => (
          <Card key={item.label} className="group transition-colors hover:border-primary/40">
            <Link href={item.href} className="flex h-full flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.iconClass}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  )
}
