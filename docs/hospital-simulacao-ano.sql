-- Rode isso no SQL Editor do Supabase (projeto MedClass UNR).
-- Ano do curso ao qual o caso do Hospital Simulação pertence (chave
-- canônica ano4/ano5, igual ao resto do currículo -- ver ANO_KEYS em
-- lib/unr-curriculum.ts). Usado para separar os casos em abas por ano
-- na grade de Hospital Simulação.

alter table public.hospital_simulacao_casos
  add column if not exists ano text;
