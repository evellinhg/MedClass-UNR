-- Rode isso no SQL Editor do Supabase (projeto MedClass UNR).
-- Público-alvo do aviso ao enviar: quem recebe a notificação em
-- public.notifications quando o admin clica em "Enviar" no painel
-- /admin/avisos. Guardado na própria linha do aviso pra manter
-- histórico de pra quem cada comunicado foi mandado.
--
-- Valores: 'todas' | 'premium' (mensal + trimestral) | 'vip' |
-- 'colaboradores' | 'gratis'

alter table public.avisos_conteudo
  add column if not exists destino text not null default 'todas';
