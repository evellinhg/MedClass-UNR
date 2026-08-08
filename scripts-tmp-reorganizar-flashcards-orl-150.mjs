// Desfaz o append de 450 cartões nos 3 baralhos monolíticos de ORL
// (scripts-tmp-importar-flashcards-orl-150.mjs) e recria como baralhos
// novos agrupados por tema, com no máximo 20 cartões cada (dividindo em
// "Parte 1", "Parte 2" etc quando o tema tem mais de 20).
//
// oído e nariz já tinham campo de tema (tema_general / tema) no arquivo
// de origem. faringe não tinha nenhum campo de tópico -- agrupado por
// disciplina_base, unindo as disciplinas com poucos cartões num só grupo
// pra evitar baralhos de 1-2 cartões.
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"

const envFile = readFileSync(new URL(".env.local", import.meta.url), "utf-8")
const env = Object.fromEntries(
  envFile
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=")
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()]
    })
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const HOME = process.env.HOME
const MAX_POR_BARALHO = 20

const DECKS_MONOLITICOS = {
  oido: { id: "9781112a-d9d1-48f0-807b-2a84db3d6139", tagsOriginais: ["otitis_media_serosa","rinofaringe","neoplasia_cavum","adultos","sindrome_de_meniere","hipoacusia_neurosensorial","audiometria","oido_interno","hipoacusia_subita","herpes_virus","neuritis_coclear","urgencia_orl","acumetria","rinne","weber","hipoacusia_conductiva","neurinoma_del_acustico","schwannoma_vestibular","tumores","laringomalacia","estridor_neonatal","pediatria","malformaciones_congenitas","traqueotomia","complicaciones_inmediatas","enfisema_subcutaneo","cirugia_cuello","absceso_retrofaringeo","rigidez_de_nuca","infecciones_cuello","urgencias","espacio_laterofaringeo","diafragma_estiloideo","anatomia_cuello","musculos_suprahioideos","milohioideo"] },
  faringe: { id: "74dbf5bb-cc24-4b60-9d24-d3cabdb955e6", tagsOriginais: ["nodulos_vocales","disfonia_funcional","abuso_vocal","vph","obstruccion_laringea","cianosis","disnea_inspiratoria","urgencias","gingivoestomatitis_herpetica","vhs_1","vesiculas_orales","pediatria","absceso_periamigdalino","trismus","mononucleosis_infecciosa","diagnostico_diferencial","inervacion_laringe","nervio_vago","nervio_laringeo_recurrente","anatomia_laringe","ruptura_esplenica","esplenomegalia_congestiva","complicaciones","musculo_palatofaringeo","pilar_posterior_paladar","anatomia_orofaringe","disfonia_persistente","laringoscopia_70_grados","cancer_de_laringe","adulto_mayor","papiloma_laringeo","malignizacion","neoplasias_laringeas","cuerda_vocal","histologia_laringe","espacio_de_reinke","ligamento_vocal"] },
  nariz: { id: "dca30c3c-90bc-46c7-9282-10bfb8932566", tagsOriginais: ["rinolito","cuerpo_extrano","calcificacion_nasal","inflamacion_cronica","papiloma_nasal","papiloma_invertido","pseudotumor","neoplasia_benigna","sinusitis_aguda","radiografia_waters","seno_maxilar","diagnostico_por_imagenes","fosa_nasal","pared_lateral_nasal","apofisis_unciforme","etmoides","epistaxis","gravedad","repercusion_hemodinamica","urgencias","rinodebitomanometria","insuficiencia_respiratoria_nasal","trauma_nasal","medicina_legal","epistaxis_activa","taponaje_anterior","urgencia_orl","conducta_clinica","obstruccion_nasal_cronica","desviacion_septal","endoscopia_nasal","cirugia_funcional","adenoidectomia","hipertrofia_adenoidea","otitis_media_serosa","pediatria","faringoamigdalitis_aguda","test_rapido_estreptococo","streptococcus_pyogenes"] },
}

console.log("== Passo 1: desfazendo o append anterior (removendo cartões com ordem > 10) ==")
for (const [nome, info] of Object.entries(DECKS_MONOLITICOS)) {
  const { error: delError, count } = await supabase
    .from("materiais_flashcards")
    .delete({ count: "exact" })
    .eq("deck_id", info.id)
    .gt("ordem", 10)
  if (delError) {
    console.error(`[${nome}] erro ao remover cartões:`, delError.message)
    process.exit(1)
  }
  const { error: tagsError } = await supabase
    .from("materiais_flashcard_decks")
    .update({ tags: info.tagsOriginais })
    .eq("id", info.id)
  if (tagsError) {
    console.error(`[${nome}] erro ao restaurar tags:`, tagsError.message)
    process.exit(1)
  }
  console.log(`[${nome}] ${count} cartões removidos, tags originais restauradas.`)
}

function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
}

function maisComum(lista) {
  const contagem = new Map()
  for (const item of lista) contagem.set(item, (contagem.get(item) ?? 0) + 1)
  return [...contagem.entries()].sort((a, b) => b[1] - a[1])[0][0]
}

function dividirEmPartes(lista, tamanho) {
  const partes = []
  for (let i = 0; i < lista.length; i += tamanho) partes.push(lista.slice(i, i + tamanho))
  return partes
}

// -- oído --------------------------------------------------------------
const oidoRaw = JSON.parse(readFileSync(`${HOME}/Downloads/preguntas_examen.oido._orl_150_flashcards.json`, "utf-8"))
const oidoPorTema = new Map()
for (const c of oidoRaw) {
  const lista = oidoPorTema.get(c.tema_general) ?? []
  lista.push(c)
  oidoPorTema.set(c.tema_general, lista)
}
const gruposOido = []
for (const [tema, cards] of oidoPorTema) {
  const partes = dividirEmPartes(cards, MAX_POR_BARALHO)
  partes.forEach((parte, i) => {
    gruposOido.push({
      titulo: `Otorrinolaringología - ${tema}${partes.length > 1 ? ` - Parte ${i + 1}` : ""}`,
      disciplina_base: maisComum(parte.map((c) => c.disciplina_base)),
      cards: parte.map((c) => ({ frente: c.frente, verso: c.dorso, fontes: c.fuente ? [c.fuente] : [], tags: c.tags ?? [] })),
    })
  })
}

// -- nariz -------------------------------------------------------------
const narizRaw = JSON.parse(readFileSync(`${HOME}/Downloads/flashcards_nariz.orl_150.json`, "utf-8"))
const narizPorTema = new Map()
for (const c of narizRaw) {
  const lista = narizPorTema.get(c.tema) ?? []
  lista.push(c)
  narizPorTema.set(c.tema, lista)
}
const gruposNariz = []
for (const [tema, cards] of narizPorTema) {
  const partes = dividirEmPartes(cards, MAX_POR_BARALHO)
  partes.forEach((parte, i) => {
    gruposNariz.push({
      titulo: `Otorrinolaringología - ${tema}${partes.length > 1 ? ` - Parte ${i + 1}` : ""}`,
      disciplina_base: null,
      cards: parte.map((c) => ({ frente: c.pregunta, verso: c.respuesta, fontes: [], tags: c.tags ?? [] })),
    })
  })
}

// -- faringe (sem campo de tema -- agrupado por disciplina_base) -------
const faringeRaw = JSON.parse(readFileSync(`${HOME}/Downloads/flashcards_orl_faringe.json`, "utf-8"))
const GRUPOS_PEQUENOS = new Set(["fisiologia", "microbiologia", "farmacologia", "embriologia", "bioquimica"])
const faringePorTema = new Map()
for (const c of faringeRaw) {
  const chave = GRUPOS_PEQUENOS.has(c.disciplina_base) ? "Fisiología, Farmacología y Microbiología" : c.disciplina_base
  const lista = faringePorTema.get(chave) ?? []
  lista.push(c)
  faringePorTema.set(chave, lista)
}
const NOME_DISCIPLINA = { patologia: "Patología", anatomia: "Anatomía" }
const gruposFaringe = []
for (const [chave, cards] of faringePorTema) {
  const partes = dividirEmPartes(cards, MAX_POR_BARALHO)
  const nomeGrupo = NOME_DISCIPLINA[chave] ?? chave
  partes.forEach((parte, i) => {
    gruposFaringe.push({
      titulo: `Otorrinolaringología - Faringo-Laringología - ${nomeGrupo}${partes.length > 1 ? ` - Parte ${i + 1}` : ""}`,
      disciplina_base: GRUPOS_PEQUENOS.has(chave) ? null : chave,
      cards: parte.map((c) => ({ frente: c.frente, verso: c.verso, fontes: [], tags: c.tags ?? [] })),
    })
  })
}

console.log(`\n== Passo 2: criando baralhos (oído: ${gruposOido.length}, nariz: ${gruposNariz.length}, faringe: ${gruposFaringe.length}) ==`)

let ordem = 170
let totalCards = 0
for (const grupo of [...gruposOido, ...gruposNariz, ...gruposFaringe]) {
  const tagsUnicas = [...new Set(grupo.cards.flatMap((c) => c.tags))]
  const { data: novoDeck, error: deckError } = await supabase
    .from("materiais_flashcard_decks")
    .insert({
      titulo: grupo.titulo,
      materia: "otorrinolaringologia",
      subsecao: null,
      disciplina_base: grupo.disciplina_base,
      descricao: null,
      cor_hex: "#8b5cf6",
      ordem: ordem++,
      ativo: true,
      tags: tagsUnicas,
    })
    .select("id")
    .single()
  if (deckError || !novoDeck) {
    console.error(`Erro ao criar baralho "${grupo.titulo}":`, deckError?.message)
    process.exit(1)
  }

  const cardsPayload = grupo.cards.map((c, idx) => ({
    deck_id: novoDeck.id,
    ordem: idx + 1,
    frente: c.frente,
    verso: c.verso,
    fontes: c.fontes,
  }))
  const { data: cards, error: cardsError } = await supabase
    .from("materiais_flashcards")
    .insert(cardsPayload)
    .select("id")
  if (cardsError) {
    console.error(`Erro ao inserir cartões de "${grupo.titulo}":`, cardsError.message)
    process.exit(1)
  }

  console.log(`  "${grupo.titulo}": ${cards.length} cartões`)
  totalCards += cards.length
}

console.log(`\nTotal: ${gruposOido.length + gruposNariz.length + gruposFaringe.length} baralhos novos, ${totalCards} cartões.`)
