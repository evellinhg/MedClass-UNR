"""
Script de importação das questões REVALIDA 2024/1 para o Supabase.
Execute com: python3 importar_revalida_2024.py

Pré-requisitos:
1. pip install supabase
2. Configurar variáveis de ambiente:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   (ou editar as constantes abaixo)
"""

import json
import os

# ===== CONFIGURAÇÃO =====
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "https://dskukjeynbebthgithcb.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRza3VramV5bmJlYnRoZ2l0aGNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDU4ODIwMiwiZXhwIjoyMTAwMTY0MjAyfQ.HpSniGOGmODFqZaHl3bdQ5vIQqyBT7w72_iX-J5peDw")

# Arquivo JSON com as questões
PAYLOAD_FILE = "revalida_2024_1_classificado.json"

def main():
    try:
        from supabase import create_client
    except ImportError:
        print("❌ Supabase não instalado. Execute: pip install supabase")
        return

    # Conectar ao Supabase
    print("🔌 Conectando ao Supabase...")
    client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Carregar payload
    print(f"📄 Carregando questões de: {PAYLOAD_FILE}")
    with open(PAYLOAD_FILE, "r") as f:
        questoes = json.load(f)

    print(f"📊 Total de questões: {len(questoes)}")

    # Verificar questões existentes (evitar duplicatas)
    print("🔍 Verificando questões existentes...")
    existing = client.table("questoes").select("enunciado").execute()
    existing_enunciados = {q["enunciado"][:100] for q in (existing.data or [])}

    # Filtrar duplicatas
    novas_questoes = [
        q for q in questoes
        if q["enunciado"][:100] not in existing_enunciados
    ]

    duplicadas = len(questoes) - len(novas_questoes)
    if duplicadas > 0:
        print(f"⚠️  {duplicadas} questões já existem no banco. Serão inseridas apenas {len(novas_questoes)} novas.")

    if not novas_questoes:
        print("✅ Todas as questões já estão no banco de dados!")
        return

    # Inserir em lotes de 10 (limitação do Supabase free tier)
    print(f"\n📥 Inserindo {len(novas_questoes)} questões...")
    success = 0
    errors = 0

    for i in range(0, len(novas_questoes), 10):
        batch = novas_questoes[i:i+10]
        try:
            result = client.table("questoes").insert(batch).execute()
            success += len(batch)
            print(f"  ✅ Lote {i//10 + 1}: {len(batch)} questões inseridas")
        except Exception as e:
            errors += len(batch)
            print(f"  ❌ Lote {i//10 + 1}: Erro - {str(e)[:100]}")

    print(f"\n{'='*50}")
    print(f"📊 RESULTADO:")
    print(f"  ✅ Inseridas: {success}")
    print(f"  ❌ Erros: {errors}")
    print(f"  ⚠️  Duplicadas (não inseridas): {duplicadas}")
    print(f"  📋 Total no banco: {len(existing_enunciados) + success}")

    # Verificar inserção
    print("\n🔍 Verificando inserção...")
    final = client.table("questoes").select("*").eq("prova", "REVALIDA").execute()
    print(f"  📋 Questões REVALIDA no banco: {len(final.data or [])}")

if __name__ == "__main__":
    main()
