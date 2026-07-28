# Prompt para Classificação e Geração de Justificativas — REVALIDA 2024/1

Cole o conteúdo abaixo inteiro no Claude:

---

## INÍCIO DO PROMPT

---

Você é um professor de medicina e especialista em provas de revalidação. Preciso que você processe as 95 questões do REVALIDA 2024/1 e gere um arquivo JSON completo com classificação e justificativas.

## CONTEXTO

O projeto MedClass Teórico é uma plataforma de treinamento para o Revalida INEP. A tabela `questoes` do banco de dados tem os seguintes campos relevantes:

- `enunciado` — texto da questão (JÁ PREENCHIDO)
- `opcoes` — array com as 4 alternativas A, B, C, D (JÁ PREENCHIDO)
- `indice_correta` — índice da alternativa correta (0=A, 1=B, 2=C, 3=D) (JÁ PREENCHIDO)
- `area` — área médica (UMA DAS 5 OPÇÕES ABAIXO)
- `materia` — tema específico da questão
- `tags` — palavras-chave para busca
- `dificuldade` — fácil, médio ou difícil
- `justificativa` — explicação de por que a resposta correta está certa
- `opcoes_comentario` — array de objetos com comentário para CADA alternativa
- `edicao` — edição da prova (ex: "2024.1")
- `prova` — "REVALIDA"
- `ativo` — true

## ÁREAS MÉDICAS (USE APENAS ESTAS 5)

1. **Pediatria** — neonatologia, doenças infantis, vacinação, desenvolvimento
2. **Ginecologia e Obstetrícia** — pré-natal, parto, ginecologia, anticoncepção
3. **Cirurgia** — trauma, queimadura, cirurgia geral, urologia, ortopedia
4. **Clínica Médica** — cardiologia, pneumologia, gastroenterologia, neurologia, infectologia, nefrologia, endocrinologia, hematologia, reumatologia, dermatologia, oftalmologia, otorrinolaringologia, psiquiatria
5. **Medicina da Família e Comunidade** — APS, SUS, epidemiologia, saúde pública, prevenção, vacinação em saúde coletiva

## ARQUIVO DE ENTRADA

O arquivo `revalida_2024_1_questoes.json` contém as 100 questões (95 válidas + 5 anuladas). Cada questão tem:
```json
{
  "1": {
    "enunciado": "texto...",
    "alternativas": [
      {"letra": "A", "texto": "texto da alternativa"},
      {"letra": "B", "texto": "..."},
      {"letra": "C", "texto": "..."},
      {"letra": "D", "texto": "..."}
    ]
  }
}
```

O arquivo `revalida_2024_1_gabarito.json` contém o gabarito:
```json
{
  "1": 0,    // A é a correta (índice 0)
  "2": 0,    // A é a correta
  "3": 2,    // C é a correta
  ...
  "7": null  // anulada
}
```

## O QUE VOCÊ DEVE FAZER

Para CADA uma das 95 questões válidas (onde o gabarito não é null), gere:

### 1. Classificação da Área
Classifique em UMA das 5 áreas listadas acima. Use seu julgamento médico baseado no conteúdo do enunciado.

### 2. Matéria/Tema Principal
Identifique o tema específico. Exemplos:
- "Infecção Urinária" (não apenas "Urologia")
- "Pré-natal de Alto Risco" (não apenas "Obstetrícia")
- "Convulsão Febril" (não apenas "Pediatria")
- "Parada Cardíaca" (não apenas "Emergência")

### 3. Tags (3 a 5 tags por questão)
Gere tags relevantes para busca. Exemplo:
Para uma questão sobre ITU em gestante:
`["infeccao-urinaria", "gestacao", "antibioticoterapia", "clinica-medica", "obstetricia"]`

### 4. Dificuldade
Estime com base no conteúdo:
- **fácil** — conceitos básicos, condutas padrão, conhecimento geral
- **médio** — requer raciocínio clínico, combinação de informações
- **difícil** — casos complexos, exames específicos, condutas não óbvias

### 5. Justificativa da Resposta Correta
Escreva uma explicação clara e didática de por que a alternativa correta está certa. Comece com "✅ Parabéns! A resposta correta é [letra]. " e explique o raciocínio médico.

### 6. Comentários para CADA Alternativa
Para cada uma das 4 alternativas (A, B, C, D), escreva um curto comentário explicando:
- Se é a correta: confirme e reforce o raciocínio
- Se está errada: explique POR QUE está errada (qual o erro conceitual, qual seria a situação em que poderia ser válida, etc.)

Formato do comentário:
- **A (correta):** "✅ Correto! [explicação]"
- **A (errada):** "❌ Incorreto. [explicação do erro]"

### 7. Edição
Todas devem ter `edicao: "2024.1"`

## FORMATO DE SAÍDA

Gere um ÚNICO arquivo JSON com este formato:

```json
{
  "questoes_classificadas": [
    {
      "numero": 1,
      "enunciado": "...",
      "opcoes": ["...", "...", "...", "..."],
      "indice_correta": 0,
      "area": "Clínica Médica",
      "materia": "Infecção Urinária",
      "tags": ["infeccao-urinaria", "antibioticoterapia", "clinica-medica"],
      "dificuldade": "fácil",
      "justificativa": "✅ Parabéns! A resposta correta é A. A ITU baixa (cistite) é a hipótese mais provável...",
      "opcoes_comentario": [
        "✅ Correto! A nitrofurantoína é o antibiótico de primeira linha para ITU baixa não complicada...",
        "❌ Incorreto. A norfloxacina é indicada para ITU alta ou complicada, não para ITU simples...",
        "❌ Incorreto. Não há dados que sugiram infecção por S. aureus...",
        "❌ Incorreto. A nefrolitíase não se enquadra no quadro clínico descrito..."
      ],
      "edicao": "2024.1",
      "prova": "REVALIDA",
      "ativo": true
    }
  ],
  "resumo": {
    "total": 95,
    "por_area": {
      "Pediatria": 0,
      "Ginecologia e Obstetrícia": 0,
      "Cirurgia": 0,
      "Clínica Médica": 0,
      "Medicina da Família e Comunidade": 0
    },
    "por_dificuldade": {
      "fácil": 0,
      "médio": 0,
      "difícil": 0
    }
  }
}
```

## INSTRUÇÕES IMPORTANTES

1. **Processe TODAS as 95 questões válidas** — não pule nenhuma
2. **As justificativas devem ser didáticas** — imagine que um estudante está lendo para aprender
3. **Os comentários das alternativas erradas devem ser específicos** — não diga apenas "está errado", explique o erro
4. **Use linguagem médica acessível** — technically correct mas compreensível
5. **Se uma questão tiver referência a imagem/exame** que não está disponível, mencione no enunciado: "[Nota: esta questão originalmente continha imagem/exame que não pôde ser extraída]"
6. **O output deve ser JSON válido** — sem vírgulas extras, sem aspas duplas escapadas incorretamente
7. **Salve o arquivo como:** `revalida_2024_1_classificado.json`

## FIM DO PROMPT
