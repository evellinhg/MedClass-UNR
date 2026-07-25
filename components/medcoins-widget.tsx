"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Coins, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import type { MedcoinsWallet } from "@/lib/medcoins-types"

export function MedCoinsWidget() {
  const [wallet, setWallet] = useState<MedcoinsWallet | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    let channel: ReturnType<typeof supabase.channel> | null = null

    const setup = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      if (!userId || cancelled) {
        setLoading(false)
        return
      }

      const { data } = await supabase.from("medcoins_wallets").select("*").eq("user_id", userId).maybeSingle()
      if (cancelled) return
      setWallet(data as MedcoinsWallet | null)
      setLoading(false)

      const topic = `medcoins-widget-${userId}`
      const existing = supabase.getChannels().find((c) => c.topic === `realtime:${topic}`)
      if (existing) await supabase.removeChannel(existing)
      if (cancelled) return

      channel = supabase
        .channel(topic)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "medcoins_wallets", filter: `user_id=eq.${userId}` },
          (payload) => setWallet(payload.new as MedcoinsWallet)
        )
        .subscribe()
    }

    setup()

    return () => {
      cancelled = true
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  return (
    <Card className="border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-foreground">
          <Coins className="h-5 w-5 text-primary" />
          MedCoins
        </h3>
        <Link
          href="/dashboard/medcoins"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Ver extrato
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando...
        </div>
      ) : (
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-gradient-brand">{(wallet?.saldo ?? 0).toFixed(0)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Saldo disponível</p>
          </div>
          <p className="text-xs text-muted-foreground">
            {(wallet?.total_acumulado ?? 0).toFixed(0)} acumulados no total
          </p>
        </div>
      )}
    </Card>
  )
}
