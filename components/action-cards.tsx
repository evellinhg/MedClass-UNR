import Link from "next/link"
import { Zap, Plus } from "lucide-react"

export function ActionCards() {
  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
      {/* Praticar */}
      <Link href="/dashboard/simulados" className="group">
        <div className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-purple-900/20 to-indigo-900/20 p-8 hover:border-primary/50 transition-colors">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl group-hover:bg-purple-500/20 transition-colors" />
          <div className="relative">
            <div className="mb-4 inline-flex rounded-lg bg-purple-500/20 p-3">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Praticar Agora</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Resolva questões selecionadas para consolidar seu aprendizado.
            </p>
            <div className="mt-6 inline-flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
              Iniciar sessão
              <span className="ml-2">→</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Criar Simulado */}
      <Link href="/dashboard/simulados?novo=true" className="group">
        <div className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-indigo-900/20 to-blue-900/20 p-8 hover:border-primary/50 transition-colors">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-colors" />
          <div className="relative">
            <div className="mb-4 inline-flex rounded-lg bg-indigo-500/20 p-3">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Criar Simulado</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Monte um simulado personalizado com as matérias que precisa estudar.
            </p>
            <div className="mt-6 inline-flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
              Criar novo
              <span className="ml-2">→</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
