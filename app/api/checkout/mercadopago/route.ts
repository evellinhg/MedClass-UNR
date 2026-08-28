import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"
import { PLANO_PRECO, type PlanoPago } from "@/lib/mercadopago"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

// Registra a intenção de pagamento (dados do aluno) ANTES de ele ser
// redirecionado pro link fixo de pagamento do Mercado Pago. Não cria
// preferência nem cobra nada aqui -- só deixa a linha em
// pagamentos_mercadopago com status='pendente' pra aparecer no painel
// admin (Pagamentos), onde o admin confere no próprio Mercado Pago e libera
// o acesso manualmente, sem precisar esperar o aluno mandar o comprovante
// por WhatsApp.
export async function POST(request: NextRequest) {
  // Endpoint público (sem auth por design -- captura intenção de pagamento
  // antes do aluno ter conta). Rate limit por IP pra impedir flood de
  // linhas "pendente" na tabela, já que a escrita usa a service-role key
  // (ignora RLS) e não depende de sessão.
  const ip = getClientIp(request)
  if (!checkRateLimit(`checkout:${ip}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas. Tente novamente em alguns minutos." }, { status: 429 })
  }

  const body = await request.json()
  const { plano, email, nome, apellido, telefone } = body as {
    plano?: string
    email?: string
    nome?: string
    apellido?: string
    telefone?: string
  }

  if (plano !== "mensal" && plano !== "trimestral") {
    return NextResponse.json({ error: "Plano inválido." }, { status: 400 })
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 })
  }
  if (!nome?.trim() || !apellido?.trim() || !telefone?.trim()) {
    return NextResponse.json({ error: "Faltan datos obligatorios." }, { status: 400 })
  }

  const planoValidado = plano as PlanoPago
  const supabase = createAdminClient()

  const { data: pagamento, error } = await supabase
    .from("pagamentos_mercadopago")
    .insert({
      email: email.trim().toLowerCase(),
      nome_completo: `${nome.trim()} ${apellido.trim()}`.trim(),
      telefone: telefone.trim(),
      plano: planoValidado,
      valor: PLANO_PRECO[planoValidado],
      status: "pendente",
    })
    .select("id")
    .single()

  if (error || !pagamento) {
    return NextResponse.json({ error: error?.message ?? "Erro ao registrar pagamento." }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: pagamento.id })
}
