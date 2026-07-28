# Otimizações de Escalabilidade — MedClass Teórico

## Contexto

Mesma leva de otimizações já aplicada no MedClass Prático (ver `docs/SCALABILITY-OPTIMIZATIONS.md` daquele repo), adaptada para a arquitetura do Teórico: uma plataforma de estudo individual (simulados, treino avulso, trilhas), não colaborativa em tempo real como o Prático — por isso não há filtros de canal WebSocket a ajustar aqui, o uso de Supabase Realtime é bem mais leve (`notifications-panel.tsx`, `medcoins-widget.tsx`).

**Objetivo:** preparar o ambiente para alto fluxo de alunos simultâneos (ex.: pico de acesso perto de datas de prova), sem custo adicional agora.

---

## O que foi implementado (sem custo)

### 1. Cache das questões ativas (o maior gargalo real)
- **Arquivo:** `lib/questoes-cache.ts`
- **TTL:** 10 minutos
- **Problema encontrado:** a tabela `questoes` (95 questões REVALIDA 2024/1, conteúdo estático — igual para todo mundo) era buscada **sem cache, direto do Supabase, em 4 fluxos de leitura diferentes**: `practice-launcher.tsx` (2x — verificar disponibilidade e iniciar treino), `simulados-content.tsx` (criar simulado customizado), `trilha-ativa-content.tsx` (iniciar etapa de trilha), `simulado-player.tsx` (pool de questões ao abrir treino livre). Cada início de treino disparava uma query nova com uma combinação diferente de filtros (área/dificuldade/prova/edição).
- **Solução:** busca única de todas as questões `ativo=true` (cacheada), com os filtros de área/dificuldade/prova/edição aplicados em memória no cliente (`filtrarPoolIds` em `lib/questoes-cache.ts`) em vez de uma nova query por combinação de filtro.
- **Não mexido:** o fluxo de retomar um simulado já criado (`.in("id", questionIds)` em `simulado-player.tsx`) continua como query direta — não passa pelo cache de `ativo=true`, porque um simulado antigo pode referenciar uma questão que foi desativada depois, e cachear isso quebraria a retomada.
- **Não mexido:** `admin-questoes-content.tsx` e `admin-overview-content.tsx` continuam sem cache — são telas de admin, baixo tráfego, e cachear a listagem do admin arrisca mostrar dado desatualizado logo após uma edição.

### 2. Rate Limiting no Middleware
- **Arquivo:** `middleware.ts`
- **Limite:** 100 requisições por minuto por IP, com limpeza periódica do Map para não crescer sem limite
- **Mesma ressalva do Prático:** é best-effort por instância (Map em memória), não uma garantia global no ambiente distribuído da Vercel. Proteção básica contra abuso simples, não rate limiting rígido.

### 3. SSG para a Landing Page
- **Arquivo:** `app/page.tsx`
- **Revalidação:** 3600 segundos (1 hora)

### 4. Índices no Banco
- **Arquivo:** `docs/database-indexes.sql`
- **25 índices**, nomes de tabela/coluna verificados contra o código (`grep .from(...)`) e confirmados ao vivo via `information_schema.tables` antes de rodar
- **Status:** ✅ executado no SQL Editor do Supabase (projeto `dskukjeynbebthgithcb`)
- `leaderboard` é uma `VIEW` (não materializada) — não foi indexada diretamente, mesma situação do `practico_ranking_geral` no Prático

### 5. Connection Pooling (Supavisor)
- Mesma orientação do Prático: verificar em Settings → Database → Connection pooling no Supabase. Não documentado separadamente aqui — ver `docs/PGBOUNCER-SETUP.md` do repo Prático como referência (o processo é idêntico, só troca o projeto).

---

## Status das Otimizações

| Otimização | Status | Custo |
|---|---|---|
| Cache de questões ativas | ✅ Implementado | Grátis |
| Rate limiting | ✅ Implementado (best-effort por instância) | Grátis |
| SSG na landing page | ✅ Implementado | Grátis |
| Índices no banco | ✅ Executado no Supabase | Grátis |
| Connection pooling (Supavisor) | ⏳ Verificar se está ativo no dashboard | Grátis |
| Upgrade Supabase Pro | ⏳ Pendente para lançamento/pico de tráfego | $25/mês |

---

## Arquivos Criados/Modificados

```
NOVOS:
lib/questoes-cache.ts              — cache de questões ativas + filtro em memória
docs/database-indexes.sql          — script de índices SQL (executado)
docs/SCALABILITY-OPTIMIZATIONS.md  — este documento

MODIFICADOS:
middleware.ts                      — rate limiting
app/page.tsx                       — SSG com revalidate
components/practice-launcher.tsx   — cache de questões ativas
components/simulados-content.tsx   — cache de questões ativas
components/trilha-ativa-content.tsx — cache de questões ativas
components/simulado-player.tsx     — cache de questões ativas (pool sem ID fixo)
```
