import Link from "next/link"
import { ArrowRight, Zap, Plus } from "lucide-react"

export function ActionCards() {
  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
      {/* Praticar */}
      <Link href="/dashboard/simulados" className="group">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#4338ca] p-8 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_-8px_rgba(124,58,237,0.55)]">
          <div className="absolute -right-6 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl transition-opacity duration-300 group-hover:opacity-80" />
          <div className="relative">
            <div className="mb-4 inline-flex rounded-lg bg-white/15 p-3">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">Praticar Agora</h3>
            <p className="mt-2 text-sm text-white/80">
              Resolva questões selecionadas para consolidar seu aprendizado.
            </p>
            <div className="mt-6 inline-flex items-center text-sm font-medium text-white transition-transform group-hover:translate-x-1">
              Iniciar sessão
              <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </div>
        </div>
      </Link>

      {/* Criar Simulado */}
      <Link href="/dashboard/simulados?novo=true" className="group">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#c6ff3a] to-[#84cc16] p-8 text-[#0a1f00] shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_-8px_rgba(198,255,58,0.55)]">
          <div className="absolute -right-6 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl transition-opacity duration-300 group-hover:opacity-80" />
          <div className="relative">
            <div className="mb-4 inline-flex rounded-lg bg-white/15 p-3">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">Criar Simulado</h3>
            <p className="mt-2 text-sm text-white/80">
              Monte um simulado personalizado com as matérias que precisa estudar.
            </p>
            <div className="mt-6 inline-flex items-center text-sm font-medium text-white transition-transform group-hover:translate-x-1">
              Criar novo
              <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
