# Resumo Completo — Sessão MedClass Teórico

## Contexto
Projeto: **MedClass Teórico** — plataforma de estudos para o Exame Nacional de Residência Médica (Revalida), construída com Next.js 16, React 19, TypeScript, Tailwind v4, shadcn/ui, Supabase e Vercel.

---

## 1. Importação de Questões REVALIDA 2024/1 (95 questões)
- PDF extraído com 100 questões, 5 anuladas pelo INEP (7, 17, 43, 49, 83) → 95 válidas
- JSON gerado com metadados: área, tags, dificuldade, justificativa, opções comentadas
- Questões importadas no Supabase com service role key (RLS bloqueia anon)
- Questões antigas do modelo/template (26) foram removidas — só restam as 95 REVALIDA

## 2. Filtro de Edição
- `EDICOES = ["2024/1"]` adicionado em `lib/quiz-config.ts`
- Componentes `practice-launcher.tsx`, `simulados-content.tsx`, `simulado-player.tsx` e `admin-questoes-content.tsx` atualizados com dropdown de edição

## 3. Admin — Comentários por Alternativa e Edição
- `admin-questoes-content.tsx` reescrito: campo `edicao`, expand/collapse de alternativas, `opcoes_comentario` com comentários individuais por alternativa (verde/vermelho)

## 4. SimuladoPlayer — Comentários Visuais
- `simulado-player.tsx`: alternativas com `opcoes_comentario` renderizadas com borda verde (correta) ou vermelha (incorreta) + justificativa

## 5. Infraestrutura Vercel
- `ADMIN_EMAILS` variável de ambiente (substituiu `NEXT_PUBLIC_ADMIN_EMAILS` que tinha underscore)
- `SUPABASE_SERVICE_ROLE_KEY` adicionada ao Vercel para `/api/admin/*`
- `ignoreBuildErrors` removido do `next.config.mjs` — build agora valida TypeScript
- `lib/supabase.js` renomeado para `lib/supabase.ts` com non-null assertions

## 6. Route Protection — Middleware
- `middleware.ts` criado: proteção server-side para `/dashboard`, `/admin`, `/questoes` com verificação de sessão Supabase via `@supabase/ssr`
- Usa `createServerClient` do `@supabase/ssr` com `getUser()` para validar sessão server-side

## 7. Error Boundaries
- `app/dashboard/error.tsx`, `app/admin/error.tsx`, `app/login/error.tsx`, `app/global-error.tsx` — tratamento de erros gracefully

## 8. Paginação
- Componente `components/pagination.tsx` reutilizável com `PAGE_SIZE=12`
- Aplicado em 8 listas: admin questões, treinamentos, histórico desempenho, medcoins extrato, desafios clínicos, ranking, desempenho histórico

## 9. Shuffle Refatorado
- Função `shuffle()` extraída de 4 arquivos para `lib/utils.ts` usando Fisher-Yates (eliminou duplicação)

## 10. Navegação Mobile
- Já existia via hamburger + Sheet em `DashboardHeader` — apenas verificado

## 11. Server Components
- Páginas do dashboard já eram Server Components — apenas verificado

## 12. Service Worker (Offline)
- `public/sw.js` — intercepta requests de rede, cache de assets estáticos, fallback offline
- `components/service-worker-registration.tsx` — registro no `app/layout.tsx`

## 13. In-App Notifications
- `lib/notifications.ts` — helpers CRUD + tipo `Notification`
- `components/notifications-panel.tsx` — ícone de sino com Popover, badge com contador, realtime via Supabase
- `migration_notifications.sql` (já executado no Supabase)
- Notificações de teste injetadas

## 14. Race Condition Fix no Timer
- `simulado-player.tsx`: dois timers rodam simultaneamente (geral + por questão)
- **Problema:** `confirmAnswer` era chamada via `useEffect` em `questionTimeLeft === 0` mas não estava no array de deps → closure stale
- **Solução:** `useRef` para `pendingAnswerRef`, `currentIndexRef` — o timer lê valores atuais sem depender de closures

## 15. Analytics de Comportamento do Usuário
- `migration_analytics.sql` (já executado)
- `lib/analytics.ts` — `trackEvent()`, `getAnalytics()`, `getResumoAnalytics()`
- Tracking em 6 eventos: `simulado_iniciado`, `simulado_finalizado`, `treino_iniciado`, `treino_finalizado`, `desafio_finalizado`, `flashcard_revisado`
- `components/admin-analytics-content.tsx` — dashboard com KPIs (usuários, ativos 7d, simulados, questões)
- `app/admin/analytics/page.tsx` + link no admin sidebar

## 16. Limpeza
- Migrations SQL (`migration_notifications.sql`, `migration_analytics.sql`) deletados após execução

## 17. Login Google/Apple — PKCE Flow + Server-Side Auth
- **Problema original:** Login Google retornava erro "não foi possível acessar o site"
- **Causa raiz:** Supabase usava flow implícito (tokens no hash fragment `#access_token=`), invisível pro servidor
- **Solução completa:**
  - `lib/supabase.ts`: configurado `flowType: 'pkce'` + `detectSessionInUrl: true`
  - `app/auth/callback/route.ts`: server-side callback que recebe `?code=`, troca por sessão via `exchangeCodeForSession()`, seta cookies com `secure: true`
  - `middleware.ts`: reativado com `@supabase/ssr` — valida sessão server-side via `getUser()`
  - `components/login-form.tsx`: `redirectTo` aponta para `/auth/callback`
  - Pacote `@supabase/ssr` instalado para cookie-based session management
- **Supabase Dashboard:** Redirect URL configurada como `https://med-class-one.vercel.app/auth/callback`

---

## Commits Realizados
```
c038d1e  fix: ativar PKCE flow + middleware server-side auth
b1cc1d0  fix: middleware desabilitado - flow implicito nao permite protecao server-side
0d5fbb9  fix: login Google funcional - middleware reativado + limpeza
9409b65  fix: auth callback como pagina client-side para flow implicito
e7f62ab  debug: middleware desabilitado + callback simplificado
e4e1cd5  debug: auth callback redireciona para /api/debug-auth
b5d854c  fix: auth callback com secure cookies + middleware async
336d6ea  fix: corrigir login Google OAuth - criar auth callback route
e68fb39  fix: auth callback com secure cookies + middleware async com getUser
5f90c64  feat: edicao + pagination + admin edicao
de71553  feat: raca condition fix + analytics
263fc8d  feat: middleware + error boundaries + service worker
32d2181  feat: notifications + mobile nav + shuffle refactor
4f1a83d  feat: analytics de comportamento do usuario
40db3c2  chore: remover migrations SQL ja executadas
89922e4  docs: historico completo da conversa para referencia futura
7fe69e5  docs: resumo da sessao para envio ao claude
```

## Arquivos Chave Criados/Modificados
| Arquivo | Função |
|---------|--------|
| `middleware.ts` | Route protection server-side via @supabase/ssr |
| `app/auth/callback/route.ts` | Server-side OAuth callback (PKCE exchangeCodeForSession) |
| `lib/supabase.ts` | Cliente Supabase com PKCE flow |
| `lib/analytics.ts` | Tracking de eventos |
| `lib/utils.ts` | `cn()` + `shuffle()` |
| `lib/notifications.ts` | CRUD de notificações |
| `lib/quiz-config.ts` | AREAS, EDICOES |
| `public/sw.js` | Service Worker offline |
| `components/pagination.tsx` | Paginação reutilizável |
| `components/notifications-panel.tsx` | sino + badge + realtime |
| `components/service-worker-registration.tsx` | registro SW |
| `components/admin-analytics-content.tsx` | dashboard analytics |
| `components/simulado-player.tsx` | timers, comments, tracking |
| `components/practice-launcher.tsx` | filtro edição, tracking |
| `components/admin-questoes-content.tsx` | rewrite completo |

## Variáveis de Ambiente (Vercel)
| Variável | Uso |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave admin (imports, API routes) |
| `ADMIN_EMAILS` | Emails de admin separados por vírgula |

## Pacotes NPM Adicionais
| Pacote | Uso |
|--------|-----|
| `@supabase/ssr` | Cookie-based session management para middleware + callback server-side |

## Banco de Dados (Tabelas Principais)
- `questoes` — 95 questões REVALIDA 2024/1 com campos `edicao`, `opcoes_comentario`, `comentario`
- `simulados` — simulados/treinos criados por usuários
- `simulado_attempts` — tentativas individuais
- `user_analytics` — eventos de comportamento
- `user_notifications` — notificações in-app
- `profiles` — perfis de usuário
