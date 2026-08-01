-- Rode isso no SQL Editor do Supabase (projeto MedClass UNR).
-- Nota de 1 a 5 estrelas que acompanha o depoimento (avaliação da
-- plataforma), exibida junto do comentário quando aprovado.

alter table public.depoimentos
  add column if not exists nota int check (nota between 1 and 5);
