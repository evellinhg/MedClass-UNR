import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
const envFile = readFileSync("/Users/Evelllin/Desktop/MedClass UNR/.env.local", "utf-8")
const env = Object.fromEntries(envFile.split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i).trim(), l.slice(i+1).trim()]}))
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

let all = []
{
  const pageSize = 1000
  let from = 0
  while (true) {
    const { data, error } = await supabase.from("questoes").select("id,materia,ativo,opcoes,opcoes_comentario,indice_correta").range(from, from + pageSize - 1)
    if (error) { console.error(error); process.exit(1) }
    all.push(...data)
    if (data.length < pageSize) break
    from += pageSize
  }
}
console.log(`Total de linhas (ativas + inativas): ${all.length}`)

const violaIndice = all.filter(q => q.indice_correta == null || q.indice_correta < 0 || !q.opcoes || q.indice_correta >= q.opcoes.length)
console.log(`Violam indice_correta dentro do range: ${violaIndice.length}`)
violaIndice.slice(0,10).forEach(q => console.log(' ', q.id, q.materia, 'indice=', q.indice_correta, 'len opcoes=', q.opcoes?.length))

const violaTamanho = all.filter(q => !q.opcoes || !q.opcoes_comentario || q.opcoes.length !== q.opcoes_comentario.length)
console.log(`Violam opcoes.length === opcoes_comentario.length: ${violaTamanho.length}`)
violaTamanho.slice(0,10).forEach(q => console.log(' ', q.id, q.materia, 'opcoes=', q.opcoes?.length, 'comentarios=', q.opcoes_comentario?.length))

const regexVeredito = /^\s*(correct|incorrect)[oa][.:]/i
const violaVeredito = all.filter(q => q.opcoes && q.opcoes.some(o => regexVeredito.test(o)))
console.log(`Violam "sem vazamento de veredito no início da opção": ${violaVeredito.length}`)
violaVeredito.slice(0,15).forEach(q => {
  const idx = q.opcoes.findIndex(o => regexVeredito.test(o))
  console.log(' ', q.id, q.materia, `[${idx}]:`, q.opcoes[idx].slice(0,80))
})
