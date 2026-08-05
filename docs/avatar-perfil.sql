-- Rode isso no SQL Editor do Supabase (projeto MedClass UNR).
-- Foto de perfil do aluno: coluna nova em profiles + bucket de storage.
-- O botão "Alterar Foto" em /dashboard/perfil não tinha nenhuma lógica por
-- trás (nem coluna, nem bucket, nem upload) -- isso cria a base pra ele
-- funcionar de verdade.

alter table public.profiles add column if not exists avatar_url text;

-- Não existia NENHUMA policy de update para o próprio usuário em profiles
-- (só "Admins can update all profiles") -- por isso o update do avatar_url
-- (e também o botão "Salvar Alterações" de nome/nota de corte) falhava
-- silenciosamente por RLS, mesmo com o front-end certo.
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Bucket público (a foto de perfil não é sensível) com upload restrito:
-- cada usuário só pode escrever dentro da própria pasta (<user_id>/...),
-- diferente do bucket de depoimentos-fotos que é aberto pra qualquer um.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatares', 'avatares', true, 2097152, array['image/png', 'image/jpeg'])
on conflict (id) do update set
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = array['image/png', 'image/jpeg'];

drop policy if exists "Aluno envia a propria foto de perfil" on storage.objects;
create policy "Aluno envia a propria foto de perfil"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatares' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Aluno atualiza a propria foto de perfil" on storage.objects;
create policy "Aluno atualiza a propria foto de perfil"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatares' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Aluno remove a propria foto de perfil" on storage.objects;
create policy "Aluno remove a propria foto de perfil"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatares' and (storage.foldername(name))[1] = auth.uid()::text);
