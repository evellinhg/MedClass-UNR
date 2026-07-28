# Histórico da Conversa — MedClass Teórico

## Sessão 1: Análise e Implementação de Melhorias

### Início
O usuário trouxe um documento de análise (`Analise_MedClass_Teorico.docx`) com 13 tarefas identificadas como melhorias para a plataforma. O projeto já estava funcional com as 95 questões REVALIDA 2024/1 importadas.

### Tarefas Identificadas (do documento de análise)
1. Importar 95 questões REVALIDA 2024/1
2. Filtro de edição nas listagens
3. Admin: comentarios por alternativa + campo edição
4. SimuladoPlayer: opcoes_comentario com bordas coloridas
5. Vercel env vars (ADMIN_EMAILS, SERVICE_ROLE_KEY)
6. supabase.js → supabase.ts
7. Navegação mobile (já existia)
8. Server Components (já eram)
9. Route protection (middleware)
10. Error boundaries
11. Paginação em listas grandes
12. Shuffle refatorado (Fisher-Yates)
13. Service Worker offline
14. In-app notifications
15. Race condition nos timers
16. Analytics de comportamento

### Decisões Importantes

#### Importação das Questões
- RLS bloqueia inserts com anon key → precisa usar `SUPABASE_SERVICE_ROLE_KEY`
- 5 questões anuladas pelo INEP: 7, 17, 43, 49, 83
- JSON gerado com metadados completos (area, tags, dificuldade, justificativa, opcoes_comentario)

#### Variáveis de Ambiente Vercel
- **Problema:** Vercel não aceita underscores em nomes de variáveis
- **Solução:** `NEXT_PUBLIC_ADMIN_EMAILS` → `ADMIN_EMAILS`
- `SUPABASE_SERVICE_ROLE_KEY` precisou ser adicionada ao Vercel para API routes

#### Build TypeScript
- `ignoreBuildErrors` estava true no next.config.mjs → removido
- Erros de TypeScript passaram a ser catching no build

#### supabase.js → .ts
- Renomeado com non-null assertions para satisfazer TypeScript

#### Middleware
- Criado `middleware.ts` para proteção server-side
- Verifica sessão Supabase via cookies
- Redireciona não-logados para `/login`
- Admin: verifica se email está em `ADMIN_EMAILS`

#### Race Condition no Timer
- **Problema:** `confirmAnswer` chamada via useEffect em `questionTimeLeft === 0` mas não estava no array de deps → closure stale com valores antigos
- **Análise:** Dois timers rodam simultaneamente (geral elapsed + por questão). O timer geral usa `Date.now()-startedAt` (seguro). O por questão usa `setQuestionTimeLeft(prev => prev - 1)` (seguro). O problema era só no `confirmAnswer` que lia state stale.
- **Solução:** `useRef` para `pendingAnswerRef`, `currentIndexRef` — timer lê valores atuais sem depender de closures
- **Alternativa considerada:** Colocar `confirmAnswer` no deps array, mas isso causaria re-run desnecessário do effect

#### Notifications
- Criado `lib/notifications.ts` com tipos e helpers CRUD
- `NotificationsPanel` usa Supabase realtime para atualizar badge em tempo real
- `migration_notifications.sql` criado e executado pelo usuário no Supabase

#### Analytics
- Criado `lib/analytics.ts` com `trackEvent()` fire-and-forget (não bloqueia UI)
- `getResumoAnalytics()` retorna contagem por evento + primeiro/último acesso
- Dashboard admin com KPIs: total usuários, ativos 7d, simulados, questões respondidas
- `distinct` no Supabase não funciona com `head: true` → fetch normal + Set.unique no JS

#### Service Worker
- `public/sw.js` intercepta requests e cacheia assets estáticos
- Não intercepta requests da API (Supabase, etc.) — apenas assets do proprio dominio
- `ServiceWorkerRegistration` adicionado no `app/layout.tsx`

### Arquivos Criados
```
middleware.ts
lib/analytics.ts
lib/notifications.ts
lib/utils.ts (cn + shuffle)
components/pagination.tsx
components/notifications-panel.tsx
components/service-worker-registration.tsx
components/admin-analytics-content.tsx
public/sw.js
app/admin/analytics/page.tsx
app/dashboard/error.tsx
app/admin/error.tsx
app/login/error.tsx
app/global-error.tsx
migration_notifications.sql (deletado após uso)
migration_analytics.sql (deletado após uso)
ENVIAR AO CLAUDE.md
HISTORICO_CONVERSA.md
```

### Arquivos Modificados
```
next.config.mjs (ignoreBuildErrors removido)
lib/supabase.js → lib/supabase.ts
lib/quiz-config.ts (EDICOES adicionado)
lib/admin-config.ts (ADMIN_EMAILS de env var)
lib/plan-status.ts (FREE_SIMULADO_MAX_QUESTIONS)
lib/scoring.ts (calculatePoints)
lib/difficulty-colors.ts
components/simulado-player.tsx (opcoes_comentario, edicao, timer fix, tracking)
components/practice-launcher.tsx (edicao, tracking)
components/simulados-content.tsx (edicao, tracking, pagination)
components/admin-questoes-content.tsx (rewrite completo, edicao, opcoes_comentario)
components/dashboard-header.tsx (notifications panel)
app/layout.tsx (service worker registration)
```

### Commits
```
5f90c64  feat: edicao + pagination + admin edicao
de71553  feat: raca condition fix + analytics
263fc8d  feat: middleware + error boundaries + service worker
32d2181  feat: notifications + mobile nav + shuffle refactor
4f1a83d  feat: analytics de comportamento do usuario
40db3c2  chore: remover migrations SQL ja executadas
7fe69e5  docs: resumo da sessao para envio ao claude
```

### Erros Encontrados e Resolvidos
1. **RLS bloqueia inserts** → usar service role key
2. **Vercel underscores** → renomear env vars
3. **TypeScript build errors** → remover ignoreBuildErrors + fixes pontuais
4. **`distinct` não suportado com `head: true`** → fetch normal + Set no JS
5. **`config` possibly null** → adicionar null check antes de trackEvent
6. **Closure stale no timer** → usar refs

### Estado Final
- Todas as 13 tarefas do documento de análise: ✅ completas
- Build: ✅ passando
- Git: commits feitos, push manual necessário (credenciais)
- Supabase: todas as migrations executadas
- Vercel: variáveis de ambiente configuradas

### Pendente (futuro)
- Implementar visualização de analytics no painel do aluno (apenas admin tem)
- Considerar Google Analytics / Vercel Analytics para métricas de página
- Service Worker: considerar cache de questoes para modo offline real

---

## Sessão 2 (2026-07-28): Otimizações de escalabilidade (portadas do MedClass Prático)

### Contexto
O usuário pediu para replicar aqui a mesma auditoria/otimização de escalabilidade feita no projeto irmão MedClass Prático (repo e Supabase separados, `dskukjeynbebthgithcb`). Antes de implementar, foi confirmado que nada disso existia neste projeto ainda — só os commits de correção de login/PKCE e as 16 tarefas da Sessão 1 (paginação, notifications, analytics etc.) tinham sido feitos.

### Achado principal
A tabela `questoes` (95 questões REVALIDA 2024/1, conteúdo estático — igual para todo mundo) era buscada **sem cache, direto do Supabase, em 4 fluxos de leitura diferentes**: `practice-launcher.tsx` (2x — verificar disponibilidade e iniciar treino), `simulados-content.tsx` (criar simulado customizado), `trilha-ativa-content.tsx` (iniciar etapa de trilha) e `simulado-player.tsx` (pool de questões ao abrir treino livre sem IDs fixos). Cada combinação de filtro (área/dificuldade/prova/edição) disparava uma query nova.

### O que foi implementado
1. **`lib/questoes-cache.ts`** — busca única de todas as questões `ativo=true` (TTL 10min), com os filtros de área/dificuldade/prova/edição aplicados em memória no cliente (`filtrarPoolIds()`) em vez de uma nova query por combinação de filtro.
   - **Deliberadamente não cacheado:** o fluxo de retomar um simulado já criado (`.in("id", questionIds)` em `simulado-player.tsx`) — um simulado antigo pode referenciar uma questão desativada depois, e filtrar pelo cache de `ativo=true` esconderia essa questão silenciosamente.
   - **Deliberadamente não cacheado:** `admin-questoes-content.tsx` e `admin-overview-content.tsx` — telas de admin, baixo tráfego, risco de mostrar dado desatualizado logo após uma edição.
2. **Rate limiting no `middleware.ts`** — mesmo padrão do Prático (Map em memória, best-effort por instância, com limpeza periódica).
3. **SSG na landing page** (`app/page.tsx`, `revalidate = 3600`).
4. **`docs/database-indexes.sql`** — 25 índices. Diferente do que aconteceu no Prático, aqui todas as 17 tabelas referenciadas pelo código já existiam de verdade (confirmado via `information_schema.tables` antes de rodar) — nenhum nome fantasma. Executados com sucesso no Supabase de produção (`dskukjeynbebthgithcb`).
5. **`leaderboard` confirmada como `VIEW` comum** (mesma situação de `practico_ranking_geral` no Prático) — não indexada diretamente.

### Commit desta sessão
```
f432bc5  perf: otimizacoes de escalabilidade (cache de questoes, rate limit, indices)
```
Pushado para `origin/main` pelo usuário (esta sessão de terminal não tinha credenciais de git configuradas para este repo).

### Estado final
- Build (`next build`): ✅ passando
- Índices: ✅ executados no Supabase de produção
- Ver `docs/SCALABILITY-OPTIMIZATIONS.md` para o detalhamento completo item a item
