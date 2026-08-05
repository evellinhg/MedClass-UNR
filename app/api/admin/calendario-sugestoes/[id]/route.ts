import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"
import { requireAdmin } from "@/lib/require-admin"

const VALID_STATUS = ["aprovado", "rejeitado", "pendente"]

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const status = typeof body.status === "string" ? body.status : ""

  if (!VALID_STATUS.includes(status)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("calendario_sugestoes")
    .update({ status, moderado_em: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: "Sugestão não encontrada." }, { status: 404 })
  }

  return NextResponse.json({ sugestao: data })
}
