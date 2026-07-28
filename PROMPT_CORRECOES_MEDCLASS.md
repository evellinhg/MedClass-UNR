# Prompt para Correção do MedClass Teórico

Cole o conteúdo abaixo inteiro no Claude para que ele corrija os problemas encontrados:

---

## INÍCIO DO PROMPT

---

Você é o desenvolvedor que criou do zero a plataforma **MedClass Teórico**, um site de treinamento para o Revalida INEP feito com Next.js 16 + Supabase. O projeto está na pasta `/Users/Evelllin/Desktop/MedClass Teorico`.

Foi feita uma análise técnica completa do projeto e foram encontrados os problemas listados abaixo. Preciso que você corrija **todos eles**, um por um, seguindo a ordem de prioridade. Após cada correção, rode `npm run build` para garantir que não quebrou nada.

---

## CONTEXTO DO PROJETO

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **UI:** Tailwind CSS v4 + shadcn/ui + Framer Motion + Recharts
- **Backend:** Supabase (PostgreSQL + Auth)
- **Deploy:** Vercel
- **Banco:** ~22 tabelas no Supabase
- **Auth:** Email/senha + Google OAuth + Apple OAuth via Supabase Auth
- **Modelo de rotas:** App Router com pastas `app/`, `components/`, `lib/`, `hooks/`

---

## PRIORIDADE ALTA (Corrigir primeiro)

### 1. Criar middleware.ts para proteção de rotas

**Problema:** Atualmente, todas as verificações de autenticação e plano acontecem no lado do cliente (client-side). Um usuário não autenticado pode acessar `/dashboard` e `/admin` antes do JavaScript rodar. Não existe nenhum arquivo `middleware.ts` no projeto.

**O que fazer:**

1. Crie o arquivo `middleware.ts` na raiz do projeto (junto de `next.config.mjs`, `tsconfig.json`, etc.)

2. O middleware deve:
   - Rodar em **todas as rotas** que comecem com `/dashboard` e `/admin`
   - Extrair o cookie de sessão do Supabase (`sb-*-auth-token` ou usar `supabase.auth.getSession()` via `createServerClient` do `@supabase/ssr`)
   - Se **não houver sessão válida**, redirecionar para `/login`
   - Se houver sessão, deixar passar

3. Para as rotas `/admin`, o middleware deve **adicionalmente** verificar se o email do usuário está na lista de admins (use a variável de ambiente `ADMIN_EMAILS` que será criada no passo 2)

4. Instale se necessário: `npm install @supabase/ssr`

5. Use o padrão do Supabase SSR para Next.js middleware:
   ```ts
   import { createServerClient } from '@supabase/ssr'
   ```

6. O matcher do middleware deve incluir:
   ```ts
   export const config = {
     matcher: ['/dashboard/:path*', '/admin/:path*']
   }
   ```

**Importante:** O middleware não deve bloquear rotas públicas como `/`, `/login`, `/api/auth/*`.

---

### 2. Mover emails de admin para variável de ambiente

**Problema:** Os emails dos administradores estão hardcoded no arquivo `lib/admin-config.ts`. Isso é inflexível e inseguro.

**O que fazer:**

1. Adicione no arquivo `.env.local`:
   ```
   ADMIN_EMAILS=leonardoac.alves@gmail.com,leonardoac.alves2@gmail.com
   ```

2. Atualize `lib/admin-config.ts` para ler de `process.env.ADMIN_EMAILS`:
   ```ts
   export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
     .split(',')
     .map(e => e.trim())
     .filter(Boolean)
   ```

3. Verifique se todos os arquivos que importam `ADMIN_EMAILS` continuam funcionando (provavelmente `admin-layout.tsx`, `require-admin.ts`, e possivelmente `lib/admin-config.ts`).

---

### 3. Remover ignoreBuildErrors e corrigir erros de TypeScript

**Problema:** No arquivo `next.config.mjs`, a configuração `typescript: { ignoreBuildErrors: true }` esconde todos os erros de tipo durante o build. Isso pode causar bugs difíceis de diagnosticar.

**O que fazer:**

1. Abra `next.config.mjs` e remova a linha `typescript: { ignoreBuildErrors: true }`

2. Rode `npm run build` anote **todos** os erros de TypeScript que aparecerem

3. Corrija **cada erro** individualmente. Os erros mais prováveis são:
   - Variáveis que podem ser `null` mas estão sendo usadas direto (adicione `?.` ou verificação)
   - Propriedades que não existem em tipos (corrija o tipo ou use casting)
   - Parâmetros de função com tipos errados (ajuste a chamada ou o tipo)
   - Imports de tipos que não existem (corrija o path ou crie o tipo)

4. Rode `npm run build` novamente até não ter **nenhum erro**

5. Se algum erro for muito complexo e você não conseguir resolver, comente qual é e por que não conseguiu, mas **não volte a colocar ignoreBuildErrors**.

---

### 4. Implementar navegação mobile (menu hamburger)

**Problema:** No mobile, a sidebar do dashboard está escondida (`hidden lg:block`) mas não tem nenhuma alternativa de navegação. O usuário fica preso na página que abriu.

**O que fazer:**

1. Identifique o componente que renderiza a sidebar no mobile (provavelmente `components/dashboard-layout.tsx` ou `components/sidebar-nav.tsx`)

2. Adicione um **botão hamburger** (ícone ☰) que apareça apenas no mobile (`lg:hidden`)

3. Ao clicar no hamburger, abra um **menu lateral deslizante** (drawer) que:
   - Desliza da esquerda
   - Tem o fundo escurecido (overlay) por trás
   - Contém todos os itens de navegação da sidebar
   - Fecha ao clicar no overlay ou num link
   - Usa animação suave (pode usar Framer Motion ou CSS transition)

4. Existem duas abordagens:
   - **Opção A (recomendada):** Use o componente `Sheet` do shadcn/ui (já instalado). Ele faz exatamente um drawer lateral.
   - **Opção B:** Use o componente `vaul` (Drawer) que já está no projeto.

5. O botão hamburger deve ficar no `DashboardHeader` ou no topo da página mobile.

6. Teste em diferentes tamanhos de tela para garantir que funciona.

---

## PRIORIDADE MÉDIA (Corrigir depois)

### 5. Implementar Error Boundaries

**Problema:** Quando uma busca ao Supabase falha, os componentes mostram estado vazio sem explicação. O usuário não sabe se não tem dados ou se deu erro.

**O que fazer:**

1. Crie um componente `ErrorBoundary` em `components/error-boundary.tsx`:
   ```tsx
   "use client"
   // Componente que captura erros de seus filhos e mostra mensagem amigável
   // Deve ter: mensagem de erro, botão de tentar novamente
   ```

2. Crie também um componente `ErrorFallback` que mostre:
   - Ícone de erro
   - Mensagem "Algo deu errado"
   - Botão "Tentar novamente" que recarrega a página ou reseta o estado

3. Envolva os componentes principais do dashboard com o ErrorBoundary:
   - `SimuladoPlayer`
   - `DesempenhoEstatisticasContent`
   - `DesempenhoHistoricoContent`
   - `MateriaisContent`
   - `FlashcardDeckViewer`
   - `DesafioClinicoEstudoContent`
   - `SimuladosContent`
   - `CronogramaContent`
   - `RankingContent`
   - `MedCoinsContent`
   - `ConquistasContent`

4. Para componentes que fazem fetch de dados, adicione tratamento de erro nos `useEffect` ou `fetch`:
   ```ts
   try {
     const { data, error } = await supabase.from('tabela').select('*')
     if (error) throw error
     setData(data)
   } catch (err) {
     setError(err.message || 'Erro ao carregar dados')
   } finally {
     setLoading(false)
   }
   ```

---

### 6. Adicionar paginação nas listas

**Problema:** Listas de usuários, questões, extrato MedCoins e feedback carregam todos os itens de uma vez sem paginação.

**O que fazer:**

1. Identifique os componentes que renderizam listas:
   - `admin-usuarios-content.tsx` — lista de usuários
   - `admin-questoes-content.tsx` — banco de questões
   - `medcoins-content.tsx` — extrato de transações
   - `feedback-content.tsx` — feedback dos alunos
   - `admin-desafios-content.tsx` — desafios clínicos
   - `admin-trilhas-content.tsx` — trilhas
   - `admin-videoaulas-content.tsx` — videoaulas
   - `admin-resumos-content.tsx` — resumos
   - `admin-flashcards-content.tsx` — flashcards

2. Para cada lista, implemente paginação:
   - Use o componente `Pagination` do shadcn/ui (se existir) ou crie um simples com botões "Anterior", "Próximo", e números de página
   - Cada página deve carregar no máximo **20 itens**
   - Use `supabase.from('tabela').select('*').range((page - 1) * 20, page * 20 - 1)`
   - Mostre o total de itens (use `.select('*', { count: 'exact', head: true })` para contar)

3. Adicione um seletor de "Itens por página" (10, 20, 50) nas listas do admin.

---

### 7. Extrair função shuffle duplicada

**Problema:** A função que embaralha arrays está duplicada em 4 arquivos: `simulado-player.tsx`, `practice-launcher.tsx`, `simulados-content.tsx`, `trilha-ativa-content.tsx`.

**O que fazer:**

1. Adicione no arquivo `lib/utils.ts` (já existe):
   ```ts
   export function shuffleArray<T>(array: T[]): T[] {
     const shuffled = [...array]
     for (let i = shuffled.length - 1; i > 0; i--) {
       const j = Math.floor(Math.random() * (i + 1));
       [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
     }
     return shuffled
   }
   ```

2. Nos 4 arquivos listados, **remova** a definição local da função `shuffle` e **importe** de `lib/utils`:
   ```ts
   import { shuffleArray } from '@/lib/utils'
   ```

3. Renomeie as chamadas de `shuffle(...)` para `shuffleArray(...)` em cada arquivo.

4. Verifique se há mais duplicatas com `grep -r "function shuffle" --include="*.tsx" --include="*.ts"` e corrija todas.

---

### 8. Renomear supabase.js para supabase.ts com tipos

**Problema:** O arquivo `lib/supabase.js` é o único JavaScript puro do projeto, sem verificação de tipos.

**O que fazer:**

1. Renomeie `lib/supabase.js` para `lib/supabase.ts`

2. Adicione os tipos corretos:
   ```ts
   import { createClient } from '@supabase/supabase-js'
   import type { Database } from '@/types/supabase' // se existir, ou crie um tipo básico

   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
   const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

   export const supabase = createClient(supabaseUrl, supabaseAnonKey)
   ```

3. Se não existir um tipo `Database`, crie em `lib/supabase-types.ts` com as principais tabelas:
   ```ts
   export interface Database {
     public: {
       Tables: {
         profiles: { Row: { id: string; email: string; full_name: string; plan: string; status: string; /* ... */ } }
         questoes: { Row: { id: string; enunciado: string; opcoes: string[]; indice_correta: number; /* ... */ } }
         simulados: { Row: { id: string; user_id: string; nome: string; /* ... */ } }
         // ... outras tabelas
       }
     }
   }
   ```

4. Atualize todos os imports de `@/lib/supabase` (devem ser os mesmos) — como o nome do arquivo não muda (só a extensão), os imports devem continuar funcionando.

5. Verifique com `grep -r "from.*supabase" --include="*.tsx" --include="*.ts" lib/ components/` se há imports que precisam ser ajustados.

---

### 9. Implementar sistema de notificações in-app

**Problema:** O usuário não recebe nenhum aviso sobre novidades, conquistas desbloqueadas, ou respostas ao feedback.

**O que fazer:**

1. Crie uma tabela no Supabase:
   ```sql
   create table notifications (
     id uuid default gen_random_uuid() primary key,
     user_id uuid references auth.users(id) not null,
     titulo text not null,
     mensagem text not null,
     lida boolean default false,
     tipo text not null, -- 'conquista', 'feedback', 'plano', 'sistema'
     link text, -- para onde o clique leva
     created_at timestamp with time zone default now()
   );

   -- RLS: usuário só vê suas próprias notificações
   alter table notifications enable row level security;
   create policy "Users see own notifications" on notifications
     for all using (auth.uid() = user_id);
   ```

2. Crie o componente `components/notifications-bell.tsx`:
   - Ícone de sino (Bell do lucide-react)
   - Badge com número de não-lidas
   - Ao clicar, abre um popover/dropdown com a lista de notificações
   - Marcar como lida ao clicar
   - "Marcar todas como lidas"
   - Link para a página relevante

3. Adicione o `NotificationsBell` no `DashboardHeader` ao lado do theme toggle

4. Crie uma função utilitário `lib/notifications.ts`:
   ```ts
   export async function criarNotificacao(userId: string, titulo: string, mensagem: string, tipo: string, link?: string) { ... }
   export async function buscarNotificacoes(userId: string) { ... }
   export async function marcarComoLida(notificationId: string) { ... }
   export async function marcarTodasComoLidas(userId: string) { ... }
   ```

5. Onde gerar notificações automaticamente:
   - Ao desbloquear conquista: notificar com link para `/dashboard/conquistas`
   - Ao receber resposta no feedback: notificar com link para `/dashboard/feedback`
   - Quando o trial estiver acabando (faltam 2 dias): notificar sobre planos

---

## PRIORIDADE BAIXA (Melhorias futuras — apenas se sobrar tempo)

### 10. Refatorar timers do SimuladoPlayer

**Problema:** No `components/simulado-player.tsx`, existem dois temporizadores (geral e por questão) que causam race conditions. O código já tem `eslint-disable` para silenciar o alerta.

**O que fazer:**

1. Identifique todos os `useEffect` que lidam com timer no `simulado-player.tsx`

2. Unifique a fonte de tempo:
   - Use um único `useRef` para o timestamp de início (`startTimeRef`)
   - Calcule o tempo restante em vez de armazenar em state (`timeLeft`)
   - Use `setInterval` de 1 segundo para atualizar apenas a **exibição** do timer, não o estado

3. Para o timer por questão:
   - Salve o timestamp quando a questão atual foi carregada
   - Calcule `timePerQuestion - (Date.now() - questionStartTime)`
   - Quando chegar a 0, avance automaticamente

4. Remova o `eslint-disable` e garanta que não há dependências faltando nos arrays

---

### 11. Remover dados mockados de performance-content.tsx

**Problema:** O arquivo `components/performance-content.tsx` contém dados hardcoded/mockados (evolução, top matérias, questões erradas) em vez de buscar do banco.

**O que fazer:**

1. Verifique se `performance-content.tsx` é uma página ativa ou se foi substituída por `desempenho-estatisticas-content.tsx`

2. Se for uma página ativa, remova todos os dados mockados e implemente queries reais ao Supabase

3. Se for uma página legada/obsoleta, remova o arquivo e todas as referências a ele

---

### 12. Adicionar paginação infinita ou scroll nos extratos

**Problema:** Listas muito longas (extrato MedCoins, histórico de tentativas) carregam tudo de uma vez.

**O que fazer:**

1. Para listas com muitos dados, use scroll infinito:
   - Detecte quando o usuário chegou ao final da lista (IntersectionObserver ou `onScroll`)
   - Carregue a próxima página de dados
   - Anexe ao final da lista existente

2. Ou use paginação simples com "Carregar mais" button

---

### 13. Adicionar analytics de comportamento do usuário

**Problema:** Só existe Vercel Analytics para pageviews. Não há tracking de ações específicas.

**O que fazer:**

1. Crie um utilitário `lib/analytics.ts`:
   ```ts
   export function trackEvent(event: string, properties?: Record<string, any>) {
     // Enviar para Vercel Analytics ou Supabase
     console.log('Event:', event, properties)
   }
   ```

2. Adicione tracking nos pontos-chave:
   - Início de simulado: `trackEvent('simulado_started', { mode, area, quantity })`
   - Fim de simulado: `trackEvent('simulado_completed', { score, duration })`
   - Questão respondida: `trackEvent('question_answered', { correct, timeSpent })`
   - Simulado abandonado: `trackEvent('simulado_abandoned', { progress })`
   - Flashcard estudado: `trackEvent('flashcard_studied', { deckId, rating })`

---

## CHECKLIST FINAL

Após fazer todas as correções, verifique:

- [ ] `npm run build` roda sem erros
- [ ] `npm run lint` roda sem erros (ou com warnings aceitáveis)
- [ ] Middleware protege `/dashboard` e `/admin` — teste abrindo em aba anônima
- [ ] Admin emails lidos de `.env.local`, não hardcoded
- [ ] Menu hamburger funciona no mobile (teste com DevTools > responsivo)
- [ ] Error Boundary aparece quando Supabase retorna erro
- [ ] Listas do admin têm paginação
- [ ] Função `shuffle` está em apenas 1 lugar (`lib/utils.ts`)
- [ ] `lib/supabase.ts` tem tipos
- [ ] Notificações aparecem no sino no header

---

## INSTRUÇÕES IMPORTANTES

1. **Faça uma correção por vez** e teste antes de ir para a próxima
2. **Não quebre funcionalidades existentes** — cada correção deve ser backward-compatible
3. **Commit após cada correção** significativa para poder reverter se necessário
4. **Se um erro de TypeScript for muito complexo**, documente mas não volte a colocar ignoreBuildErrors
5. **Prefira usar componentes do shadcn/ui** que já existem no projeto ao invés de criar do zero
6. **Mantenha o estilo de código existente** — se o projeto usa `const` ao invés de `function`, continue assim
7. **Rode `npm run build` no final** para garantir que tudo compila

---

## FIM DO PROMPT
