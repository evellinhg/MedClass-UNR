-- Rode isso no SQL Editor do Supabase (projeto MedClass UNR).
-- Cor neon escolhida pelo admin para classificar visualmente cada
-- videoaula/playlist na página de Materiais > Videoaulas.

alter table public.materiais_videoaulas
  add column if not exists cor_hex text;
