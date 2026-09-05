## Sobre esta pasta

Os arquivos de `20260728115013_...` até `20260828184640_...` são **cópias**
do histórico que já existia solto em `docs/*.sql`, reorganizadas aqui em
ordem cronológica (data do primeiro commit de cada arquivo original) para
dar um formato de migration numerada. Os originais em `docs/` **não foram
removidos** — vários são referenciados pelo nome em `RESUMO_PROJETO.md` e
`docs/SCALABILITY-OPTIMIZATIONS.md` ao contar a história de bugs/decisões
específicas, e continuam sendo a versão citada por essa documentação.

A partir de `20260905000000_...` (inclusive), os arquivos aqui são a
**fonte canônica** — mudanças de schema novas devem virar só um arquivo
novo aqui (`YYYYMMDDHHMMSS_descricao.sql`), sem duplicar em `docs/`.

Não há Supabase CLI linkado a este projeto ainda, então nenhum arquivo
aqui é executado automaticamente — todos precisam ser rodados manualmente
no SQL Editor do Supabase. Isso vale tanto para os históricos (já foram
aplicados quando foram escritos, esta pasta é só o registro reorganizado)
quanto para os novos.
