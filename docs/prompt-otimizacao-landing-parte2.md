# PROMPT — Verificação e correção do que falta na otimização da landing (mobile)

Contexto: Você já aplicou várias otimizações na landing page MedClass UNR (Next.js 16.1.6): quiz demo com questões fixas, lazy-load das seções, `StudyDashboard` com `next/dynamic`, remoção do `backdrop-blur` do cabeçalho. O usuário relatou que **no celular o site continua lento e travando durante o scroll, mas no computador está normal**. Verifiquei o código e estes pontos **NÃO foram corrigidos** — são exatamente os que mais pesam em GPU/CPU de celular. Corrija-os agora, sem alterar design, cores ou textos:

## 1. [URGENTE] Blur gigante em `components/ambient-background.tsx` (não foi alterado)

- O componente ainda tem 3 círculos de 448–576px com `blur-[100px]`/`blur-[120px]` (linhas 4–6) e é renderizado **2 vezes** na página (Hero e QuizDemo). Em celular, `blur` em elemento grande recomposita a tela a cada frame de scroll → trava o layout.
- Correção: troque os círculos com `blur-[100px]`/`blur-[120px]` por efeitos baratos equivalentes: gradientes `radial-gradient` estáticos (via `backgroundImage` inline) ou `box-shadow` grandes com opacidade muito baixa, sem `filter: blur`. Não renderize `AmbientBackground` no `QuizDemo` (ele já entra em cena abaixo da dobra) — se mantiver, reduza a quantidade/tamanho.
- As classes `animate-blob-1/2/3` **não têm `@keyframes` no CSS** (código morto). Remova as classes, ou se quiser a animação, defina os keyframes usando apenas `transform`/`opacity` (GPU) com blur pequeno ou sem blur.

## 2. [ALTA] `blur-3xl` restante em `components/pwa-install-section.tsx`

- Linhas 41–42: dois círculos de 288px com `blur-3xl`. Substitua por gradiente estático ou sombra, como no item 1.

## 3. [ALTA] Carrossel em loop no `components/study-dashboard.tsx`

- Linhas ~397–402: `setInterval` de 6000ms troca os slides para sempre enquanto o componente está visível, remontando `AnimatePresence` + gráfico recharts a cada troca (trabalho constante no celular).
- Correção: (a) usar `IntersectionObserver` para pausar o carrossel quando o dashboard estiver fora da viewport e (b) não auto-rotacionar em telas pequenas (mobile) — manter apenas a navegação manual pelos botões laterais. Se mantiver o gráfico, considere substituí-lo por SVG estático.

## 4. [MÉDIA] Logo pesado no `components/navbar.tsx`

- Linha ~36: `/logo.png` (260KB PNG) com `priority`. Converta para WebP/AVIF comprimido ou ajuste `sizes`/`quality` do `next/image` para não baixar 260KB para um logo de 40px.

## 5. [MÉDIA] `backdrop-blur-sm` restante no Hero

- `components/hero.tsx` (badge, linha ~59) ainda usa `backdrop-blur-sm`. Remova ou substitua por fundo sólido translúcido (`bg-white/10`) sem filtro.

## 6. [VERIFICAÇÃO] Confirme que o deploy em produção está atualizado

- Informe ao usuário como confirmar no Vercel que o deploy mais recente (após todos os commits de otimização) está `Ready`, ou cheque se o quiz demo na produção já mostra as 9 questões fixas (sem o spinner "Carregando...").

## Regras

- Não alterar design, cores ou textos (PT/ES).
- Manter comportamento PWA, idioma e quiz funcionais.
- Após corrigir: rode `npm run lint` e `npm run build`; confirme que passam.
- Teste em viewport 390px com throttling de rede lenta: página deve abrir rápido e o scroll **não** travar.
