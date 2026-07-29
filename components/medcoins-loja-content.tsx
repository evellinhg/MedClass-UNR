"use client"

import { useEffect, useState } from "react"
import { Gift, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { MedcoinsConfig, MedcoinsReward, MedcoinsWallet } from "@/lib/medcoins-types"

const CONFIG_ID = "00000000-0000-0000-0000-000000000001"

export function MedCoinsLojaContent() {
  const [config, setConfig] = useState<MedcoinsConfig | null>(null)
  const [wallet, setWallet] = useState<MedcoinsWallet | null>(null)
  const [rewards, setRewards] = useState<MedcoinsReward[]>([])
  const [loading, setLoading] = useState(true)
  const [resgatando, setResgatando] = useState<string | null>(null)
  const [zoomReward, setZoomReward] = useState<MedcoinsReward | null>(null)

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) {
      setLoading(false)
      return
    }

    const [{ data: configData }, { data: walletData }, { data: rewardsData }] = await Promise.all([
      supabase.from("medcoins_config").select("*").eq("id", CONFIG_ID).maybeSingle(),
      supabase.from("medcoins_wallets").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("medcoins_rewards").select("*").eq("ativo", true).order("custo_medcoins"),
    ])
    setConfig((configData as MedcoinsConfig) ?? null)
    setWallet((walletData as MedcoinsWallet) ?? null)
    setRewards((rewardsData as MedcoinsReward[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleResgatar = async (reward: MedcoinsReward) => {
    if (!confirm(`Resgatar "${reward.nome}" por ${reward.custo_medcoins} ${config?.simbolo ?? "MC"}?`)) return
    setResgatando(reward.id)
    const { error } = await supabase.rpc("medcoins_resgatar_recompensa", { p_reward_id: reward.id })
    setResgatando(null)
    if (error) {
      alert(`Não foi possível resgatar: ${error.message}`)
      return
    }
    alert(`"${reward.nome}" resgatado com sucesso! Veja o extrato para acompanhar.`)
    load()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando...
      </div>
    )
  }

  const saldo = wallet?.saldo ?? 0

  return (
    <div className="space-y-8">
      <Card className="border border-border bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] p-6 text-[#0a1f00]">
        <p className="text-sm text-white/80">Saldo disponível para resgate</p>
        <p className="mt-1 text-3xl font-bold">
          {saldo.toFixed(0)} <span className="text-lg font-medium text-white/80">{config?.simbolo ?? "MC"}</span>
        </p>
      </Card>

      <div>
        <h3 className="mb-3 text-lg font-semibold text-foreground">Produtos disponíveis</h3>
        {rewards.length === 0 ? (
          <Card className="border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">Nenhum produto disponível no momento.</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rewards.map((r) => {
              const semEstoque = r.estoque !== null && r.estoque <= 0
              const semSaldo = saldo < r.custo_medcoins
              const indisponivel = semEstoque || semSaldo
              return (
                <Card key={r.id} className="flex flex-col overflow-hidden border border-border bg-card p-0">
                  <button
                    type="button"
                    onClick={() => setZoomReward(r)}
                    className="relative h-36 w-full cursor-zoom-in overflow-hidden bg-secondary"
                  >
                    {r.imagem_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.imagem_url} alt={r.nome} className="h-full w-full object-cover transition-transform hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                        <Gift className="h-9 w-9 text-primary" />
                      </div>
                    )}
                    <Badge variant="secondary" className="absolute right-2 top-2 capitalize shadow-sm">
                      {r.tipo}
                    </Badge>
                  </button>
                  <div className="flex flex-1 flex-col p-5">
                    <h4 className="font-semibold text-foreground">{r.nome}</h4>
                    <p className="mt-1 flex-1 text-xs text-muted-foreground">{r.descricao}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">
                        {r.custo_medcoins} {config?.simbolo ?? "MC"}
                      </span>
                      {r.estoque !== null && !semEstoque && (
                        <span className="text-xs text-muted-foreground">{r.estoque} em estoque</span>
                      )}
                    </div>
                    {semEstoque && <p className="mt-2 text-xs text-destructive">Sem estoque no momento</p>}
                    <Button
                      variant="gradient"
                      size="sm"
                      className="mt-4 w-full gap-2"
                      disabled={indisponivel || resgatando === r.id}
                      onClick={() => handleResgatar(r)}
                    >
                      {resgatando === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {semEstoque ? "Indisponível" : semSaldo ? "Saldo insuficiente" : "Resgatar"}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <Dialog open={!!zoomReward} onOpenChange={(open) => !open && setZoomReward(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{zoomReward?.nome}</DialogTitle>
          </DialogHeader>
          <div className="overflow-hidden rounded-lg bg-secondary">
            {zoomReward?.imagem_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={zoomReward.imagem_url} alt={zoomReward.nome} className="w-full object-cover" />
            ) : (
              <div className="flex h-64 w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <Gift className="h-16 w-16 text-primary" />
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{zoomReward?.descricao}</p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
