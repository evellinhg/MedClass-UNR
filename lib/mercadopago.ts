import crypto from "crypto"
import { MercadoPagoConfig, Preference, Payment } from "mercadopago"

export type PlanoPago = "mensal" | "trimestral"

export const PLANO_PRECO: Record<PlanoPago, number> = {
  mensal: 8000,
  trimestral: 18000,
}

export const PLANO_DURACAO_DIAS: Record<PlanoPago, number> = {
  mensal: 30,
  trimestral: 90,
}

export const PLANO_TITULO: Record<PlanoPago, string> = {
  mensal: "MedClass UNR — Plano Mensal",
  trimestral: "MedClass UNR — Plano Trimestral",
}

// Uma config por chamada (client-per-request) em vez de módulo compartilhado:
// evita ler process.env.MERCADOPAGO_ACCESS_TOKEN antes de ele existir em
// contextos de build/edge, e é o padrão recomendado pelo SDK oficial.
function config(): MercadoPagoConfig {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado")
  return new MercadoPagoConfig({ accessToken })
}

interface CriarPreferenciaParams {
  plano: PlanoPago
  email: string
  nomeCompleto: string
  telefone: string
  dni: string
  externalReference: string
  origin: string
}

export async function criarPreferencia({
  plano,
  email,
  nomeCompleto,
  telefone,
  dni,
  externalReference,
  origin,
}: CriarPreferenciaParams) {
  const [nome, ...resto] = nomeCompleto.trim().split(/\s+/)
  const sobrenome = resto.join(" ") || nome

  const preference = new Preference(config())
  const result = await preference.create({
    body: {
      items: [
        {
          id: plano,
          title: PLANO_TITULO[plano],
          quantity: 1,
          unit_price: PLANO_PRECO[plano],
          currency_id: "ARS",
        },
      ],
      payer: {
        email,
        name: nome,
        surname: sobrenome,
        phone: { number: telefone },
        identification: { type: "DNI", number: dni },
      },
      external_reference: externalReference,
      back_urls: {
        success: `${origin}/checkout/sucesso`,
        failure: `${origin}/checkout/erro`,
        pending: `${origin}/checkout/pendente`,
      },
      auto_return: "approved",
      notification_url: `${origin}/api/webhooks/mercadopago`,
    },
  })

  if (!result.id || !result.init_point) {
    throw new Error("Mercado Pago não retornou id/init_point da preferência.")
  }

  return { id: result.id, init_point: result.init_point }
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
  if (!secret) return true
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
