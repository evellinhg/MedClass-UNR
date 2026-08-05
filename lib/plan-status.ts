import { supabase } from "@/lib/supabase"
import { isAdminEmail } from "@/lib/admin-config"

export const FREE_QUESTOES_LIMIT = 60

export type UserRole = "admin" | "aluno" | "colaborador"

export interface PlanStatus {
  userId: string
  email: string | null
  fullName: string | null
  avatarUrl: string | null
  notaCorte: number
  plan: string
  role: UserRole
  isAdmin: boolean
  isColaborador: boolean
  hasFullAccess: boolean
  accessExpiresAt: string | null
  accessExpired: boolean
  questoesUsed: number
  questoesRemaining: number
  canAccessMateriais: boolean
  canStartSimulado: boolean
  canPracticeIndividual: boolean
}

// Plano gratuito nunca expira por tempo: fica valendo indefinidamente até o
// aluno esgotar as 60 questões vitalícias (simulado + prática avulsa somadas)
// ou até assinar um plano pago. `accessExpired` é so para planos PAGOS cuja
// data de expiração (access_expires_at) já passou.
export async function getPlanStatus(): Promise<PlanStatus | null> {
  const { data: sessionData } = await supabase.auth.getSession()
  const user = sessionData.session?.user
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, full_name, avatar_url, nota_corte, trial_questoes_used, role, access_expires_at")
    .eq("id", user.id)
    .maybeSingle()

  const role: UserRole = (profile?.role as UserRole | undefined) ?? (isAdminEmail(user.email) ? "admin" : "aluno")
  const admin = role === "admin" || isAdminEmail(user.email)
  const isColaborador = role === "colaborador"

  const accessExpiresAt = profile?.access_expires_at ?? null
  const accessExpired = !!accessExpiresAt && new Date(accessExpiresAt) < new Date()

  const plan = profile?.plan ?? "gratis"
  const isPaid = plan === "mensal" || plan === "trimestral" || plan === "vip"
  const hasFullAccess = !accessExpired && (admin || isColaborador || isPaid)

  const questoesUsed = profile?.trial_questoes_used ?? 0
  const questoesRemaining = Math.max(0, FREE_QUESTOES_LIMIT - questoesUsed)

  return {
    userId: user.id,
    email: user.email ?? null,
    fullName: profile?.full_name ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    notaCorte: profile?.nota_corte ?? 60,
    plan,
    role,
    isAdmin: admin,
    isColaborador,
    hasFullAccess,
    accessExpiresAt,
    accessExpired,
    questoesUsed,
    questoesRemaining,
    canAccessMateriais: hasFullAccess,
    canStartSimulado: !accessExpired && (hasFullAccess || questoesRemaining > 0),
    canPracticeIndividual: !accessExpired && (hasFullAccess || questoesRemaining > 0),
  }
}

export async function incrementTrialUsage(amount: number) {
  await supabase.rpc("increment_trial_usage", { p_kind: "questao", p_amount: amount })
}
