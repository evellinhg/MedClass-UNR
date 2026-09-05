-- Rode isso no SQL Editor do Supabase (projeto MedClass UNR).
-- Fonte/canal de origem de cada videoaula ou playlist, para separar
-- visualmente o conteúdo do canal oficial da Facultad de Ciencias
-- Médicas – UNR de conteúdo de outros canais educacionais (ex: ALDE).

alter table public.materiais_videoaulas
  add column if not exists fonte text not null default 'unr';
