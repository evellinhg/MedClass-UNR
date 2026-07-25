"use client"

import { useEffect, useState } from "react"
import { Loader2, Trophy } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { MedalIcon } from "@/components/medal-icon"
import { RARIDADE_LABEL, type Medalha, type UserMedalha } from "@/lib/conquistas-types"

const CATEGORIA_LABEL: Record<string, string> = {
  simulados: "Simulados",
  precisao: "Precisão",
  consistencia: "Consistência",
  medcoins: "MedCoins",
  geral: "Geral",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR")
}

export function ConquistasContent() {
  const [medalhas, setMedalhas] = useState<Medalha[]>([])
  const [conquistadas, setConquistadas] = useState<Map<string, UserMedalha>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: userData }) => {
      const userId = userData.user?.id
      if (!userId) {
        setLoading(false)
        return
      }

      const [{ data: medalhasRows }, { data: userMedalhasRows }] = await Promise.all([
        supabase.from("medcoins_medalhas").select("*").eq("ativo", true).order("categoria"),
        supabase.from("medcoins_user_medalhas").select("*").eq("user_id", userId),
      ])

      setMedalhas((medalhasRows as Medalha[]) ?? [])
      setConquistadas(
        new Map(((userMedalhasRows as UserMedalha[]) ?? []).map((um) => [um.medalha_id, um]))
      )
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando...
      </div>
    )
  }

  const porCategoria = medalhas.reduce<Record<string, Medalha[]>>((acc, m) => {
    ;(acc[m.categoria] ??= []).push(m)
    return acc
  }, {})

  const totalConquistadas = medalhas.filter((m) => conquistadas.has(m.id)).length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gradient-brand">Minhas Conquistas</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Desbloqueie medalhas treinando e evoluindo na plataforma.
        </p>
      </div>

      <Card className="border border-border bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] p-6 text-white">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8" />
          <div>
            <p className="text-3xl font-bold">
              {totalConquistadas} / {medalhas.length}
            </p>
            <p className="text-sm text-white/80">medalhas conquistadas</p>
          </div>
        </div>
      </Card>

      {Object.entries(porCategoria).map(([categoria, itens]) => (
        <div key={categoria} className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            {CATEGORIA_LABEL[categoria] ?? categoria}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {itens.map((m) => {
              const conquista = conquistadas.get(m.id)
              const conquistada = !!conquista
              return (
                <Card
                  key={m.id}
                  className={`flex items-start gap-3 border p-4 ${
                    conquistada ? "border-primary/30 bg-card" : "border-border bg-card/50"
                  }`}
                >
                  <MedalIcon icone={m.icone} raridade={m.raridade} conquistada={conquistada} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`truncate text-sm font-semibold ${conquistada ? "text-foreground" : "text-muted-foreground"}`}>
                        {m.nome}
                      </p>
                      <span className="shrink-0 text-[10px] font-medium uppercase text-muted-foreground">
                        {RARIDADE_LABEL[m.raridade]}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{m.descricao}</p>
                    {conquistada ? (
                      <p className="mt-1 text-[11px] font-medium text-success">
                        Conquistada em {formatDate(conquista.conquistado_em)}
                      </p>
                    ) : (
                      m.recompensa_medcoins > 0 && (
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Recompensa: {m.recompensa_medcoins} MedCoins
                        </p>
                      )
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
