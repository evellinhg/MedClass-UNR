import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Usage: node scripts-tmp-corrige-tamanho-cm5-lote02-v2.mjs <patches-file.json>
const patchesFile = process.argv[2];
if (!patchesFile) {
  console.error("Usage: node scripts-tmp-corrige-tamanho-cm5-lote02-v2.mjs <patches-file.json>");
  process.exit(1);
}

const patches = JSON.parse(fs.readFileSync(patchesFile, "utf-8"));
console.log(`Applying ${patches.length} patches from ${patchesFile}`);

let ok = 0;
let fail = 0;
for (const p of patches) {
  if (!p.id || !Array.isArray(p.opcoes) || p.opcoes.length !== 4) {
    console.error("Skipping malformed patch", p.id);
    fail++;
    continue;
  }
  const { error } = await supabase
    .from("questoes")
    .update({ opcoes: p.opcoes })
    .eq("id", p.id);
  if (error) {
    console.error(`Error updating ${p.id}:`, error.message);
    fail++;
  } else {
    ok++;
  }
}

console.log(`Done. Updated: ${ok}, Failed: ${fail}`);
