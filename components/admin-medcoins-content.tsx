"use client"

import { useEffect, useState } from "react"
import { Check, Coins, Loader2, Save, Search } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { MedcoinsConfig, MedcoinsRegra, MedcoinsWallet } from "@/lib/medcoins-types"

interface AdminUser {
  id: string
  email: string | null
  full_name: string | null
}

const CONFIG_ID = "00000000-0000-0000-0000-000000000001"

export function AdminMedCoinsContent() {
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState<MedcoinsConfig | null>(null)
  const [regra, setRegra] = useState<MedcoinsRegra | null>(null)
  const [savingConfig, setSavingConfig] = useState(false)
  const [savingRegra, setSavingRegra] = useState(false)
  const [savedMsg, setSavedMsg] = useState<string | null>(null)

  const [users, setUsers] = useState<AdminUser[]>([])
  const [userSearch, setUserSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [selectedWallet, setSelectedWallet] = useState<MedcoinsWallet | null>(null)
  const [ajusteValor, setAjusteValor] = useState("")
  const [ajusteDescricao, setAjusteDescricao] = useState("")
  const [ajustando, setAjustando] = useState(false)

  const load = async () => {
    setLoading(true)
    const [{ data: configRow }, { data: regraRow }] = await Promise.all([
      supabase.from("medcoins_config").select("*").eq("id", CONFIG_ID).maybeSingle(),
      supabase.from("medcoins_regras").select("*").eq("chave", "simulado_finalizado").maybeSingle(),
    ])
    setConfig(configRow as MedcoinsConfig | null)
    setRegra(regraRow as MedcoinsRegra | null)
    setLoading(false)
  }

  useEffect(() => {
    load()
    supabase.auth.getSession().then(({ data: sessionData }) => {
      const token = sessionData.session?.access_token
      fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((data) => setUsers((data.users as AdminUser[]) ?? []))
        .catch(() => {})
    })
  }, [])

  const flash = (msg: string) => {
    setSavedMsg(msg)
    setTimeout(() => setSavedMsg(null), 2500)
  }

  const saveConfig = async () => {
    if (!config) return
    setSavingConfig(true)
    await supabase
      .from("medcoins_config")
      .update({
        nome_moeda: config.nome_moeda,
        simbolo: config.simbolo,
        cor_hex: config.cor_hex,
        ativo: config.ativo,
      })
      .eq("id", CONFIG_ID)
    setSavingConfig(false)
    flash("Configuração salva.")
  }

  const saveRegra = async () => {
    if (!regra) return
    setSavingRegra(true)
    await supabase
      .from("medcoins_regras")
      .update({
        moeda_por_acerto: regra.moeda_por_acerto,
        moeda_por_questao: regra.moeda_por_questao,
        bonus_perfeito: regra.bonus_perfeito,
        minimo_questoes: regra.minimo_questoes,
        ativo: regra.ativo,
        updated_at: new Date().toISOString(),
      })
      .eq("id", regra.id)
    setSavingRegra(false)
    flash("Regra salva.")
  }

  const filteredUsers = users.filter((u) => {
    const term = userSearch.trim().toLowerCase()
    if (!term) return false
    return (u.full_name ?? "").toLowerCase().includes(term) || (u.email ?? "").toLowerCase().includes(term)
  })

  const selectUser = async (u: AdminUser) => {
    setSelectedUser(u)
    setUserSearch("")
    const { data } = await supabase.from("medcoins_wallets").select("*").eq("user_id", u.id).maybeSingle()
    setSelectedWallet(data as MedcoinsWallet | null)
  }

  const aplicarAjuste = async () => {
    const valor = parseFloat(ajusteValor)
    if (!selectedUser || !valor || Number.isNaN(valor)) return
    setAjustando(true)

    let walletId = selectedWallet?.id
    if (!walletId) {
      const { data: newWallet } = await supabase
        .from("medcoins_wallets")
        .insert({ user_id: selectedUser.id, saldo: 0, total_acumulado: 0 })
        .select()
        .single()
      walletId = newWallet?.id
    }
    if (!walletId) {
      setAjustando(false)
      return
    }

    const novoSaldo = (selectedWallet?.saldo ?? 0) + valor
    const novoAcumulado = (selectedWallet?.total_acumulado ?? 0) + (valor > 0 ? valor : 0)

    const { data: updatedWallet } = await supabase
      .from("medcoins_wallets")
      .update({ saldo: novoSaldo, total_acumulado: novoAcumulado, updated_at: new Date().toISOString() })
      .eq("id", walletId)
      .select()
      .single()

    await supabase.from("medcoins_ledger").insert({
      wallet_id: walletId,
      user_id: selectedUser.id,
      tipo: "ajuste_admin",
      valor,
      origem_tipo: "admin",
      descricao: ajusteDescricao.trim() || "Ajuste manual do administrador",
    })

    setSelectedWallet(updatedWallet as MedcoinsWallet)
    setAjusteValor("")
    setAjusteDescricao("")
    setAjustando(false)
    flash("Carteira ajustada.")
  }

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
      {savedMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          <Check className="h-4 w-4" />
          {savedMsg}
        </div>
      )}

      <Card className="border border-border bg-card p-5">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
          <Coins className="h-4 w-4 text-primary" />
          Configuração da moeda
        </h3>
        {config && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Nome da moeda</Label>
              <Input value={config.nome_moeda} onChange={(e) => setConfig({ ...config, nome_moeda: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Símbolo</Label>
              <Input value={config.simbolo} onChange={(e) => setConfig({ ...config, simbolo: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Cor (hex)</Label>
              <Input value={config.cor_hex} onChange={(e) => setConfig({ ...config, cor_hex: e.target.value })} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <Label>Ativo</Label>
              <Switch checked={config.ativo} onCheckedChange={(v) => setConfig({ ...config, ativo: v })} />
            </div>
          </div>
        )}
        <Button variant="gradient" className="mt-4 gap-1.5" onClick={saveConfig} disabled={savingConfig}>
          {savingConfig ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar configuração
        </Button>
      </Card>

      <Card className="border border-border bg-card p-5">
        <h3 className="mb-1 font-semibold text-foreground">Regra de crédito — Finalizar simulado/treino</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Aplicada automaticamente sempre que um aluno finaliza um simulado ou treino de questões (tabela
          simulado_attempts).
        </p>
        {regra && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>MedCoins por acerto</Label>
              <Input
                type="number"
                step="0.1"
                value={regra.moeda_por_acerto}
                onChange={(e) => setRegra({ ...regra, moeda_por_acerto: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>MedCoins por questão respondida</Label>
              <Input
                type="number"
                step="0.1"
                value={regra.moeda_por_questao}
                onChange={(e) => setRegra({ ...regra, moeda_por_questao: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Bônus por 100% de acerto</Label>
              <Input
                type="number"
                step="0.1"
                value={regra.bonus_perfeito}
                onChange={(e) => setRegra({ ...regra, bonus_perfeito: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Mínimo de questões para contar</Label>
              <Input
                type="number"
                value={regra.minimo_questoes}
                onChange={(e) => setRegra({ ...regra, minimo_questoes: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3 sm:col-span-2">
              <Label>Regra ativa</Label>
              <Switch checked={regra.ativo} onCheckedChange={(v) => setRegra({ ...regra, ativo: v })} />
            </div>
          </div>
        )}
        <Button variant="gradient" className="mt-4 gap-1.5" onClick={saveRegra} disabled={savingRegra}>
          {savingRegra ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar regra
        </Button>
      </Card>

      <Card className="border border-border bg-card p-5">
        <h3 className="mb-4 font-semibold text-foreground">Ajuste manual de carteira</h3>
        <div className="space-y-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar aluno por nome ou e-mail..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {filteredUsers.length > 0 && (
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border p-1">
              {filteredUsers.slice(0, 10).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => selectUser(u)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                >
                  <span>{u.full_name || u.email}</span>
                  <span className="text-xs text-muted-foreground">{u.email}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedUser && (
          <div className="mt-4 space-y-3 rounded-lg border border-border bg-card/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{selectedUser.full_name || selectedUser.email}</p>
                <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
              </div>
              <p className="text-lg font-bold text-foreground">
                Saldo: {(selectedWallet?.saldo ?? 0).toFixed(0)}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-[120px_1fr_auto]">
              <Input
                type="number"
                placeholder="Valor (+/-)"
                value={ajusteValor}
                onChange={(e) => setAjusteValor(e.target.value)}
              />
              <Input
                placeholder="Motivo do ajuste"
                value={ajusteDescricao}
                onChange={(e) => setAjusteDescricao(e.target.value)}
              />
              <Button variant="gradient" onClick={aplicarAjuste} disabled={ajustando || !ajusteValor}>
                {ajustando ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aplicar"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
