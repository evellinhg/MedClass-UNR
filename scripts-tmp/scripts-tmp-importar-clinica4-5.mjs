// Importa os flashcards de Clínica Médica 4º e 5º ano (~/Downloads/clinica 4 e
// ~/Downloads/clinica5). Cada arquivo-fonte tem um campo de tema (tema ou
// disciplina_base) usado pra agrupar em baralhos de até 20 cartões: temas com
// >=8 cartões viram baralho próprio (dividido em "Parte N" se >20); temas
// menores que isso são fundidos num baralho "resto" com título curado à mão
// (LABELS[".resto"]), pra não gerar dezenas de baralhos de 1-2 cartões.
//
// flashcards-reumatologia.json (v1) é ignorado -- confirmado que
// flashcards-reumatologia-v2.json contém todo o conteúdo do v1 (25/25 cartões
// de Artrite Reumatoide com texto idêntico) mais cartões extras.
//
// 4 arquivos de clinica4 (ut12, ut17, ut18, ut18-19-20) cobrem tema que já
// existe no banco sob outro número de UT (ex: conteúdo de "ut18.json" é na
// verdade Endocardite/FOD, que já está em UT12) -- por decisão do usuário,
// entram como baralhos extras (rótulo real do tema, sem forçar o número de
// UT errado do nome do arquivo).
//
// Uso: node scripts-tmp-importar-clinica4-5.mjs --dry-run
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
const HOME = process.env.HOME
const MAX_POR_BARALHO = 20
const THRESHOLD = 8
const DRY_RUN = process.argv.includes("--dry-run")
const RESTO = "__resto__"

function normalizar(texto) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim()
}
function dividirEmPartes(lista, tamanhoMax) {
  const nPartes = Math.ceil(lista.length / tamanhoMax)
  const base = Math.floor(lista.length / nPartes)
  let resto = lista.length % nPartes
  const partes = []
  let i = 0
  for (let p = 0; p < nPartes; p++) {
    const tamanho = base + (resto > 0 ? 1 : 0)
    if (resto > 0) resto--
    partes.push(lista.slice(i, i + tamanho))
    i += tamanho
  }
  return partes
}

function agrupar(cards, keyField, labels, prefixo) {
  const contagem = new Map()
  for (const c of cards) contagem.set(c[keyField], (contagem.get(c[keyField]) ?? 0) + 1)
  const grandes = new Set([...contagem.entries()].filter(([, n]) => n >= THRESHOLD).map(([k]) => k))
  const porGrupo = new Map()
  for (const c of cards) {
    const chave = grandes.has(c[keyField]) ? c[keyField] : RESTO
    const lista = porGrupo.get(chave) ?? []
    lista.push(c)
    porGrupo.set(chave, lista)
  }
  const grupos = []
  for (const [chave, lista] of porGrupo) {
    const titulo = labels[chave] ?? (chave === RESTO ? undefined : `${prefixo} - ${chave}`)
    if (!titulo) throw new Error(`Falta label pro grupo "${chave}"`)
    const partes = dividirEmPartes(lista, MAX_POR_BARALHO)
    partes.forEach((parte, i) => {
      grupos.push({ titulo: `${titulo}${partes.length > 1 ? ` - Parte ${i + 1}` : ""}`, cards: parte })
    })
  }
  return grupos
}

function agruparWhole(cards, tituloBase) {
  const partes = dividirEmPartes(cards, MAX_POR_BARALHO)
  return partes.map((parte, i) => ({ titulo: `${tituloBase}${partes.length > 1 ? ` - Parte ${i + 1}` : ""}`, cards: parte }))
}

// ---------------------------------------------------------------------
const FILES = [
  // -- clínica 5º ano ----------------------------------------------------
  {
    arquivo: `${HOME}/Downloads/clinica5/flashcards-cardiol-5to.json`,
    materia: "clinica_medica_5", prefixo: "Clínica Médica (5º Ano) - Cardiología",
    keyField: "tema", labels: {},
  },
  {
    arquivo: `${HOME}/Downloads/clinica5/flashcards-clinica-medica-5to.json`,
    materia: "clinica_medica_5", prefixo: "Clínica Médica (5º Ano)",
    keyField: "disciplina_base",
    labels: { neumonologia: "Clínica Médica (5º Ano) - Neumonología (Guardia)", infectologia: "Clínica Médica (5º Ano) - Infectología: Tuberculosis y Enfermedad de Chagas", cardiologia: "Clínica Médica (5º Ano) - Cardiología: Emergencias y Urgencias" },
  },
  {
    arquivo: `${HOME}/Downloads/clinica5/flashcards-dermatologia-5to.json`,
    materia: "clinica_medica_5", prefixo: "Clínica Médica (5º Ano) - Dermatología",
    keyField: "tema", labels: {},
  },
  {
    arquivo: `${HOME}/Downloads/clinica5/flashcards-dermatologia-manifestaciones-5to.json`,
    materia: "clinica_medica_5", prefixo: "",
    keyField: "whole", wholeLabel: "Clínica Médica (5º Ano) - Dermatología - Manifestaciones Cutáneas de Enfermedades Sistémicas",
  },
  {
    arquivo: `${HOME}/Downloads/clinica5/flashcards-endocrinologia.json`,
    materia: "clinica_medica_5", prefixo: "Clínica Médica (5º Ano) - Endocrinología",
    keyField: "tema", labels: {},
  },
  {
    arquivo: `${HOME}/Downloads/clinica5/flashcards-gastro-80.json`,
    materia: "clinica_medica_5", prefixo: "Clínica Médica (5º Ano) - Gastroenterología",
    keyField: "tema", labels: { [RESTO]: "Clínica Médica (5º Ano) - Gastroenterología - Hipertransaminasemia y Dolor Abdominal" },
  },
  {
    arquivo: `${HOME}/Downloads/clinica5/flashcards-gastroenterologia.json`,
    materia: "clinica_medica_5", prefixo: "Clínica Médica (5º Ano) - Gastroenterología",
    keyField: "tema", labels: { [RESTO]: "Clínica Médica (5º Ano) - Gastroenterología - Enfermedad Inflamatoria Intestinal (EII)" },
  },
  {
    arquivo: `${HOME}/Downloads/clinica5/flashcards-hematologia.json`,
    materia: "clinica_medica_5", prefixo: "Clínica Médica (5º Ano) - Hematología",
    keyField: "tema", labels: {},
  },
  {
    arquivo: `${HOME}/Downloads/clinica5/flashcards-medio-interno.json`,
    materia: "clinica_medica_5", prefixo: "Clínica Médica (5º Ano) - Medio Interno",
    keyField: "tema", labels: {},
  },
  {
    arquivo: `${HOME}/Downloads/clinica5/flashcards-nefrologia.json`,
    materia: "clinica_medica_5", prefixo: "Clínica Médica (5º Ano) - Nefrología",
    keyField: "tema", labels: { [RESTO]: "Clínica Médica (5º Ano) - Nefrología - Glomerulopatías Secundarias y Misceláneas" },
  },
  {
    arquivo: `${HOME}/Downloads/clinica5/flashcards-neurologia.json`,
    materia: "clinica_medica_5", prefixo: "Clínica Médica (5º Ano) - Neurología",
    keyField: "tema", labels: {},
  },
  {
    arquivo: `${HOME}/Downloads/clinica5/flashcards-reumatologia-v2.json`,
    materia: "clinica_medica_5", prefixo: "Clínica Médica (5º Ano) - Reumatología",
    keyField: "tema", labels: { [RESTO]: "Clínica Médica (5º Ano) - Reumatología - Síndrome de Sjögren, Miopatías Inflamatorias y Espondiloartropatías" },
  },
  {
    arquivo: `${HOME}/Downloads/clinica5/flashcards-sepsis-tbc-chagas-5to.json`,
    materia: "clinica_medica_5", prefixo: "Clínica Médica (5º Ano)",
    keyField: "tema", labels: {},
  },
  {
    arquivo: `${HOME}/Downloads/clinica5/flashcards-toxicologia-salud-mental-5to.json`,
    materia: "clinica_medica_5", prefixo: "Clínica Médica (5º Ano)",
    keyField: "disciplina_base",
    labels: { patologia: "Clínica Médica (5º Ano) - Toxicología: Síndromes Tóxicos y Complicaciones", farmacologia_base: "Clínica Médica (5º Ano) - Toxicología: Antídotos y Farmacología", fisiopatologia: "Clínica Médica (5º Ano) - Toxicología: Fisiopatología de las Intoxicaciones", [RESTO]: "Clínica Médica (5º Ano) - Toxicología: Fisiología y Bioquímica de las Intoxicaciones" },
  },
  // -- clínica 4º ano ------------------------------------------------------
  {
    arquivo: `${HOME}/Downloads/clinica 4/flashcards-ut1.json`,
    materia: "clinica_medica_4", prefixo: "",
    keyField: "tema",
    labels: { "Determinantes Sociales de la Salud": "Clínica Médica (4º Ano) - Determinantes Sociales de la Salud", "Enfoque Biopsicosocial": "Clínica Médica (4º Ano) - Enfoque Biopsicosocial", [RESTO]: "Clínica Médica (4º Ano) - Modelos de Historia Clínica, Ética y Casos Clínicos Integradores" },
  },
  {
    arquivo: `${HOME}/Downloads/clinica 4/flashcards-ut12.json`,
    materia: "clinica_medica_4", prefixo: "",
    keyField: "tema",
    labels: { "Pie Diabético": "Clínica Médica (4º Ano) - Pie Diabético", [RESTO]: "Clínica Médica (4º Ano) - Complicaciones Agudas y Crónicas de la Diabetes Mellitus" },
  },
  {
    arquivo: `${HOME}/Downloads/clinica 4/flashcards-ut13.json`,
    materia: "clinica_medica_4", prefixo: "",
    keyField: "whole", wholeLabel: "Clínica Médica (4º Ano) - Accidente Cerebrovascular (ACV) Isquémico",
  },
  {
    arquivo: `${HOME}/Downloads/clinica 4/flashcards-ut14-v2.json`,
    materia: "clinica_medica_4", prefixo: "",
    keyField: "whole", wholeLabel: "Clínica Médica (4º Ano) - Infectología General (Arbovirosis, ITU, Infecciones de Piel y Partes Blandas)",
  },
  {
    arquivo: `${HOME}/Downloads/clinica 4/flashcards-ut15.json`,
    materia: "clinica_medica_4", prefixo: "",
    keyField: "whole", wholeLabel: "Clínica Médica (4º Ano) - Infecciones Respiratorias (IVAS, NAC, Derrame Pleural)",
  },
  {
    arquivo: `${HOME}/Downloads/clinica 4/flashcards-ut16.json`,
    materia: "clinica_medica_4", prefixo: "",
    keyField: "tema",
    labels: { Dengue: "Clínica Médica (4º Ano) - Dengue", Chikungunya: "Clínica Médica (4º Ano) - Chikungunya", "Fiebre Amarilla": "Clínica Médica (4º Ano) - Fiebre Amarilla", Hantavirus: "Clínica Médica (4º Ano) - Hantavirus", [RESTO]: "Clínica Médica (4º Ano) - Zika, Fiebre Hemorrágica Argentina y Diagnóstico Diferencial de Arbovirosis" },
  },
  {
    arquivo: `${HOME}/Downloads/clinica 4/flashcards-ut17.json`,
    materia: "clinica_medica_4", prefixo: "",
    keyField: "whole", wholeLabel: "Clínica Médica (4º Ano) - Meningitis, Encefalitis y Sepsis",
  },
  {
    arquivo: `${HOME}/Downloads/clinica 4/flashcards-ut18.json`,
    materia: "clinica_medica_4", prefixo: "",
    keyField: "tema",
    labels: { FOD: "Clínica Médica (4º Ano) - Fiebre de Origen Desconocido (FOD)", Endocarditis: "Clínica Médica (4º Ano) - Endocarditis Infecciosa" },
  },
  {
    arquivo: `${HOME}/Downloads/clinica 4/flashcards-ut18-19-20.json`,
    materia: "clinica_medica_4", prefixo: "",
    keyField: "tema",
    labels: {
      "ETS y VIH Manejo Inicial": "Clínica Médica (4º Ano) - ETS y Manejo Inicial del VIH",
      "Complicaciones Asociadas al VIH": "Clínica Médica (4º Ano) - Complicaciones Asociadas al VIH",
      "Tratamiento Antirretroviral": "Clínica Médica (4º Ano) - Tratamiento Antirretroviral",
      "Tratamiento de la Endocarditis": "Clínica Médica (4º Ano) - Tratamiento de la Endocarditis",
      [RESTO]: "Clínica Médica (4º Ano) - Endocarditis: Microbiología, Diagnóstico, Fisiopatología y Complicaciones",
    },
  },
]

let ordemGlobal = 900
let totalDecks = 0
let totalCards = 0

for (const cfg of FILES) {
  const raw = JSON.parse(readFileSync(cfg.arquivo, "utf-8"))
  const cards = raw.map((c) => ({
    frente: c.frente ?? c.pregunta,
    verso: c.verso ?? c.respuesta,
    fontes: c.fuente ? [c.fuente] : [],
    tags: c.tags ?? [],
    tema: c.tema,
    disciplina_base: c.disciplina_base,
  }))
  const vazias = cards.filter((c) => !c.frente?.trim() || !c.verso?.trim())
  if (vazias.length > 0) {
    console.error(`[${cfg.arquivo}] ${vazias.length} cartão(ões) vazio(s) -- abortando este arquivo.`)
    continue
  }

  let grupos
  if (cfg.keyField === "whole") grupos = agruparWhole(cards, cfg.wholeLabel)
  else grupos = agrupar(cards, cfg.keyField, cfg.labels, cfg.prefixo)

  console.log(`\n[${cfg.arquivo.split("/").pop()}] ${cards.length} cartões -> ${grupos.length} baralho(s)`)
  for (const grupo of grupos) {
    console.log(`  "${grupo.titulo}": ${grupo.cards.length} cartões`)
    totalDecks++
    totalCards += grupo.cards.length
    if (DRY_RUN) continue

    const tagsUnicas = [...new Set(grupo.cards.flatMap((c) => c.tags))]
    const { data: novoDeck, error: deckError } = await supabase
      .from("materiais_flashcard_decks")
      .insert({ titulo: grupo.titulo, materia: cfg.materia, subsecao: null, disciplina_base: null, descricao: null, cor_hex: "#8b5cf6", ordem: ordemGlobal++, ativo: true, tags: tagsUnicas })
      .select("id").single()
    if (deckError || !novoDeck) { console.error(`  ERRO ao criar baralho:`, deckError?.message); process.exit(1) }

    const payload = grupo.cards.map((c, idx) => ({ deck_id: novoDeck.id, ordem: idx + 1, frente: c.frente, verso: c.verso, fontes: c.fontes }))
    const { error: cardsError } = await supabase.from("materiais_flashcards").insert(payload)
    if (cardsError) { console.error(`  ERRO ao inserir cartões:`, cardsError.message); process.exit(1) }
  }
}

console.log(`\n${DRY_RUN ? "[DRY RUN] " : ""}Total: ${totalDecks} baralhos, ${totalCards} cartões.`)
