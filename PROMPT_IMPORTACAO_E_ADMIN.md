# Prompt para o Claude — Importar Questões Classificadas + Editar Admin Panel

Cole o conteúdo abaixo inteiro no Claude:

---

## INÍCIO DO PROMPT

---

Você é o desenvolvedor que criou a plataforma MedClass Teórico. Preciso que você faça 3 tarefas:

---

## TAREFA 1: Rodar migration no Supabase

Execute o SQL do arquivo `migration_questoes_novos_campos.sql` no SQL Editor do Supabase para adicionar os novos campos:

- `edicao` (text) — ex: "2024.1"
- `opcoes_comentario` (text[]) — comentário para cada alternativa

---

## TAREFA 2: Importar questões classificadas

O arquivo `revalida_2024_1_classificado.json` foi gerado com todas as 95 questões do REVALIDA 2024/1 já classificadas com:
- Área médica
- Matéria/tema
- Tags
- Dificuldade
- Justificativa geral
- Comentários para CADA alternativa
- Edição: "2024.1"

Crie um script Python `importar_questoes_classificadas.py` que:

1. Leia o arquivo `revalida_2024_1_classificado.json`
2. Conecte ao Supabase usando as credenciais do `.env.local`
3. Para cada questão, insira na tabela `questoes` com TODOS os campos:
   ```json
   {
     "enunciado": "...",
     "opcoes": ["A", "B", "C", "D"],
     "indice_correta": 0,
     "area": "Clínica Médica",
     "materia": "Infecção Urinária",
     "tags": ["infeccao-urinaria", "clinica-medica"],
     "dificuldade": "fácil",
     "justificativa": "✅ Parabéns! A resposta correta é A...",
     "opcoes_comentario": ["Comentário A", "Comentário B", "Comentário C", "Comentário D"],
     "edicao": "2024.1",
     "prova": "REVALIDA",
     "ativo": true
   }
   ```
4. Verifique duplicatas antes de inserir (comparando os primeiros 100 caracteres do enunciado)
5. Insira em lotes de 10
6. Gere um relatório no final

Rode o script após criá-lo.

---

## TAREFA 3: Editar o SimuladoPlayer para mostrar comentários

O componente `components/simulado-player.tsx` precisa ser atualizado para mostrar os comentários das alternativas ao aluno após ele responder a questão.

### O que deve acontecer:

1. **Após o aluno responder** (clicar em uma alternativa e confirmar), mostrar imediatamente:
   - Se acertou: mensagem de parabéns em verde
   - Se errou: mensagem de "Não foi dessa vez" em vermelho
   - A alternativa correta destacada em verde
   - A alternativa que o aluno escolheu (se errou) destacada em vermelho

2. **Logo abaixo**, mostrar os **comentários de cada alternativa**:
   - Cada alternativa com seu comentário (se existir)
   - A correta com ícone ✅ e fundo verde claro
   - As erradas com ícone ❌ e fundo vermelho claro
   - Texto do comentário embaixo de cada uma

3. **Se houver justificativa geral**, mostrar numa seção separada abaixo dos comentários

### Como buscar os dados:

O campo `opcoes_comentario` está na mesma tabela `questoes`. Quando o SimuladoPlayer busca as questões do simulado, ele já busca todos os dados. Basta usar `questao.opcoes_comentario` e `questao.justificativa`.

### Layout sugerido (após resposta):

```
✅ Parabéns! Você acertou!
(Sou ou Não foi dessa vez...)

┌─────────────────────────────────────────┐
│ ✅ A: ITU baixa; iniciar nitrofurantoína│
│    → Correto! A nitrofurantoína é...    │
├─────────────────────────────────────────┤
│ ❌ B: ITU alta; norfloxacino            │
│    → Incorreto. Norfloxacina é para...  │
├─────────────────────────────────────────┤
│ ❌ C: ITU por S. aureus                 │
│    → Incorreto. Não há dados que...     │
├─────────────────────────────────────────┤
│ ❌ D: Nefrolitíase complicada           │
│    → Incorreto. O quadro não sugere...  │
└─────────────────────────────────────────┘

Justificativa: A ITU baixa (cistite) é a hipótese mais provável...
```

### Importante:

- Os comentários só aparecem **APÓS** o aluno responder (não antes)
- Em modo simulado (estrito), os comentários podem aparecer apenas no review final
- Em modo estudo, aparecem imediatamente após cada resposta
- Mantenha o estilo visual existente do projeto (usando as classes do Tailwind)
- Não remova nenhuma funcionalidade existente

---

## INSTRUÇÕES GERAIS

1. Faça uma tarefa por vez e teste antes de ir para a próxima
2. Rode `npm run build` no final para garantir que não quebrou nada
3. Mantenha o estilo de código existente
4. Não remova funcionalidades existentes
5. Commit após cada tarefa

---

## FIM DO PROMPT
