"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Stethoscope, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"

interface DesafioResult {
  id: string
  titulo: string
  area: string | null
}

export function GlobalSearch() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [desafios, setDesafios] = useState<DesafioResult[]>([])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setDesafios([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from("desafios_clinicos")
        .select("id, titulo, area")
        .eq("ativo", true)
        .ilike("titulo", `%${q}%`)
        .limit(8)
      setDesafios((data as DesafioResult[]) ?? [])
      setLoading(false)
    }, 250)

    return () => clearTimeout(timeout)
  }, [query])

  const showDropdown = open && query.trim().length >= 2

  const goTo = (href: string) => {
    setOpen(false)
    setQuery("")
    router.push(href)
  }

  return (
    <div ref={containerRef} className="relative ml-auto hidden w-full max-w-xs md:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Buscar desafios clínicos..."
        className="bg-secondary pl-9 focus-visible:bg-card"
        aria-label="Buscar"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
      />

      {showDropdown && (
        <div className="absolute top-full z-40 mt-2 w-full max-h-96 overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Buscando...
            </div>
          ) : desafios.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Nenhum resultado encontrado.</p>
          ) : (
            <div className="py-1.5">
              {desafios.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => goTo(`/dashboard/desafios-clinicos/${d.id}`)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
                >
                  <Stethoscope className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate">{d.titulo}</span>
                  {d.area && <span className="ml-auto shrink-0 text-xs text-muted-foreground">{d.area}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
