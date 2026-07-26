"use client"

import { useEffect, useState } from "react"
import { Gift, Loader2, Plus, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { MedcoinsRedemption, MedcoinsRedemptionStatus, MedcoinsReward, MedcoinsRewardTipo } from "@/lib/medcoins-types"

interface RedemptionRow extends MedcoinsRedemption {
  profiles: { full_name: string | null; email: string | null } | null
  medcoins_rewards: { nome: string } | null
}

export function AdminMedCoinsLojaContent() {
  const [rewards, setRewards] = useState<MedcoinsReward[]>([])
  const [redemptions, setRedemptions] = useState<RedemptionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [tipo, setTipo] = useState<MedcoinsRewardTipo>("digital")
  const [custo, setCusto] = useState("100")
  const [estoque, setEstoque] = useState("")
  const [imagemUrl, setImagemUrl] = useState("")

  const load = async () => {
    const [{ data: rewardsData }, { data: redemptionsData }] = await Promise.all([
      supabase.from("medcoins_rewards").select("*").order("custo_medcoins"),
      supabase
        .from("medcoins_redemptions")
        .select("*, profiles(full_name, email), medcoins_rewards(nome)")
        .order("created_at", { ascending: false })
        .limit(50),
    ])
    setRewards((rewardsData as MedcoinsReward[]) ?? [])
    setRedemptions((redemptionsData as unknown as RedemptionRow[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const abrirNovo = () => {
    setNome("")
    setDescricao("")
    setTipo("digital")
    setCusto("100")
    setEstoque("")
    setImagemUrl("")
    setDialogOpen(true)
  }

  const handleSalvar = async () => {
    if (!nome.trim()) return
    setSaving(true)
    const { error } = await supabase.from("medcoins_rewards").insert({
      nome: nome.trim(),
      descricao: descricao.trim() || null,
      tipo,
      custo_medcoins: Number(custo),
      estoque: estoque.trim() ? Number(estoque) : null,
      imagem_url: imagemUrl.trim() || null,
    })
    setSaving(false)
    if (error) {
      alert(`Erro ao criar produto: ${error.message}`)
      return
    }
    setDialogOpen(false)
    load()
  }

  const handleToggleAtivo = async (reward: MedcoinsReward) => {
    await supabase.from("medcoins_rewards").update({ ativo: !reward.ativo }).eq("id", reward.id)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este produto? Só é possível se não houver resgates associados.")) return
    const { error } = await supabase.from("medcoins_rewards").delete().eq("id", id)
    if (error) {
      alert(`Erro ao excluir: ${error.message}`)
      return
    }
    load()
  }

  const handleStatusChange = async (redemption: RedemptionRow, status: MedcoinsRedemptionStatus) => {
    await supabase.from("medcoins_redemptions").update({ status, atualizado_em: new Date().toISOString() }).eq("id", redemption.id)
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

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gradient-brand">Loja MedCoins</h2>
            <p className="mt-1 text-sm text-muted-foreground">Produtos digitais e físicos que os alunos podem resgatar com MedCoins.</p>
          </div>
          <Button variant="gradient" onClick={abrirNovo} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </div>

        {rewards.length === 0 ? (
          <Card className="mt-4 border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">Nenhum produto cadastrado ainda.</p>
          </Card>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rewards.map((r) => (
              <Card key={r.id} className="overflow-hidden border border-border bg-card p-0">
                <div className="relative h-32 w-full overflow-hidden bg-secondary">
                  {r.imagem_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.imagem_url} alt={r.nome} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <Gift className="h-8 w-8 text-primary" />
                    </div>
                  )}
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="absolute right-2 top-2 rounded-lg bg-card/90 p-1.5 text-destructive shadow-sm transition-colors hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-foreground">{r.nome}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{r.descricao}</p>
                  <p className="mt-2 text-sm font-bold text-foreground">
                    {r.custo_medcoins} MedCoins
                    {r.estoque !== null && <span className="ml-2 text-xs font-normal text-muted-foreground">· {r.estoque} em estoque</span>}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant="secondary" className="capitalize">
                      {r.tipo}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">Ativo</span>
                      <Switch checked={r.ativo} onCheckedChange={() => handleToggleAtivo(r)} />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold text-foreground">Resgates recentes</h3>
        <Card className="border border-border bg-card p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Custo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {redemptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum resgate ainda.
                  </TableCell>
                </TableRow>
              ) : (
                redemptions.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium text-foreground">{r.profiles?.full_name ?? r.profiles?.email ?? "—"}</TableCell>
                    <TableCell>{r.medcoins_rewards?.nome ?? "—"}</TableCell>
                    <TableCell>{r.custo_pago}</TableCell>
                    <TableCell>
                      <select
                        className="h-8 rounded-md border border-input bg-transparent px-2 text-sm capitalize"
                        value={r.status}
                        onChange={(e) => handleStatusChange(r, e.target.value as MedcoinsRedemptionStatus)}
                      >
                        <option value="pendente">Pendente</option>
                        <option value="concluido">Concluído</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{new Date(r.created_at).toLocaleString("pt-BR")}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Produto</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <select className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm" value={tipo} onChange={(e) => setTipo(e.target.value as MedcoinsRewardTipo)}>
                  <option value="digital">Digital</option>
                  <option value="fisico">Físico</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Custo (MedCoins)</Label>
                <Input type="number" value={custo} onChange={(e) => setCusto(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Estoque (vazio = ilimitado)</Label>
              <Input type="number" placeholder="Ilimitado" value={estoque} onChange={(e) => setEstoque(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>URL da imagem (opcional)</Label>
              <Input value={imagemUrl} onChange={(e) => setImagemUrl(e.target.value)} />
            </div>
            <Button variant="gradient" className="w-full gap-2" onClick={handleSalvar} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Criar Produto
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
