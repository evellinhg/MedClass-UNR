import {
  Home,
  CalendarDays,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  Trophy,
  Coins,
  Medal,
  MessageSquare,
  Stethoscope,
  type LucideIcon,
} from "lucide-react"

export interface NavChild {
  name: string
  href: string
}

export interface NavItem {
  name: string
  href: string
  icon: LucideIcon
  children?: NavChild[]
}

export const navigation: NavItem[] = [
  { name: "Início", href: "/dashboard", icon: Home },
  { name: "Cronograma", href: "/dashboard/cronograma", icon: CalendarDays },
  { name: "Materiais", href: "/dashboard/materiais", icon: BookOpen },
  { name: "Simulados", href: "/dashboard/simulados", icon: ClipboardCheck },
  {
    name: "Desempenho",
    href: "/dashboard/desempenho/estatisticas",
    icon: BarChart3,
    children: [
      { name: "Histórico", href: "/dashboard/desempenho/historico" },
      { name: "Estatísticas", href: "/dashboard/desempenho/estatisticas" },
    ],
  },
  {
    name: "Desafios Clínicos",
    href: "/dashboard/desafios-clinicos",
    icon: Stethoscope,
    children: [
      { name: "Estudar", href: "/dashboard/desafios-clinicos" },
      { name: "Desempenho", href: "/dashboard/desafios-clinicos/desempenho" },
    ],
  },
  { name: "Ranking", href: "/dashboard/ranking", icon: Trophy },
  { name: "MedCoins", href: "/dashboard/medcoins", icon: Coins },
  { name: "Conquistas", href: "/dashboard/conquistas", icon: Medal },
  { name: "Feedback", href: "/dashboard/feedback", icon: MessageSquare },
]
