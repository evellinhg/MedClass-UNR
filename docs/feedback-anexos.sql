-- Rode isso no SQL Editor do Supabase (projeto MedClass UNR).
-- Bucket privado para anexos de feedback (imagens, vídeos, documentos) +
-- colunas na tabela feedbacks + RLS de storage (dono do arquivo ou admin).

insert into storage.buckets (id, name, public, file_size_limit)
values ('feedback-anexos', 'feedback-anexos', false, 52428800) -- 50MB, teto do plano Free do Supabase
on conflict (id) do update set file_size_limit = excluded.file_size_limit;

alter table public.feedbacks
  add column if not exists anexo_path text,
  add column if not exists anexo_nome text,
  add column if not exists anexo_tipo text;

create policy "usuarios enviam seus proprios anexos de feedback"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'feedback-anexos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "usuarios veem seus proprios anexos de feedback ou admin ve todos"
on storage.objects for select
to authenticated
using (
  bucket_id = 'feedback-anexos'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
);

create policy "usuarios apagam seus proprios anexos de feedback"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'feedback-anexos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
