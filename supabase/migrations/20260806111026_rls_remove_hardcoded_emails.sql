-- Rodado direto no SQL Editor do Supabase (projeto MedClass UNR) em 2026-08-06.
--
-- Contexto: uma auditoria de segurança encontrou 42 políticas de RLS (em
-- avisos_conteudo, cronograma_trilhas(+etapas/unidades), desafios_clinicos
-- (+historico/perguntas), materiais_flashcard_decks/materiais_flashcards,
-- materiais_resumos, materiais_videoaulas(+arquivos), medcoins_config/ledger/
-- medalhas/redemptions, simulados, depoimentos e o bucket videoaulas-arquivos
-- em storage.objects) com uma cláusula hardcoded checando o e-mail de login
-- direto (auth.jwt() ->> 'email') contra os 3 e-mails fundadores. Essa
-- cláusula ignorava profiles.role e profiles.access_expires_at -- ou seja,
-- mesmo que uma dessas contas fosse rebaixada/expirada via profiles.role,
-- ela manteria acesso de escrita permanente via RLS. Também expunha as 3
-- contas a virarem alvo: comprometer só o e-mail (fora do app) já bastava
-- pra escrever no banco.
--
-- Pré-requisito rodado antes disso: profiles.role da conta
-- leonardoac.alves2@gmail.com estava 'aluno' (com access_expires_at futuro,
-- usada pra testar como aluno) -- foi promovida pra 'admin' com
-- access_expires_at = null antes de remover o fallback por e-mail, senão
-- essa conta perderia acesso ao painel admin.
--
-- A migração troca a cláusula de e-mail por uma checagem de
-- profiles.role = 'admin' (com access_expires_at válido) via um DO block
-- que faz o replace() do texto exato da cláusula em qual/with_check de
-- toda policy que batia com '%leonardoac%' ou '%medclassunr%', e falha
-- (raise exception, sem aplicar nada por ser uma única transação) se algum
-- texto não bater com o esperado -- não é preciso rodar de novo, já foi
-- aplicado e verificado (0 políticas remanescentes com e-mail hardcoded).
-- Mantido aqui só como registro/histórico da migração.
--
-- Ponto importante pra manutenção futura: dar/tirar admin de alguém agora
-- é só mudar profiles.role (já dá pra fazer isso no painel Admin > Usuários,
-- PATCH /api/admin/users/[id]) -- não precisa mais editar nenhuma lista de
-- e-mail no banco. A lista ADMIN_EMAILS em lib/admin-config.ts continua
-- existindo como fallback só na camada de aplicação (rotas /api/admin/** e
-- o gate client-side do painel), não afeta mais o RLS.

do $$
declare
  r record;
  email_check text := $e$(auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text])$e$;
  role_check text := $r$EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin' AND (profiles.access_expires_at IS NULL OR profiles.access_expires_at > now()) )$r$;
  new_qual text;
  new_check text;
  n int := 0;
begin
  for r in
    select schemaname, tablename, policyname, cmd, qual, with_check
    from pg_policies
    where qual ilike '%leonardoac%' or with_check ilike '%leonardoac%'
       or qual ilike '%medclassunr%' or with_check ilike '%medclassunr%'
  loop
    new_qual := case when r.qual is not null then replace(r.qual, email_check, role_check) else null end;
    new_check := case when r.with_check is not null then replace(r.with_check, email_check, role_check) else null end;

    if new_qual is not null and (new_qual ilike '%leonardoac%' or new_qual ilike '%medclassunr%') then
      raise exception 'substring nao encontrada em qual: %.% %', r.tablename, r.policyname, r.qual;
    end if;
    if new_check is not null and (new_check ilike '%leonardoac%' or new_check ilike '%medclassunr%') then
      raise exception 'substring nao encontrada em with_check: %.% %', r.tablename, r.policyname, r.with_check;
    end if;

    if r.qual is not null and r.with_check is not null then
      execute format('alter policy %I on %I.%I using (%s) with check (%s)', r.policyname, r.schemaname, r.tablename, new_qual, new_check);
    elsif r.qual is not null then
      execute format('alter policy %I on %I.%I using (%s)', r.policyname, r.schemaname, r.tablename, new_qual);
    elsif r.with_check is not null then
      execute format('alter policy %I on %I.%I with check (%s)', r.policyname, r.schemaname, r.tablename, new_check);
    end if;
    n := n + 1;
  end loop;
  raise notice 'total policies updated: %', n;
end $$;
