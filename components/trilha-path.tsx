"use client"

import { CheckCircle2, Lock, Play, Stethoscope, type LucideIcon } from "lucide-react"

export interface TrilhaPathNode {
  id: string
  label: string
  sublabel?: string | null
  estado: "concluida" | "atual" | "bloqueada"
  icone?: LucideIcon
  onClick?: () => void
}

export interface TrilhaPathUnidade {
  id: string
  titulo: string
  descricao?: string | null
  nodes: TrilhaPathNode[]
}

function RoadConnector({ ativo, invertido }: { ativo: boolean; invertido: boolean }) {
  const x1 = invertido ? 77 : 23
  const x2 = invertido ? 23 : 77
  return (
    <svg viewBox="0 0 100 56" preserveAspectRatio="none" className="mx-auto h-14 w-32" aria-hidden="true">
      <path
        d={`M ${x1} 0 C ${x1} 28, ${x2} 28, ${x2} 56`}
        fill="none"
        stroke={ativo ? "#10b981" : "currentColor"}
        strokeWidth={ativo ? 5 : 3}
        strokeLinecap="round"
        strokeDasharray={ativo ? undefined : "1 9"}
        className={ativo ? "" : "text-border"}
      />
    </svg>
  )
}

export function TrilhaPath({ unidades }: { unidades: TrilhaPathUnidade[] }) {
  let globalIndex = 0
  return (
    <div className="space-y-10">
      {unidades.map((unidade) => (
        <div key={unidade.id} className="space-y-6">
          <div className="mx-auto max-w-xs rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-center shadow-md">
            <p className="text-sm font-bold text-white">{unidade.titulo}</p>
            {unidade.descricao && <p className="text-[11px] text-white/85">{unidade.descricao}</p>}
          </div>

          <div className="mx-auto max-w-sm py-2">
            {unidade.nodes.map((node, i) => {
              const idx = globalIndex++
              const align = idx % 2 === 0 ? "justify-start pl-6" : "justify-end pr-6"
              const Icon = node.icone ?? Stethoscope
              const isLast = i === unidade.nodes.length - 1
              return (
                <div key={node.id}>
                  <div className={`flex ${align}`}>
                    <div className="flex w-32 flex-col items-center gap-1.5">
                      <button
                        type="button"
                        disabled={!node.onClick}
                        onClick={node.onClick}
                        className={`relative flex h-16 w-16 items-center justify-center rounded-full border-4 bg-background shadow-md transition-transform ${
                          node.onClick ? "cursor-pointer hover:scale-105" : "cursor-default"
                        } ${
                          node.estado === "concluida"
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : node.estado === "atual"
                              ? "border-primary bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] text-white ring-4 ring-primary/25"
                              : "border-border bg-muted text-muted-foreground opacity-70"
                        }`}
                      >
                        <Icon className="h-7 w-7" strokeWidth={1.75} />
                        <span
                          className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background ${
                            node.estado === "concluida"
                              ? "bg-emerald-500 text-white"
                              : node.estado === "atual"
                                ? "bg-primary text-white"
                                : "bg-muted-foreground/80 text-white"
                          }`}
                        >
                          {node.estado === "concluida" ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : node.estado === "bloqueada" ? (
                            <Lock className="h-3 w-3" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                        </span>
                      </button>
                      <p className="text-center text-[11px] font-semibold leading-tight text-foreground">
                        {node.label}
                      </p>
                      {node.sublabel && (
                        <p className="text-center text-[10px] leading-tight text-muted-foreground">{node.sublabel}</p>
                      )}
                    </div>
                  </div>
                  {!isLast && <RoadConnector ativo={node.estado === "concluida"} invertido={idx % 2 === 1} />}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
