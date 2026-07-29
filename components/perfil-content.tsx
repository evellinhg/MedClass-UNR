"use client"

import { useEffect, useState } from "react"
import { Camera, Lock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/lib/i18n"

export function PerfilContent() {
  const { t } = useLanguage()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [cutoffScore, setCutoffScore] = useState("70")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user
      if (!user) return
      setEmail(user.email ?? "")
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle()
      setName(profile?.full_name ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? "")
    })
  }, [])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : email.slice(0, 2).toUpperCase()

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="border border-border bg-card p-6">
        <h2 className="mb-6 text-lg font-semibold text-foreground">{t.perfil.fotoDePerfil}</h2>
        <div className="flex items-center gap-5">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-accent text-lg font-semibold text-accent-foreground">
              {initials || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <Button variant="outline" className="gap-2">
              <Camera className="h-4 w-4" />
              {t.perfil.alterarFoto}
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">{t.perfil.formatoFoto}</p>
          </div>
        </div>
      </Card>

      <Card className="border border-border bg-card p-6">
        <h2 className="mb-6 text-lg font-semibold text-foreground">{t.perfil.dadosPessoais}</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">{t.perfil.nomeCompleto}</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-2" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">{t.perfil.email}</label>
            <div className="relative mt-2">
              <Input
                type="email"
                value={email}
                readOnly
                disabled
                className="cursor-not-allowed pr-9 opacity-80"
              />
              <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{t.perfil.emailAviso}</p>
          </div>
        </div>
      </Card>

      <Card className="border border-border bg-card p-6">
        <h2 className="mb-2 text-lg font-semibold text-foreground">{t.perfil.preferenciasEstudo}</h2>
        <p className="mb-4 text-sm text-muted-foreground">{t.perfil.preferenciasDesc}</p>
        <div>
          <label className="text-sm font-medium text-foreground">{t.perfil.notaDeCorte}</label>
          <div className="mt-2 flex items-center gap-2">
            <Input
              type="number"
              min="0"
              max="100"
              value={cutoffScore}
              onChange={(e) => setCutoffScore(e.target.value)}
              className="w-28"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button variant="gradient" onClick={handleSave}>
          {t.perfil.salvarAlteracoes}
        </Button>
        {saved && <span className="text-sm font-medium text-success">{t.perfil.alteracoesSalvas}</span>}
      </div>
    </div>
  )
}
