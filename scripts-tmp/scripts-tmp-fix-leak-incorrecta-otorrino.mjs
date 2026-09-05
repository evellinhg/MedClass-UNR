import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8")
const env = Object.fromEntries(
  envFile.split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => {
    const i = l.indexOf("=")
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
  })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

// bug do limpar() em v1 do pipeline: só removia "Incorrecto." (masculino) no INÍCIO do
// comentário, não capturava "Incorrecta:" (feminino, dois-pontos) quando ele aparecia
// já colado no meio do texto após reforço. Corrigido no limpar() (v2), mas os 145
// registros já afetados em otorrinolaringologia precisam de correção retroativa:
// corta tudo a partir do ponto onde "Incorrect[oa][.:]" vazou para dentro da opção.
let all = []
{
  const pageSize = 500
  let from = 0
  while (true) {
    const { data, error } = await supabase.from("questoes").select("id,opcoes,indice_correta").eq("materia", "otorrinolaringologia").eq("ativo", true).range(from, from + pageSize - 1)
    if (error) { console.error(error); process.exit(1) }
    all.push(...data)
    if (data.length < pageSize) break
    from += pageSize
  }
}

const regexLeak = /\s*\.?\s*Incorrect[oa][.:]\s.*$/is

let corrigidas = 0
for (const q of all) {
  let mudou = false
  const novasOpcoes = [...q.opcoes]
  q.opcoes.forEach((op, idx) => {
    if (idx === q.indice_correta) return
    if (!regexLeak.test(op)) return
    let novo = op.replace(regexLeak, "").trim()
    if (!/[.!?]$/.test(novo)) novo += "."
    novasOpcoes[idx] = novo
    mudou = true
  })
  if (mudou) {
    const { error } = await supabase.from("questoes").update({ opcoes: novasOpcoes }).eq("id", q.id)
    if (error) { console.error("erro", q.id, error); continue }
    corrigidas++
  }
}
console.log(`Questões corrigidas: ${corrigidas}`)
