"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

interface ToggleRow {
  key: string
  label: string
  description: string
  defaultChecked: boolean
}

const notificationRows: ToggleRow[] = [
  {
    key: "push",
    label: "Notificações push",
    description: "Receba lembretes de estudo e novidades no navegador.",
    defaultChecked: true,
  },
  {
    key: "reminders",
    label: "Lembretes de rotina",
    description: "Avisos antes de cada sessão de estudo do cronograma.",
    defaultChecked: true,
  },
]

const emailRows: ToggleRow[] = [
  {
    key: "weekly-summary",
    label: "Resumo semanal por e-mail",
    description: "Receba um resumo do seu desempenho toda segunda-feira.",
    defaultChecked: true,
  },
  {
    key: "product-updates",
    label: "Novidades da plataforma",
    description: "Fique por dentro de novos recursos e conteúdos.",
    defaultChecked: false,
  },
]

const privacyRows: ToggleRow[] = [
  {
    key: "public-profile",
    label: "Perfil público",
    description: "Permitir que outros alunos vejam seu progresso no ranking.",
    defaultChecked: false,
  },
  {
    key: "share-progress",
    label: "Compartilhar estatísticas",
    description: "Exibir seu desempenho em comparações agregadas e anônimas.",
    defaultChecked: true,
  },
]

function ToggleGroup({ title, rows }: { title: string; rows: ToggleRow[] }) {
  const [state, setState] = useState<Record<string, boolean>>(
    Object.fromEntries(rows.map((r) => [r.key, r.defaultChecked]))
  )

  return (
    <Card className="border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">{title}</h2>
      <div className="divide-y divide-border">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div>
              <p className="text-sm font-medium text-foreground">{row.label}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{row.description}</p>
            </div>
            <Switch
              checked={state[row.key]}
              onCheckedChange={(checked) => setState((prev) => ({ ...prev, [row.key]: checked }))}
            />
          </div>
        ))}
      </div>
    </Card>
  )
}

export function ConfiguracoesContent() {
  return (
    <div className="max-w-2xl space-y-6">
      <ToggleGroup title="Notificações" rows={notificationRows} />
      <ToggleGroup title="Alertas por E-mail" rows={emailRows} />
      <ToggleGroup title="Privacidade" rows={privacyRows} />
    </div>
  )
}
