import { Quote } from "lucide-react"

export function MotivationalBanner() {
  return (
    <section
      aria-label="Frase motivacional"
      className="relative overflow-hidden rounded-2xl bg-sidebar px-6 py-5 text-sidebar-foreground"
    >
      <div className="relative flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
          <Quote className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-pretty text-base font-medium text-white sm:text-lg">
            {"\u201CO sucesso é a soma de pequenos esforços repetidos dia após dia.\u201D"}
          </p>
          <p className="mt-1 text-sm text-sidebar-foreground">Robert Collier — sua meta de hoje está te esperando.</p>
        </div>
      </div>
    </section>
  )
}
