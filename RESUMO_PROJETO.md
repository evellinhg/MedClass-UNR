# MedClass UNR — Resumo do Projeto

_Última atualização: 29/07/2026_

## A ideia

Nova plataforma de estudos, **independente** do MedClass Teórico e do MedClass Prático, focada em alunos de Medicina da **Universidade Nacional de Rosário (UNR)**, Argentina. Público-alvo bilíngue:

- **Alunos brasileiros** que foram estudar medicina na UNR (mesmo modelo de negócio do Teórico/Prático, adaptado).
- **Alunos hispanofalantes** (argentinos e outros latino-americanos) que estudam lá.

Recursos principais: resumos completos por cátedra, banco de questões (sempre em espanhol — nunca traduzido), videoaulas, flashcards, cronograma de estudos. Objetivo: ajudar o aluno a passar nos parciais e finais do ciclo básico e clínico.

Identidade visual: verde neon (`#c6ff3a` / `#84cc16`) sobre fundo cinza-esverdeado escuro (`#12140f`), inspirada em [revalidasimulado.com](https://revalidasimulado.com/). Substituiu o roxo/índigo do MedClass original. **Sem alternância de tema claro/escuro** — só existe um tema fixo.

## Infraestrutura

| Item | Valor |
|---|---|
| Pasta local | `/Users/Evelllin/Desktop/MedClass UNR` |
| Origem do código | Cópia do MedClass Teórico (mesma stack Next.js/Supabase) |
| GitHub | `github.com/evellinhg/MedClass-UNR` (conta separada, `evellinhg`) |
| Supabase | Projeto novo, ref `zimplxuoxigbexfemqkd` |
| Deploy | Vercel — `med-class-unr2026.vercel.app` |
| Google OAuth | Reaproveita o mesmo Client OAuth do MedClass original (Client ID `11218223865-...`), com o redirect URI do Supabase novo adicionado |

**Atenção**: o GitHub Desktop do usuário estava logado como `leoozimalves2` mas o repo é da conta `evellinhg` — isso já causou um erro de "fork" uma vez. Confirmar sempre qual conta está ativa antes de pedir push.

## O que já foi feito

1. **Duplicação e independência do projeto**
   - Pasta duplicada do Teórico, remote do git repontado para `evellinhg/MedClass-UNR`, push feito e confirmado.
   - `.env.local` apontando para o Supabase novo.

2. **Banco de dados**
   - Schema completo (28 tabelas, 59 políticas RLS, 7 functions, trigger `on_auth_user_created`) extraído do Teórico via script Node (`pg` direto, sem Docker/pg_dump) e aplicado no projeto novo. **Sem dados de usuários reais copiados**, só estrutura.

3. **Landing page (pública, `/`)**
   - Reescrita do zero com copy bilíngue PT/ES completo: Hero, Dor (seção nova, `pain-section.tsx`), Solução/Features, Como Funciona, Depoimentos (fictícios, como pedido), Planos, FAQ (seção nova, `faq-section.tsx`), Footer.
   - Seletor de idioma PT/ES no navbar (bandeiras), com persistência em `localStorage`.
   - `QuizDemo` removido da página (perguntas do demo só existiam em português, fora de escopo por ora — arquivo ainda existe em `components/quiz-demo.tsx`, só não está sendo renderizado).
   - Preços definidos: **ES** — Mensal $6.000 ARS / Trimestral $15.000 ARS (pagamento por transferência CBU/ALIAS). **PT** — Mensal R$19,90 / Trimestral R$49,90 (pagamento por Pix).

4. **Rebrand visual (site inteiro)**
   - Todo roxo/índigo (`#8b5cf6`, `#6366f1`, `indigo-*`, `violet-*`, `purple-*` usados como cor de marca) trocado por verde neon, incluindo botão gradient, cards, badges, glows.
   - **Paletas semânticas preservadas de propósito** (não são cor de marca, são categorização): `lib/area-colors.ts` (cor por especialidade médica), `lib/difficulty-colors.ts` (cor por dificuldade), `lib/conquistas-types.ts` (raridade de medalha), `lib/desafio-icons.ts` (variedade decorativa de capas), e os arrays de cor rotativa em `home-stats.tsx`/`admin-overview-content.tsx`/`cronograma-content.tsx`.
   - Tema único cinza-esverdeado fixo: `next-themes`/`ThemeProvider`/`ThemeToggle` removidos por completo (arquivos deletados). `app/globals.css` consolidado numa paleta só (mantida também sob `.dark` para não quebrar utilitários `dark:*` usados em vários componentes — `<html>` recebe `class="dark"` estática).

5. **Login com Google**
   - Testado de ponta a ponta (redirect correto pro domínio de produção, sem erro de configuração).

6. **Tradução do dashboard logado (em andamento, escopo: só telas do aluno, admin fica só em português por ora)**
   - `LanguageProvider` movido do `app/page.tsx` para o layout raiz (`app/layout.tsx`) — agora `useLanguage()` funciona em qualquer página, incluindo dashboard e admin.
   - `lib/navigation.ts` convertido de array estático para função `getNavigation(t)`.
   - **Já traduzidos**: menu lateral completo (`sidebar-nav.tsx`), cabeçalho do dashboard (`dashboard-header.tsx` — saudação, busca, menu mobile), página inicial do dashboard (`app/dashboard/page.tsx` — títulos de seção), `home-stats.tsx` (4 cards de métricas), `action-cards.tsx` (2 cards "Praticar Agora"/"Criar Simulado" — de brinde, corrigiu outro gradiente roxo que tinha escapado do rebrand, `#7c3aed`/`#4338ca` → verde-esmeralda).

## Pendências para continuar

### Tradução do dashboard (prioridade combinada com o usuário)
Faltam, na mesma página inicial do dashboard:
- `components/daily-tip-header.tsx`
- `components/desempenho-widget.tsx`
- `components/ranking-widget.tsx`
- `components/medcoins-widget.tsx`

E as demais páginas do aluno (fora a home):
- `/dashboard/cronograma` (`cronograma-content.tsx` — grande, tem busca de parceiro, calendário, trilhas)
- `/dashboard/materiais` (`materiais-content.tsx` + `resumos-grid.tsx` + `videoaulas-grid.tsx` + flashcards)
- `/dashboard/desempenho/*` (histórico e estatísticas)
- Possivelmente `/dashboard/simulados`, `/dashboard/desafios-clinicos`, `/dashboard/ranking`, `/dashboard/medcoins`, `/dashboard/conquistas` — não entraram na lista original combinada, confirmar com o usuário se entram no escopo "telas do aluno".

**Importante, confirmado pelo usuário**: as perguntas do banco de questões (conteúdo do banco de dados) ficam **sempre em espanhol**, nunca traduzidas. Só a interface (menus, botões, títulos, mensagens) é que deve ficar bilíngue.

### Outras pendências conhecidas
- `QuizDemo` (demo interativo na landing) tem perguntas fixas só em português — decidir se traduz para reativar na landing, ou deixa desativado.
- Confirmar visualmente o dashboard logado com uma conta real (não foi possível screenshot autenticado nesta sessão — só o login foi confirmado via automação).
- `lib/phase-urls.ts` (conceito de "Primeira Fase"/"Segunda Fase" do MedClass original) foi removido do navbar/pricing da landing por não fazer sentido num produto standalone — não deve ser reintroduzido.
- Configurar PWA (manifest, ícones) — ficou combinado no início do projeto, ainda não foi feito.
- App mobile (decisão anterior: começar com PWA, não app nativo).

## Convenções e decisões importantes (não repetir perguntas já respondidas)

- **Nunca** misturar código do MedClass UNR com o do Teórico/Prático — projeto e repositório totalmente independentes.
- **Nunca** copiar dados de alunos reais entre os Supabases — só estrutura (schema).
- Push para o GitHub: usuário faz manualmente (GitHub Desktop, conta `evellinhg`) — Claude não tem permissão de escrita direta no repo.
- Preços e forma de pagamento por idioma já definidos (ver tabela acima) — não perguntar de novo.
- Público bilíngue confirmado — não é "escolher um idioma", é PT **e** ES desde o início.
