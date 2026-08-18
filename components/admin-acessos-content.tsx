import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import { Card } from "@/components/ui/card"

type NivelAcesso = "total" | "parcial" | "nenhum"

interface Plano {
  key: string
  nome: string
}

interface Recurso {
  nome: string
  descricao: string
  acessos: Record<string, { nivel: NivelAcesso; detalhe?: string }>
}

const PLANOS: Plano[] = [
  { key: "gratis", nome: "Gratuito" },
  { key: "mensal", nome: "Mensal" },
  { key: "trimestral", nome: "Trimestral" },
  { key: "vip", nome: "VIP" },
  { key: "colaborador", nome: "Colaborador" },
  { key: "admin", nome: "Admin" },
]

// Regras refletidas aqui vêm de lib/plan-status.ts (hasFullAccess = admin ||
// colaborador || plan em mensal/trimestral/vip) e da lógica própria de cada
// recurso (pool gratuito por matéria, 1º caso de cada seção, etc). Esse
// painel é só informativo -- editar aqui não muda o comportamento real do
// app, é a documentação viva de quem pode ver o quê.
const RECURSOS: Recurso[] = [
  {
    nome: "Hospital Simulação",
    descricao: "Casos clínicos interativos com física e pontuação próprias.",
    acessos: {
      gratis: { nivel: "nenhum" },
      mensal: { nivel: "total" },
      trimestral: { nivel: "total" },
      vip: { nivel: "total" },
      colaborador: { nivel: "total" },
      admin: { nivel: "total" },
    },
  },
  {
    nome: "Desafios Clínicos",
    descricao: "Casos com perguntas de anamnese, exame físico, diagnóstico e conduta.",
    acessos: {
      gratis: { nivel: "parcial", detalhe: "Só o 1º caso de cada seção" },
      mensal: { nivel: "total" },
      trimestral: { nivel: "total" },
      vip: { nivel: "total" },
      colaborador: { nivel: "total" },
      admin: { nivel: "total" },
    },
  },
  {
    nome: "Treinamentos (Simulados)",
    descricao: "Banco de questões para treino livre e simulados cronometrados.",
    acessos: {
      gratis: { nivel: "parcial", detalhe: "Pool fixo de questões por matéria" },
      mensal: { nivel: "total" },
      trimestral: { nivel: "total" },
      vip: { nivel: "total" },
      colaborador: { nivel: "total" },
      admin: { nivel: "total" },
    },
  },
  {
    nome: "Videoaulas",
    descricao: "Aulas em vídeo organizadas por matéria e ano.",
    acessos: {
      gratis: { nivel: "nenhum" },
      mensal: { nivel: "total" },
      trimestral: { nivel: "total" },
      vip: { nivel: "total" },
      colaborador: { nivel: "total" },
      admin: { nivel: "total" },
    },
  },
  {
    nome: "Resumos",
    descricao: "Materiais de estudo em texto por matéria.",
    acessos: {
      gratis: { nivel: "nenhum" },
      mensal: { nivel: "total" },
      trimestral: { nivel: "total" },
      vip: { nivel: "total" },
      colaborador: { nivel: "total" },
      admin: { nivel: "total" },
    },
  },
  {
    nome: "Flashcards",
    descricao: "Baralhos de cartões de estudo por matéria.",
    acessos: {
      gratis: { nivel: "parcial", detalhe: "1 baralho por matéria" },
      mensal: { nivel: "total" },
      trimestral: { nivel: "total" },
      vip: { nivel: "total" },
      colaborador: { nivel: "total" },
      admin: { nivel: "total" },
    },
  },
]

function CelulaAcesso({ nivel, detalhe, isGratis }: { nivel: NivelAcesso; detalhe?: string; isGratis: boolean }) {
  if (nivel === "total") {
    return (
      <div className="flex flex-col items-center gap-1">
        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        <span className="text-[10px] text-muted-foreground">Acesso total</span>
      </div>
    )
  }

  if (nivel === "parcial") {
    return (
      <div className="flex flex-col items-center gap-1">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <span className="max-w-[110px] text-center text-[10px] leading-tight text-amber-500">
          {isGratis ? "Restrito" : "Parcial"}
          {detalhe && <span className="block text-muted-foreground">{detalhe}</span>}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <XCircle className="h-5 w-5 text-destructive" />
      <span className="text-[10px] text-muted-foreground">Sem acesso</span>
    </div>
  )
}

export function AdminAcessosContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Controle de Acessos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          O que cada plano libera na plataforma. Referência rápida para dúvidas de suporte e vendas — não é um
          editor: as regras reais ficam no código de cada recurso.
        </p>
      </div>

      <Card className="overflow-hidden border border-border p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-card/50">
                <th className="w-56 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Recurso
                </th>
                {PLANOS.map((plano) => (
                  <th
                    key={plano.key}
                    className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {plano.nome}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECURSOS.map((recurso, idx) => (
                <tr key={recurso.nome} className={idx % 2 === 0 ? "bg-transparent" : "bg-card/30"}>
                  <td className="px-4 py-4 align-top">
                    <p className="font-medium text-foreground">{recurso.nome}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{recurso.descricao}</p>
                  </td>
                  {PLANOS.map((plano) => {
                    const acesso = recurso.acessos[plano.key]
                    return (
                      <td key={plano.key} className="px-3 py-4 text-center align-top">
                        <CelulaAcesso nivel={acesso.nivel} detalhe={acesso.detalhe} isGratis={plano.key === "gratis"} />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Acesso total ao recurso
        </span>
        <span className="flex items-center gap-1.5">
          <AlertTriangle className="h-4 w-4 text-amber-500" /> Acesso restrito / parcial
        </span>
        <span className="flex items-center gap-1.5">
          <XCircle className="h-4 w-4 text-destructive" /> Sem acesso
        </span>
      </div>
    </div>
  )
}
