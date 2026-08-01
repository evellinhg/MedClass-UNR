"use client"

import { useEffect, useState } from "react"
import { Loader2, User } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/lib/i18n"

interface Depoimento {
  id: string
  nome: string
  ano_cursado: string
  foto_path: string | null
  comentario: string
  created_at: string
}

export function DepoimentosLista() {
  const { t } = useLanguage()
  const [depoimentos, setDepoimentos] = useState<Depoimento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("depoimentos")
        .select("id, nome, ano_cursado, foto_path, comentario, created_at")
        .eq("status", "aprovado")
        .order("created_at", { ascending: false })
      setDepoimentos((data as Depoimento[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const fotoUrl = (path: string) => supabase.storage.from("depoimentos-fotos").getPublicUrl(path).data.publicUrl

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-white/50">
        <Loader2 className="h-5 w-5 animate-spin" />
        {t.depoimentosPage.carregando}
      </div>
    )
  }

  if (depoimentos.length === 0) {
    return <p className="py-24 text-center text-white/50">{t.depoimentosPage.vazio}</p>
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {depoimentos.map((d) => (
        <div key={d.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <p className="text-lg leading-relaxed text-white/70">&quot;{d.comentario}&quot;</p>
          <div className="mt-6 flex items-center gap-3">
            {d.foto_path ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fotoUrl(d.foto_path)} alt={d.nome} className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#c6ff3a]/20 bg-[#c6ff3a]/10 text-[#bef264]">
                <User className="h-5 w-5" />
              </div>
            )}
            <div>
              <p className="font-medium text-white">{d.nome}</p>
              <p className="text-sm text-white/40">{t.cronograma.anoLabel[d.ano_cursado] ?? d.ano_cursado}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
