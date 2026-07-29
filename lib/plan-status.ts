import { supabase } from "@/lib/supabase"
import { isAdminEmail } from "@/lib/admin-config"

export const FREE_SIMULADOS_LIMIT = 2
export const FREE_SIMULADO_MAX_QUESTIONS = 10
export const FREE_QUESTOES_LIMIT = 10

export type UserRole = "admin" | "aluno" | "colaborador"

export interface PlanStatus {
  userId: string
  email: string | null
  fullName: string | null
  plan: string
  role: UserRole
  isAdmin: boolean
  isColaborador: boolean
  hasFullAccess: boolean
  isTrialExpired: boolean
  trialExpiresAt: string | null
  accessExpiresAt: string | null
  accessExpired: boolean
  simuladosUsed: number
  simuladosRemaining: number
  questoesUsed: number
  questoesRemaining: number
  canAccessMateriais: boolean
  canStartSimulado: boolean
  canPracticeIndividual: boolean
}

export async function getPlanStatus(): Promise<PlanStatus | null> {
  const { data: sessionData } = await supabase.auth.getSession()
  const user = sessionData.session?.user
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, full_name, trial_expires_at, trial_simulados_used, trial_questoes_used, role, access_expires_at")
    .eq("id", user.id)
    .maybeSingle()

  const role: UserRole = (profile?.role as UserRole | undefined) ?? (isAdminEmail(user.email) ? "admin" : "aluno")
  const admin = role === "admin" || isAdminEmail(user.email)
  const isColaborador = role === "colaborador"

  const accessExpiresAt = profile?.access_expires_at ?? null
  const accessExpired = !!accessExpiresAt && new Date(accessExpiresAt) < new Date()

  const plan = profile?.plan ?? "gratis"
  const isPaid = plan === "mensal" || plan === "trimestral"
  const hasFullAccess = !accessExpired && (admin || isColaborador || isPaid)

  const trialExpiresAt = profile?.trial_expires_at ?? null
  const isTrialExpired = !hasFullAccess && !accessExpired && (!trialExpiresAt || new Date(trialExpiresAt) < new Date())

  const simuladosUsed = profile?.trial_simulados_used ?? 0
  const questoesUsed = profile?.trial_questoes_used ?? 0
  const simuladosRemaining = Math.max(0, FREE_SIMULADOS_LIMIT - simuladosUsed)
  const questoesRemaining = Math.max(0, FREE_QUESTOES_LIMIT - questoesUsed)

  return {
    userId: user.id,
    email: user.email ?? null,
    fullName: profile?.full_name ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
    plan,
    role,
    isAdmin: admin,
    isColaborador,
    hasFullAccess,
    isTrialExpired,
    trialExpiresAt,
    accessExpiresAt,
    accessExpired,
    simuladosUsed,
    simuladosRemaining,
    questoesUsed,
    questoesRemaining,
    canAccessMateriais: hasFullAccess,
    canStartSimulado: !accessExpired && (hasFullAccess || (!isTrialExpired && simuladosRemaining > 0)),
    canPracticeIndividual: !accessExpired && (hasFullAccess || (!isTrialExpired && questoesRemaining > 0)),
  }
}

export async function incrementTrialUsage(kind: "simulado" | "questao", amount = 1) {
  await supabase.rpc("increment_trial_usage", { p_kind: kind, p_amount: amount })
}
