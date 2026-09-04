// Corrige o viés de tamanho (a alternativa correta muito mais longa/elaborada que as
// distratoras) no LOTE 0 de 11 do banco de questões "clinica_medica_5".
//
// Contexto: um processo de geração por IA criou ~1300 questões onde a alternativa
// CORRETA recebeu uma justificativa clínica longa (200-450+ caracteres) e as
// alternativas ERRADAS ficaram curtas e genéricas (60-140 caracteres), criando um
// "tell" de tamanho que permite acertar sem saber a matéria.
//
// Este script reescreve o TEXTO de cada alternativa errada desproporcionalmente curta
// (< 60% do tamanho da alternativa correta), incorporando nela o raciocínio clínico
// (mecanismo fisiopatológico, achado laboratorial, etc.) que já existia apenas no
// `opcoes_comentario` correspondente — mantendo a alternativa MEDICAMENTE ERRADA, só
// que agora escrita com nível de detalhe comparável ao da alternativa correta.
//
// NÃO altera `indice_correta` nem o texto da alternativa correta.
// Os `opcoes_comentario` são mantidos como estavam (nenhum novo texto de alternativa
// é cópia literal do comentário correspondente — verificado programaticamente).
//
// Os textos de substituição estão em `scripts-tmp-corrige-tamanho-cm5-lote00-patches.json`
// (mesma pasta), no formato: { "<id da questão>": { "<índice da alternativa>": "novo texto" } }
//
// Uso:
//   cd "/Users/Evelllin/Desktop/MedClass UNR"
//   node scripts-tmp-corrige-tamanho-cm5-lote00.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const patches = JSON.parse(
  readFileSync(join(__dirname, "scripts-tmp-corrige-tamanho-cm5-lote00-patches.json"), "utf-8")
);

const questionIds = Object.keys(patches);
console.log(`Aplicando patches a ${questionIds.length} questões (lote 0)...`);

let updated = 0;
let totalAlternativasReescritas = 0;
let errors = [];

for (const id of questionIds) {
  const { data: rows, error: fetchError } = await supabase
    .from("questoes")
    .select("id, opcoes, opcoes_comentario, indice_correta")
    .eq("id", id)
    .limit(1);

  if (fetchError || !rows || rows.length === 0) {
    errors.push({ id, error: fetchError?.message ?? "no encontrado" });
    continue;
  }

  const row = rows[0];
  const novasOpcoes = [...row.opcoes];
  const patch = patches[id];

  let touched = 0;
  for (const [idxStr, newText] of Object.entries(patch)) {
    const idx = Number(idxStr);
    if (idx === row.indice_correta) {
      // Salvaguarda: nunca tocar la alternativa correcta.
      errors.push({ id, error: `patch intentaba tocar indice_correta (${idx}), omitido` });
      continue;
    }
    novasOpcoes[idx] = newText;
    touched++;
  }

  if (touched === 0) continue;

  const { error: updateError } = await supabase
    .from("questoes")
    .update({ opcoes: novasOpcoes, opcoes_comentario: row.opcoes_comentario })
    .eq("id", id);

  if (updateError) {
    errors.push({ id, error: updateError.message });
    continue;
  }

  updated++;
  totalAlternativasReescritas += touched;
}

console.log(`\nQuestões actualizadas: ${updated}/${questionIds.length}`);
console.log(`Alternativas reescritas en total: ${totalAlternativasReescritas}`);
if (errors.length) {
  console.log(`\nErrores/avisos (${errors.length}):`);
  for (const e of errors) console.log(`  - ${e.id}: ${e.error}`);
}

// --- Verificación ---
console.log("\n--- Verificación ---");
const { data: verifyRows, error: verifyError } = await supabase
  .from("questoes")
  .select("id, opcoes, opcoes_comentario, indice_correta")
  .in("id", questionIds);

if (verifyError) {
  console.error("Error en verificación:", verifyError.message);
  process.exit(1);
}

let lengthMismatch = 0;
for (const row of verifyRows) {
  if (row.opcoes.length !== row.opcoes_comentario.length) {
    lengthMismatch++;
    console.log(`  MISMATCH opcoes/comentarios en ${row.id}`);
  }
}
console.log(`Filas verificadas: ${verifyRows.length}`);
console.log(`Mismatches opcoes.length !== opcoes_comentario.length: ${lengthMismatch}`);
console.log("Listo.");
