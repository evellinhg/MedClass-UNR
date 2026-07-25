import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0a]">
      {/* CTA Section */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold text-white sm:text-4xl">
              E aí, está esperando o que para dar o passo inicial na conquista do seu CRM?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-white/50">
              Junte-se à MedClass e garanta a sua aprovação no Enamed e Revalida.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 h-12 bg-gradient-to-r from-indigo-600 to-violet-600 px-8 text-base font-semibold text-white hover:from-indigo-500 hover:to-violet-500"
            >
              <Link href="#pricing">Quero minha aprovação agora</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="mx-auto max-w-7xl px-6 pb-12">
        <div className="flex flex-col items-center gap-3 border-t border-white/5 pt-8 text-center">
          <p className="text-sm text-white/40">
            &copy; 2026 MedClass. Todos os direitos reservados.
          </p>
          <p className="text-sm text-white/40">
            <a href="#" className="transition-colors hover:text-white">Termos de Uso</a>
            {" | "}
            <a href="#" className="transition-colors hover:text-white">Política de Privacidade</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
