-- Rode isso no SQL Editor do Supabase (projeto MedClass UNR).
-- Nota de corte personalizável por aluno (padrão 60%). Usada para decidir
-- "aprovado/reprovado" em simulados, casos clínicos e na tela de
-- desempenho -- NÃO afeta o desbloqueio de casos clínicos em sequência
-- (lib/desafio-clinico-bloqueio.ts), que continua fixo em 60% por ser uma
-- regra de progressão de conteúdo, não uma meta pessoal.
--
-- A policy "Users can update their own profile" (docs/avatar-perfil.sql)
-- já cobre update dessa coluna também, não precisa de policy nova.

alter table public.profiles add column if not exists nota_corte numeric not null default 60;
