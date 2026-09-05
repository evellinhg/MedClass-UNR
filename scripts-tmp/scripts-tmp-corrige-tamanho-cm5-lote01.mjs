// Aplica no Supabase os patches de correção de viés de tamanho (correta longa vs distratoras curtas)
// para o LOTE 1 (80 questões) de clinica_medica_5.
// Lê incrementalmente de scripts-tmp-corrige-tamanho-cm5-lote01-patches.json e aplica todos os
// patches ainda não marcados como aplicados (rastreado em scripts-tmp-corrige-tamanho-cm5-lote01-applied.json).
import fs from "fs";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: new URL("../.env.local", import.meta.url) });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Faltam variáveis SUPABASE no .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const patchFile = new URL("./scripts-tmp-corrige-tamanho-cm5-lote01-patches.json", import.meta.url);
const appliedFile = new URL("./scripts-tmp-corrige-tamanho-cm5-lote01-applied.json", import.meta.url);

const patches = JSON.parse(fs.readFileSync(patchFile, "utf8"));
let applied = [];
if (fs.existsSync(appliedFile)) {
  applied = JSON.parse(fs.readFileSync(appliedFile, "utf8"));
}
const appliedSet = new Set(applied);

const toApply = patches.filter(p => !appliedSet.has(p.id));
console.log(`Total patches no arquivo: ${patches.length}. Já aplicados: ${applied.length}. Pendentes agora: ${toApply.length}.`);

let ok = 0, fail = 0;
for (const p of toApply) {
  const { error } = await supabase
    .from("questoes")
    .update({ opcoes: p.opcoes, opcoes_comentario: p.opcoes_comentario })
    .eq("id", p.id);
  if (error) {
    console.error("ERRO ao atualizar", p.id, error.message);
    fail++;
  } else {
    ok++;
    applied.push(p.id);
  }
}

fs.writeFileSync(appliedFile, JSON.stringify(applied, null, 2));
console.log(`Aplicados agora: ${ok}. Falhas: ${fail}. Total aplicado acumulado: ${applied.length}.`);
