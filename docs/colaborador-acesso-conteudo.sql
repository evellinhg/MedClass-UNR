-- Rode isso no SQL Editor do Supabase (projeto MedClass UNR).
-- Da acesso de escrita aos colaboradores (profiles.role = 'colaborador')
-- nas tabelas de CONTEUDO (flashcards, videoaulas, resumos, desafios
-- clinicos, trilhas), igual ao acesso que ja existia para admins via
-- o array fixo de emails -- sem tocar em usuarios, pagamentos/medcoins
-- ou paginas de analytics/relatorios/depoimentos, que continuam
-- restritas a admin (email) apenas.
--
-- A tabela public.questoes ja tinha esse padrao (profiles.role = ANY
-- (ARRAY['admin','colaborador'])) -- essas 8 tabelas + o bucket de
-- videoaulas estavam faltando, entao um colaborador so conseguia
-- realmente ESCREVER em Banco de Questoes; as outras paginas
-- ficariam com "Erro ao salvar" por causa da RLS mesmo se a UI
-- deixasse ele navegar ate la.

alter policy "cronograma_trilhas_admin_write" on public.cronograma_trilhas
  using (
    ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text]))
    OR (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) AND (profiles.access_expires_at IS NULL OR profiles.access_expires_at > now()) ))
  )
  with check (
    ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text]))
    OR (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) AND (profiles.access_expires_at IS NULL OR profiles.access_expires_at > now()) ))
  );

alter policy "cronograma_trilhas_select" on public.cronograma_trilhas
  using (
    ((ativo = true) OR ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text])))
    OR (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) ))
  );

alter policy "desafios_clinicos_admin_write" on public.desafios_clinicos
  using (
    ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text]))
    OR (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) AND (profiles.access_expires_at IS NULL OR profiles.access_expires_at > now()) ))
  )
  with check (
    ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text]))
    OR (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) AND (profiles.access_expires_at IS NULL OR profiles.access_expires_at > now()) ))
  );

alter policy "desafios_clinicos_select" on public.desafios_clinicos
  using (
    ((ativo = true) OR ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text])))
    OR (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) ))
  );

alter policy "desafios_clinicos_perguntas_admin_write" on public.desafios_clinicos_perguntas
  using (
    ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text]))
    OR (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) AND (profiles.access_expires_at IS NULL OR profiles.access_expires_at > now()) ))
  )
  with check (
    ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text]))
    OR (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) AND (profiles.access_expires_at IS NULL OR profiles.access_expires_at > now()) ))
  );

alter policy "desafios_clinicos_perguntas_select" on public.desafios_clinicos_perguntas
  using (
    ((EXISTS ( SELECT 1 FROM desafios_clinicos d WHERE ((d.id = desafios_clinicos_perguntas.desafio_id) AND (d.ativo = true)))) OR ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text])))
    OR (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) ))
  );

alter policy "materiais_flashcard_decks_admin_write" on public.materiais_flashcard_decks
  using (
    ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text]))
    OR (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) AND (profiles.access_expires_at IS NULL OR profiles.access_expires_at > now()) ))
  )
  with check (
    ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text]))
    OR (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) AND (profiles.access_expires_at IS NULL OR profiles.access_expires_at > now()) ))
  );

alter policy "materiais_flashcard_decks_select" on public.materiais_flashcard_decks
  using (
    ((ativo = true) OR ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text])))
    OR (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) ))
  );

alter policy "materiais_flashcards_admin_write" on public.materiais_flashcards
  using (
    ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text]))
    OR (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) AND (profiles.access_expires_at IS NULL OR profiles.access_expires_at > now()) ))
  )
  with check (
    ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text]))
    OR (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) AND (profiles.access_expires_at IS NULL OR profiles.access_expires_at > now()) ))
  );

alter policy "materiais_flashcards_select" on public.materiais_flashcards
  using (
    ((EXISTS ( SELECT 1 FROM materiais_flashcard_decks d WHERE ((d.id = materiais_flashcards.deck_id) AND (d.ativo = true)))) OR ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text])))
    OR (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) ))
  );

alter policy "materiais_resumos_admin_write" on public.materiais_resumos
  using (
    ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text]))
    OR (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) AND (profiles.access_expires_at IS NULL OR profiles.access_expires_at > now()) ))
  )
  with check (
    ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text]))
    OR (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) AND (profiles.access_expires_at IS NULL OR profiles.access_expires_at > now()) ))
  );

alter policy "materiais_resumos_select" on public.materiais_resumos
  using (
    ((ativo = true) OR ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text])))
    OR (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) ))
  );

alter policy "materiais_videoaulas_admin_write" on public.materiais_videoaulas
  using (
    ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text]))
    OR (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) AND (profiles.access_expires_at IS NULL OR profiles.access_expires_at > now()) ))
  )
  with check (
    ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text]))
    OR (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) AND (profiles.access_expires_at IS NULL OR profiles.access_expires_at > now()) ))
  );

alter policy "materiais_videoaulas_select" on public.materiais_videoaulas
  using (
    ((ativo = true) OR ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text])))
    OR (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) ))
  );

alter policy "materiais_videoaulas_arquivos_admin_write" on public.materiais_videoaulas_arquivos
  using (
    ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text]))
    OR (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) AND (profiles.access_expires_at IS NULL OR profiles.access_expires_at > now()) ))
  )
  with check (
    ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text]))
    OR (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) AND (profiles.access_expires_at IS NULL OR profiles.access_expires_at > now()) ))
  );

-- Bucket de upload de videoaulas proprias (storage.objects)
alter policy "videoaulas_arquivos_admin_insert" on storage.objects
  with check (
    ((bucket_id = 'videoaulas-arquivos'::text) AND ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text])))
    OR (bucket_id = 'videoaulas-arquivos'::text AND EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) AND (profiles.access_expires_at IS NULL OR profiles.access_expires_at > now()) ))
  );

alter policy "videoaulas_arquivos_admin_delete" on storage.objects
  using (
    ((bucket_id = 'videoaulas-arquivos'::text) AND ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text])))
    OR (bucket_id = 'videoaulas-arquivos'::text AND EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) AND (profiles.access_expires_at IS NULL OR profiles.access_expires_at > now()) ))
  );
