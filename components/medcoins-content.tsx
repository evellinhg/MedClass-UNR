"use client"

import { useEffect, useState } from "react"
import { ArrowDownCircle, ArrowUpCircle, Coins, Loader2, Settings2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import type { MedcoinsLedgerEntry, MedcoinsWallet } from "@/lib/medcoins-types"

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

const tipoLabel: Record<MedcoinsLedgerEntry["tipo"], string> = {
  credito: "Crédito",
  debito: "Débito",
  ajuste_admin: "Ajuste administrativo",
}

const tipoIcon: Record<MedcoinsLedgerEntry["tipo"], typeof ArrowUpCircle> = {
  credito: ArrowUpCircle,
  debito: ArrowDownCircle,
  ajuste_admin: Settings2,
}

export function MedCoinsContent() {
  const [wallet, setWallet] = useState<MedcoinsWallet | null>(null)
  const [ledger, setLedger] = useState<MedcoinsLedgerEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: userData }) => {
      const userId = userData.user?.id
      if (!userId) {
        setLoading(false)
        return
      }

      const [{ data: walletRow }, { data: ledgerRows }] = await Promise.all([
        supabase.from("medcoins_wallets").select("*").eq("user_id", userId).maybeSingle(),
        supabase
          .from("medcoins_ledger")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(50),
      ])

      setWallet(walletRow as MedcoinsWallet | null)
      setLedger((ledgerRows as MedcoinsLedgerEntry[]) ?? [])
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gradient-brand">MedCoins</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ganhe MedCoins finalizando simulados e treinos de questões.
        </p>
      </div>

      <Card className="border border-border bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-white/80">
              <Coins className="h-4 w-4" />
              Saldo disponível
            </p>
            <p className="mt-1 text-4xl font-bold">{(wallet?.saldo ?? 0).toFixed(0)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80">Total acumulado</p>
            <p className="mt-1 text-lg font-semibold">{(wallet?.total_acumulado ?? 0).toFixed(0)}</p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Extrato</h3>
        {ledger.length === 0 ? (
          <div className="rounded-lg border border-border bg-card/50 p-8 text-center">
            <p className="text-muted-foreground">
              Nenhuma movimentação ainda. Finalize um simulado ou treino de questões para ganhar MedCoins.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border bg-card">
            {ledger.map((entry) => {
              const Icon = tipoIcon[entry.tipo]
              const positive = entry.tipo !== "debito"
              return (
                <div key={entry.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${positive ? "text-success" : "text-destructive"}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {entry.descricao || tipoLabel[entry.tipo]}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${positive ? "text-success" : "text-destructive"}`}>
                    {positive ? "+" : "-"}
                    {Math.abs(entry.valor).toFixed(0)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
