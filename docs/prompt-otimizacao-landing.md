# PROMPT — Otimização de performance da landing page MedClass UNR (mobile)

Contexto: Projeto Next.js 16.1.6 (App Router). A landing page (`app/page.tsx`) está com **demora muito grande ao abrir** e **travando o layout no celular** durante o scroll. Já analisei o código e encontrei as causas abaixo. **Corrija TODOS os pontos na ordem de prioridade indicada.** Não mude design/cores/estilo visual — apenas performance e código.

## 1. [URGENTE — causa da demora] Consulta ao Supabase sem limite

Arquivo: `components/quiz-demo.tsx` (linhas ~45-49)

- O `QuizDemo` faz `supabase.from("questoes").select(...).eq("ativo", true)` sem `.limit()` nem paginação, baixando o banco inteiro de questões a cada visita à página.
- Correção: buscar apenas `DEMO_QUESTION_COUNT` (5) questões, usando `.limit()`. Idealmente usar o cache existente em `lib/questoes-cache.ts` (`getCachedQuestoesAtivas` / `setCachedQuestoesAtivas`), que já foi criado para isso e hoje não é usado. Se o cache não for viável, aplique `.limit(5)` na query.

## 2. [URGENTE — causa do travamento no scroll] Blur gigante em composição de GPU

Arquivos: `components/ambient-background.tsx`, `components/hero.tsx`, `components/quiz-demo.tsx`, `components/pwa-install-section.tsx`

- `ambient-background.tsx` cria 3 círculos de 448–576px com `blur-[100px]`/`blur-[120px]`, e é renderizado **duas vezes** na página (Hero e QuizDemo). Filtros `blur` em elementos grandes forçam recomposição cara a cada frame de scroll no mobile → layout congela.
- Correção: substituir o blur pesado por efeitos baratos (gradientes estáticos / `radial-gradient`, sombras `box-shadow` grandes com opacidade baixa) OU usar `will-change: transform` corretamente e limitar o tamanho/quantidade. Eliminar os `backdrop-blur-sm` que não sejam essenciais (navbar, cards do quiz). Também remover/ajustar os `blur-3xl` de `pwa-install-section.tsx:41-42`.
- Obs.: as classes `animate-blob-1/2/3` usadas no `ambient-background.tsx` **não existem no CSS** (código morto). Ou remova as classes, ou se a animação for desejada, defina os `@keyframes` e faça com `transform` (GPU) e blur pequeno.

## 3. [ALTA] JavaScript client pesado

- `components/study-dashboard.tsx` (renderizado dentro do `Hero`) importa **recharts**, que é pesado (~100KB+) e só serve para um gráfico decorativo. Corrija: (a) fazer lazy-load do `StudyDashboard` com `next/dynamic` + `ssr: false` apenas no Hero, ou (b) substituir o gráfico recharts por SVG/CSS simples (o gráfico é estático com dados fixos `evolution`). Se mantiver recharts, importe apenas `AreaChart` de `recharts` (tree-shaking).
- Reduzir o uso de framer-motion onde for decorativo: os `whileInView` já usam `viewport={{ once: true }}` (ok), mas evite `AnimatePresence`/`motion` desnecessários nas seções que ficam abaixo da dobra.

## 4. [ALTA] Imagens PNG pesadas

- `components/navbar.tsx:35-42` carrega `/logo.png` (260KB PNG) com `priority`. O diretório `public/` tem logos de até 819KB (`logomednovo.png` 804KB, `logo-original.png` 653KB, `logo-icon.png` 549KB, `logofundoescuro.png` 523KB).
- Correção: converter os logos usados na landing para WebP/AVIF comprimidos, ou usar `next/image` com `sizes` adequado. Garantir que a navbar não baixe 260KB para renderizar um logo de 40px de altura.

## 5. [MÉDIA] Carregamento das seções abaixo da dobra

- As seções da landing (`app/page.tsx`: PainSection, Features, HowItWorks, QuizDemo, PwaInstallSection, Testimonials, Pricing, FaqSection, Footer) carregam tudo de uma vez, incluindo `DepoimentoForm` (que importa componentes Radix `Dialog`, `Select`) dentro de `Testimonials`.
- Correção: lazy-load com `next/dynamic` as seções abaixo da dobra (pelo menos a partir de `HowItWorks`), e carregar `DepoimentoForm` dinamicamente ou só abrir o Dialog sob demanda (já é Dialog, então remova imports pesados do bundle inicial se possível).

## Regras

- Não alterar o design, as cores nem os textos (PT/ES).
- Manter a acessibilidade e o comportamento atual (instalação PWA, idioma, quiz funcional).
- Após corrigir, rode `npm run lint` e `npm run build` e confirme que passam.
- Teste o resultado em viewport mobile (largura 390px, throttling de rede lenta) e confirme que a página abre rápido e o scroll não trava.
