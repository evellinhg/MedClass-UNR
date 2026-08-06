import crypto from "crypto"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { createAdminClient } from "@/lib/supabase-admin"

export type PlanoPago = "mensal" | "trimestral"

export const PLANO_PRECO: Record<PlanoPago, number> = {
  mensal: 8000,
  trimestral: 18000,
}

export const PLANO_DURACAO_DIAS: Record<PlanoPago, number> = {
  mensal: 30,
  trimestral: 90,
}

// Uma config por chamada (client-per-request) em vez de módulo compartilhado:
// evita ler process.env.MERCADOPAGO_ACCESS_TOKEN antes de ele existir em
// contextos de build/edge, e é o padrão recomendado pelo SDK oficial.
function config(): MercadoPagoConfig {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado")
  return new MercadoPagoConfig({ accessToken })
}

// Aplica o plano (access_expires_at) na conta com esse e-mail, se ela já
// existir. Usado tanto pelo webhook do Mercado Pago (pagamento aprovado
// automaticamente) quanto pela ativação manual no painel admin (quando o
// admin confere o pagamento direto no Mercado Pago e libera na mão). Se a
// conta ainda não existir, fica pendente -- /api/pagamentos/reivindicar
// aplica na primeira vez que essa pessoa logar com esse e-mail.
export async function aplicarPlanoSeContaExistir(
  supabase: ReturnType<typeof createAdminClient>,
  pagamentoId: string,
  email: string,
  plano: PlanoPago
) {
  const { data: usersData } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const usuario = usersData?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
  if (!usuario) return false

  const expira = new Date()
  expira.setDate(expira.getDate() + PLANO_DURACAO_DIAS[plano])

  await supabase
    .from("profiles")
    .update({ plan: plano, access_expires_at: expira.toISOString() })
    .eq("id", usuario.id)

  await supabase
    .from("pagamentos_mercadopago")
    .update({ aplicado_em: new Date().toISOString() })
    .eq("id", pagamentoId)

  return true
}

interface ValidarAssinaturaParams {
  xSignature: string | null
  xRequestId: string | null
  dataId: string | null
}

// Algoritmo oficial do MP: HMAC-SHA256 de "id:{data.id};request-id:{x-request-id};ts:{ts};"
// usando a chave secreta configurada no painel de webhooks. Garante que a notificação
// realmente veio do Mercado Pago, não de alguém forjando um POST pra essa rota.
export function validarAssinaturaWebhook({ xSignature, xRequestId, dataId }: ValidarAssinaturaParams): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret) return false
  if (!xSignature || !xRequestId || !dataId) return false

  const partes = Object.fromEntries(
    xSignature.split(",").map((par) => {
      const [chave, valor] = par.split("=").map((s) => s?.trim())
      return [chave, valor]
    })
  )
  const ts = partes.ts
  const v1 = partes.v1
  if (!ts || !v1) return false

  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`
  const hashCalculado = crypto.createHmac("sha256", secret).update(manifest).digest("hex")

  const bufferCalculado = Buffer.from(hashCalculado, "hex")
  const bufferRecebido = Buffer.from(v1, "hex")
  if (bufferCalculado.length !== bufferRecebido.length) return false

  return crypto.timingSafeEqual(bufferCalculado, bufferRecebido)
}

export async function buscarPagamento(paymentId: string) {
  const payment = new Payment(config())
  const result = await payment.get({ id: paymentId })

  return {
    id: result.id ?? null,
    status: result.status ?? null,
    external_reference: result.external_reference ?? null,
    transaction_amount: result.transaction_amount ?? null,
    payer: { email: result.payer?.email ?? null },
  }
}
