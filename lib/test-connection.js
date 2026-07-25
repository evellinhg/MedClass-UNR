import { supabase } from '../lib/supabase.js';

async function testConnection() {
  console.log("Testando conexão com Supabase...");
  const { data, error } = await supabase.from('questoes').select('*').limit(1);
  
  if (error) {
    console.error("Erro na conexão:", error.message);
  } else {
    console.log("Sucesso! Conectado ao banco. Dados encontrados:", data);
  }
}

testConnection();