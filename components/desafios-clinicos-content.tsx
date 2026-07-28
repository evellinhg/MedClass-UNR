"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getDesafioIcon, coverGradientFor } from "@/lib/desafio-icons"
import { Pagination, PAGE_SIZE } from "@/components/pagination"
import type { DesafioClinico } from "@/lib/desafios-types"

interface HistoricoItem {
  id: string
  acertos: number
  total: number
  created_at: string
  desafio: { id: string; titulo: string; icone: string } | null
}

function DesafioCover({ desafio }: { desafio: DesafioClinico }) {
  const Icon = getDesafioIcon(desafio.icone)
  return (
    <div
      className={`flex h-40 w-full items-center justify-center rounded-t-lg bg-gradient-to-br ${coverGradientFor(
        desafio.id
      )}`}
    >
      <Icon className="h-14 w-14 text-white drop-shadow" strokeWidth={1.75} />
    </div>
  )
}

export function DesafiosClinicosContent() {
  const [desafios, setDesafios] = useState<DesafioClinico[]>([])
  const [historico, setHistorico] = useState<HistoricoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [histPage, setHistPage] = useState(1)

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user.id

      const [{ data: desafiosData }, historicoRes] = await Promise.all([
        supabase.from("desafios_clinicos").select("*").eq("ativo", true).order("created_at", { ascending: true }),
        userId
          ?           supabase
              .from("desafios_clinicos_historico")
              .select("id, acertos, total, created_at, desafio:desafios_clinicos(id, titulo, icone)")
              .eq("user_id", userId)
              .order("created_at", { ascending: false })
          : Promise.resolve({ data: [] }),
      ])

      setDesafios((desafiosData as DesafioClinico[]) ?? [])
      setHistorico((historicoRes.data as unknown as HistoricoItem[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando desafios...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gradient-brand">Novo estudo</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Escolha um desafio clínico para estudar: um caso de paciente seguido de perguntas de anamnese,
          exame físico, exames complementares, diagnóstico e conduta terapêutica.
        </p>
      </div>

      {desafios.length === 0 ? (
        <div className="rounded-lg border border-border bg-card/50 p-8 text-center">
          <p className="text-muted-foreground">Nenhum desafio clínico disponível no momento.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {desafios.map((desafio) => (
            <Link
              key={desafio.id}
              href={`/dashboard/desafios-clinicos/${desafio.id}`}
              className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/50"
            >
              <DesafioCover desafio={desafio} />
              <div className="space-y-1 p-4">
                {desafio.area && (
                  <p className="text-[11px] font-medium uppercase tracking-wide text-primary">{desafio.area}</p>
                )}
                <h3 className="font-semibold leading-snug text-foreground">{desafio.titulo}</h3>
                <p className="pt-1 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Estudar →
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-foreground">Estudos anteriores</h2>
        {historico.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Você ainda não estudou nenhum desafio clínico. Comece por um dos casos acima.
          </p>
        ) : (() => {
          const totalPages = Math.ceil(historico.length / PAGE_SIZE)
          const paginated = historico.slice((histPage - 1) * PAGE_SIZE, histPage * PAGE_SIZE)
          return (
            <>
              <div className="mt-3 divide-y divide-border rounded-lg border border-border bg-card">
                {paginated.map((item) => {
                  const Icon = getDesafioIcon(item.desafio?.icone ?? "")
                  const passou = item.total > 0 && item.acertos / item.total >= 0.6
                  return (
                    <div key={item.id} className="flex items-center gap-3 p-4">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${coverGradientFor(
                          item.desafio?.id ?? item.id
                        )}`}
                      >
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.desafio?.titulo ?? "Desafio removido"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        {passou ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        {item.acertos}/{item.total}
                      </div>
                    </div>
                  )
                })}
              </div>
              <Pagination page={histPage} totalPages={totalPages} onPageChange={setHistPage} />
            </>
          )
        })()}
      </div>
    </div>
  )
}
