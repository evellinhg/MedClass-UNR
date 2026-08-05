import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"
import { requireAdmin } from "@/lib/require-admin"

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const supabase = createAdminClient()
  const { data: sugestoes, error } = await supabase
    .from("calendario_sugestoes")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ sugestoes: sugestoes ?? [] })
}
