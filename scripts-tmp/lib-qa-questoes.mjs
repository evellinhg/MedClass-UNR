// Módulo de QA reutilizável para a tabela `questoes`, extraído dos
// scanners avulsos criados durante a auditoria de viés/corrupção de
// 2026-09-04/05 (scripts-tmp-scan-vies-todas-materias.mjs,
// scan-frase-curta-generico.mjs, scan-leak-incorrecta.mjs,
// scan-corrupcao-geral.mjs). Usado pelo gate de importação
// (scripts-tmp-gate-importacao.mjs) para validar um lote de questões
// ANTES de ficarem visíveis (ativo=true) pro aluno.
//
// Separação erros (bloqueiam) vs avisos (exigem --force pra prosseguir):
// erros são coisas objetivamente quebradas (índice inválido, contagem
// de opções não bate, veredito vazado, template falso, autorreferência
// de letra); avisos são heurísticas estatísticas que podem ter falso
// positivo em conteúdo legítimo (viés de tamanho, frase final truncada).

const REGEX_VEREDITO = /^\s*(correct|incorrect)[oa][.:]/i
const REGEX_JUNK_ENUNCIADO = /Pregunta de evaluaci[oó]n sobre/i
const REGEX_JUNK_OPCAO = /Opci[oó]n de evaluaci[oó]n [A-D]/i
const REGEX_LETRA_COMBINADA = /\b([A-D])\s+y\s+([A-D])\s+son\s+correctas/i

function dividirFrases(texto) {
  const frases = []
  let atual = ""
  for (let i = 0; i < texto.length; i++) {
    atual += texto[i]
    if (texto[i] === ".") {
      const proximo = texto[i + 1]
      const anterior = texto[i - 1]
      const separadorDeMilhar = anterior && /\d/.test(anterior) && proximo && /\d/.test(proximo)
      if (!separadorDeMilhar && (proximo === undefined || proximo === " ")) {
        frases.push(atual.trim())
        atual = ""
      }
    }
  }
  if (atual.trim()) frases.push(atual.trim())
  return frases
}

// razão de tamanho: comprimento da correta / média das outras.
// faixa alvo 0.85-1.2 (mesma calibração usada manualmente a sessão toda);
// só acima/abaixo de 2.5x/0.4x é bloqueante -- é um tell óbvio demais
// pra passar mesmo com --force.
function calcularRazaoTamanho(opcoes, indiceCorreta) {
  const lens = opcoes.map((o) => o.length)
  const lenCorreta = lens[indiceCorreta]
  const outras = lens.filter((_, i) => i !== indiceCorreta)
  const media = outras.reduce((a, b) => a + b, 0) / outras.length
  return lenCorreta / media
}

/**
 * Valida uma questão isolada.
 * @param {{id?: string, enunciado: string, opcoes: string[], opcoes_comentario: string[], indice_correta: number}} q
 * @returns {{erros: string[], avisos: string[]}}
 */
export function validarQuestao(q) {
  const erros = []
  const avisos = []
  const id = q.id ?? "(sem id)"

  if (!Array.isArray(q.opcoes) || q.opcoes.length < 2) {
    erros.push(`[${id}] menos de 2 opções`)
    return { erros, avisos } // sem opções válidas, nenhum outro check faz sentido
  }
  if (!Array.isArray(q.opcoes_comentario) || q.opcoes_comentario.length !== q.opcoes.length) {
    erros.push(`[${id}] opcoes.length (${q.opcoes.length}) !== opcoes_comentario.length (${q.opcoes_comentario?.length})`)
  }
  if (q.indice_correta == null || q.indice_correta < 0 || q.indice_correta >= q.opcoes.length) {
    erros.push(`[${id}] indice_correta (${q.indice_correta}) fora do intervalo de opcoes`)
    return { erros, avisos } // sem índice correto válido, checks de conteúdo abaixo não fazem sentido
  }

  if (q.opcoes.some((o) => REGEX_VEREDITO.test(o))) {
    erros.push(`[${id}] veredito vazado no início de uma opção ("Correcto."/"Incorrecto:" etc.)`)
  }
  if (REGEX_JUNK_ENUNCIADO.test(q.enunciado || "") || q.opcoes.some((o) => REGEX_JUNK_OPCAO.test(o))) {
    erros.push(`[${id}] template de fallback quebrado ("Pregunta de evaluación sobre..."/"Opción de evaluación A...")`)
  }

  q.opcoes.forEach((o, idx) => {
    const m = o.match(REGEX_LETRA_COMBINADA)
    if (!m) return
    const letraOpcao = String.fromCharCode(65 + idx)
    if ([m[1].toUpperCase(), m[2].toUpperCase()].includes(letraOpcao) && idx === q.indice_correta) {
      erros.push(`[${id}] alternativa correta se autorreferencia ("${letraOpcao} y ... son correctas" dita pela própria opção ${letraOpcao})`)
    }
  })

  const razao = calcularRazaoTamanho(q.opcoes, q.indice_correta)
  if (razao > 2.5 || razao < 0.4) {
    erros.push(`[${id}] razão de tamanho extrema (${razao.toFixed(2)}x) -- tell óbvio de qual é a correta`)
  } else if (razao > 1.2 || razao < 0.85) {
    avisos.push(`[${id}] razão de tamanho fora da faixa alvo (${razao.toFixed(2)}x, alvo 0.85-1.2x)`)
  }

  q.opcoes.forEach((o, idx) => {
    if (idx === q.indice_correta) return // nunca reportar a correta aqui
    const frases = dividirFrases(o)
    if (frases.length < 2) return
    const ultima = frases[frases.length - 1]
    const palavras = ultima.replace(/\.$/, "").trim().split(/\s+/)
    if (palavras.length <= 4) {
      avisos.push(`[${id}] opção [${idx}] com frase final curta após outra frase -- possível truncamento ("...${ultima}")`)
    }
  })

  return { erros, avisos }
}

/**
 * Valida um lote inteiro, incluindo checks que só fazem sentido no
 * agregado (enunciados duplicados dentro do próprio lote).
 * @param {Array} questoes
 * @returns {{erros: string[], avisos: string[], porQuestao: Map<string, {erros: string[], avisos: string[]}>}}
 */
export function validarLote(questoes) {
  const erros = []
  const avisos = []
  const porQuestao = new Map()

  for (const q of questoes) {
    const r = validarQuestao(q)
    porQuestao.set(q.id, r)
    erros.push(...r.erros)
    avisos.push(...r.avisos)
  }

  const porEnunciado = new Map()
  for (const q of questoes) {
    const chave = (q.enunciado || "").trim().toLowerCase()
    if (!chave) continue
    if (!porEnunciado.has(chave)) porEnunciado.set(chave, [])
    porEnunciado.get(chave).push(q.id)
  }
  for (const [, ids] of porEnunciado) {
    if (ids.length > 1) avisos.push(`enunciado duplicado dentro do lote em ${ids.length} questões: ${ids.join(", ")}`)
  }

  return { erros, avisos, porQuestao }
}
