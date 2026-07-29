"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export type Lang = "pt" | "es"

const pt = {
  nav: {
    links: {
      inicio: "Início",
      plataforma: "Recursos",
      comoFunciona: "Como funciona",
      depoimentos: "Depoimentos",
      planos: "Planos",
      faq: "Dúvidas",
    },
    entrar: "Entrar",
  },
  dashboardNav: {
    inicio: "Início",
    cronograma: "Cronograma",
    materiais: "Materiais",
    videoaulas: "Videoaulas",
    resumos: "Resumos",
    flashcards: "Flashcards",
    treinamentos: "Treinamentos",
    desempenho: "Desempenho",
    historico: "Histórico",
    estatisticas: "Estatísticas",
    desafiosClinicos: "Desafios Clínicos",
    estudar: "Estudar",
    ranking: "Ranking",
    medcoins: "MedCoins",
    lojaMedcoins: "Loja MedCoins",
    extrato: "Extrato",
    conquistas: "Conquistas",
    feedback: "Feedback",
    painelAdmin: "Painel Admin",
    sair: "Sair",
    minhaConta: "Minha conta",
    carregando: "Carregando...",
    planoMensal: "Plano Mensal",
    planoTrimestral: "Plano Trimestral",
    planoExpirado: "Plano expirado",
    planoGratuito: "Plano gratuito",
    administrador: "Administrador",
    testeGratis: "Teste grátis",
    horasRestantes: "restantes",
    recursoExclusivo: "Recurso exclusivo dos planos pagos",
    navegacaoPrincipal: "Navegação principal",
    abrirMenu: "Abrir menu",
    menuNavegacao: "Menu de navegação",
    bemVindoDeVolta: "Bem-vindo de volta",
    continueProgresso: "Continue seu progresso nos estudos.",
    seuProgresso: "Seu Progresso",
    oQueFazerAgora: "O Que Fazer Agora",
  },
  homeStats: {
    taxaAcerto: "Taxa de Acerto",
    questoesFeitas: "Questões Feitas",
    tempoDeEstudo: "Tempo de Estudo",
    simuladosSemana: "Simulados Esta Semana",
  },
  actionCards: {
    praticarTitulo: "Praticar Agora",
    praticarDescricao: "Resolva questões selecionadas para consolidar seu aprendizado.",
    praticarCta: "Iniciar sessão",
    criarTitulo: "Criar Simulado",
    criarDescricao: "Monte um simulado personalizado com as matérias que precisa estudar.",
    criarCta: "Criar novo",
  },
  dailyTip: {
    label: "Dica do dia",
  },
  desempenhoWidget: {
    titulo: "Seu Desempenho",
    verEstatisticas: "Ver estatísticas",
    carregando: "Carregando...",
    vazio: "Você ainda não resolveu nenhum simulado. Que tal começar agora?",
    aproveitamento: "Aproveitamento",
    questoesFeitas: "Questões feitas",
    pontos: "Pontos",
  },
  rankingWidget: {
    titulo: "Ranking",
    verCompleto: "Ver completo",
    carregando: "Carregando...",
    vazio: "Ninguém pontuou ainda. Resolva um simulado para aparecer aqui!",
    voce: "Você",
    suaPosicao: "Sua posição",
  },
  medcoinsWidget: {
    verExtrato: "Ver extrato",
    carregando: "Carregando...",
    saldoDisponivel: "Saldo disponível",
    acumuladosNoTotal: "acumulados no total",
  },
  cronograma: {
    // Rótulos de exibição por chave canônica (chave é sempre a mesma nos dois
    // idiomas — é o que fica salvo no banco — só o texto mostrado muda).
    diasSemanaLabel: { mon: "Seg", tue: "Ter", wed: "Qua", thu: "Qui", fri: "Sex", sat: "Sáb", sun: "Dom" } as Record<string, string>,
    localeData: "pt-BR",
    carregando: "Carregando cronograma...",
    trilhasTitulo: "Trilhas da equipe MedClass",
    trilhasSubtitulo: "Siga uma trilha de treinamento montada pela equipe, em vez de criar seu próprio cronograma.",
    entrarTrilhaConfirm: (nome: string) =>
      `Entrar na trilha "${nome}"? Ela vai substituir sua rotina pessoal enquanto você a seguir.`,
    entrarTrilhaErro: "Não foi possível entrar na trilha",
    entrar: "Entrar",
    criarRotinaTitulo: "Criar Rotina de Estudo",
    area: "Área",
    horario: "Horário",
    questoesPorSessao: "Questões por sessão",
    diasDaSemana: "Dias da Semana",
    adicionarRotina: "Adicionar Rotina",
    erroSalvarRotina: "Erro ao salvar rotina",
    rotinasCadastradas: "Rotinas Cadastradas",
    nenhumaRotina: "Nenhuma rotina cadastrada ainda.",
    questoesPorSessaoLabel: "questões/sessão",
    proximasSessoes: "Próximas sessões",
    nenhumaSessao: "Nenhuma sessão agendada.",
  },
  planRestricted: {
    verPlanos: "Ver planos disponíveis",
    materiaisTitulo: "Materiais é exclusivo dos planos pagos",
    materiaisDescricao: "Videoaulas, resumos e flashcards ficam disponíveis para quem assina o plano mensal ou trimestral. Escolha um plano para desbloquear.",
  },
  materiais: {
    carregando: "Carregando...",
    videoaulas: "Videoaulas",
    resumos: "Resumos",
    flashcards: "Flashcards",
    tituloPagina: "Materiais",
    subtituloPagina: "Acesse suas videoaulas, resumos e flashcards",
  },
  resumosGrid: {
    carregando: "Carregando...",
    vazio: "Nenhum resumo disponível no momento.",
    secoes: "seções",
  },
  videoaulasGrid: {
    carregando: "Carregando...",
    vazio: "Nenhuma videoaula disponível no momento.",
  },
  flashcardsGrid: {
    carregando: "Carregando...",
    vazio: "Nenhum baralho de flashcards disponível no momento.",
    concluido: "Concluído",
    cartoes: "cartões",
    respondidos: "respondidos",
  },
  hero: {
    badge: "Feito para alunos de Medicina da UNR",
    headline: "Pare de se afogar em apostilas. Comece a passar em Rosário.",
    subheadline:
      "Resumos completos, banco de questões e videoaulas alinhados ao currículo da UNR — para você chegar em cada parcial e final com confiança, não com pânico.",
    motivational: "Feito por quem entende a rotina de estudar medicina longe de casa.",
    ctaPrimary: "Quero estudar com o MedClass UNR",
    ctaSecondary: "Ver como funciona",
    socialProofStrong: "Conteúdo pensado para a UNR",
    socialProof: "do ciclo básico ao clínico, sem lacunas",
  },
  pain: {
    badge: "A real",
    titleLead: "Estudar medicina longe de casa já é difícil.",
    titleHighlight: "Fazer isso sem material organizado, é surreal.",
    subtitle: "Se alguma dessas situações parece familiar, você não está sozinho — e não precisa continuar assim.",
    items: [
      {
        title: "Conteúdo em espanhol, cabeça em português",
        description: "Traduzir apostila enquanto tenta entender a fisiopatologia rouba tempo e energia que você não tem sobrando.",
      },
      {
        title: "Os parciais não esperam por você",
        description: "O calendário da UNR não perdoa. Você mal termina de estudar uma matéria e a próxima prova já está batendo na porta.",
      },
      {
        title: "Material espalhado, ninguém organiza pra você",
        description: "PDF de colega, grupo de WhatsApp, resumo incompleto de anos anteriores. Você perde mais tempo procurando material do que estudando de fato.",
      },
      {
        title: "Sozinho num país diferente, sem suporte real",
        description: "Sem alguém que entenda o que é ser aluno brasileiro na UNR, é fácil se sentir perdido — e isso pesa tanto quanto o conteúdo da prova.",
      },
    ],
    closing: "Você não precisa continuar estudando assim.",
  },
  features: {
    badge: "A solução",
    titleLead: "Tudo que você precisa para passar,",
    titleHighlight: "em um só lugar",
    subtitle: "Criado especificamente para o currículo da UNR — do ciclo básico ao clínico.",
    items: [
      { title: "Resumos Completos do Currículo UNR", description: "Direto ao ponto, organizados por matéria e por cátedra, para você estudar exatamente o que cai na sua prova." },
      { title: "Banco de Questões para Praticar", description: "Centenas de questões estilo parcial e final, com correção comentada, para você treinar até dominar cada tema." },
      { title: "Videoaulas Didáticas e Objetivas", description: "Aulas curtas e diretas ao ponto, para revisar um tema complicado em minutos, não em horas." },
      { title: "Ciclo Básico e Clínico, sem lacunas", description: "De Anatomia e Fisiologia até as matérias clínicas, todo o material que você precisa numa jornada só." },
      { title: "Feito por quem entende a rotina da UNR", description: "Conteúdo pensado para a realidade do aluno brasileiro estudando fora, não uma tradução genérica de apostila." },
      { title: "Estude no seu ritmo, onde estiver", description: "Acesse pelo computador ou celular, entre uma aula e outra, na biblioteca ou em casa." },
    ],
  },
  howItWorks: {
    badge: "Como funciona",
    titleLead: "Comece a estudar em",
    titleHighlight: "3 passos simples",
    subtitle: "Sem enrolação: escolha, estude e acompanhe sua evolução.",
    steps: [
      { title: "Escolha seu plano", description: "Assine o MedClass UNR e libere acesso completo à plataforma em poucos minutos." },
      { title: "Encontre sua matéria", description: "Busque por cátedra, tema ou período e chegue direto no resumo, na videoaula ou nas questões que precisa." },
      { title: "Estude, pratique e revise", description: "Alterne entre resumo, questões e videoaula até o conteúdo realmente grudar." },
      { title: "Chegue confiante na prova", description: "Acompanhe seu progresso por matéria e saiba exatamente onde reforçar antes de cada parcial." },
    ],
  },
  testimonials: {
    badge: "Depoimentos",
    titleLead: "Alunos da UNR que já estão",
    titleHighlight: "estudando diferente",
    subtitle: "Depoimentos ilustrativos — em breve, histórias reais de quem já usa o MedClass UNR.",
    items: [
      {
        quote:
          "Antes eu perdia horas traduzindo apostila em espanhol. Com os resumos do MedClass UNR, cortei esse tempo pela metade e ainda entendi melhor o conteúdo.",
        author: "Ana Beatriz",
        role: "4º ano, Medicina UNR",
      },
      {
        quote:
          "As questões comentadas foram o que mais me ajudou na parcial de Fisiologia. Consegui identificar exatamente onde eu errava e corrigir antes da prova.",
        author: "Rafael Nogueira",
        role: "2º ano, Medicina UNR",
      },
      {
        quote:
          "Finalmente um material que entende que sou brasileiro estudando na Argentina. Fez toda diferença na minha rotina de estudos.",
        author: "Camila Duarte",
        role: "3º ano, Medicina UNR",
      },
    ],
  },
  pricing: {
    badge: "Planos",
    titleLead: "Um investimento simples",
    titleHighlight: "para não travar em nenhuma prova",
    subtitle: "Cancele quando quiser, sem letras miúdas.",
    paymentNote: "Pagamento via Pix.",
    plans: [
      {
        name: "Plano Mensal",
        price: "R$ 19,90",
        period: "/mês",
        description: "Para quem quer testar a plataforma.",
        features: [
          "Acesso a todos os resumos do currículo UNR",
          "Banco de questões completo com correção comentada",
          "Videoaulas de todas as matérias",
          "Suporte por e-mail",
        ],
        cta: "Assinar Plano Mensal",
      },
      {
        name: "Plano Trimestral",
        price: "R$ 49,90",
        period: "/trimestre",
        description: "Para quem quer estudar sem interrupção até a próxima final.",
        badge: "Melhor Custo-Benefício",
        features: [
          "Tudo do Plano Mensal",
          "Desconto exclusivo (economize 15%)",
          "Prioridade em novas atualizações de conteúdo",
          "Suporte prioritário",
        ],
        cta: "Assinar Plano Trimestral",
      },
    ],
  },
  faq: {
    badge: "Dúvidas",
    titleLead: "Perguntas",
    titleHighlight: "frequentes",
    subtitle: "Se ainda tiver alguma dúvida, é só chamar no suporte.",
    items: [
      {
        question: "O material cobre todas as matérias da UNR?",
        answer: "Sim. Cobrimos do ciclo básico ao clínico, organizado por cátedra e período, seguindo o currículo real da UNR.",
      },
      {
        question: "Funciona tanto para quem está começando quanto para quem já está em anos avançados?",
        answer: "Sim. Você pode navegar livremente e focar apenas nas matérias que está cursando no momento.",
      },
      {
        question: "Posso cancelar quando quiser?",
        answer: "Sim, sem fidelidade e sem multa. Você cancela quando quiser diretamente pela plataforma.",
      },
      {
        question: "O conteúdo é atualizado?",
        answer: "Sim. Revisamos periodicamente os resumos, questões e videoaulas para acompanhar mudanças no currículo e nas provas.",
      },
      {
        question: "Preciso baixar algum aplicativo?",
        answer: "Não. A plataforma é 100% online e funciona direto no navegador do computador ou do celular.",
      },
    ],
  },
  footer: {
    ctaTitle: "Sua próxima parcial já tem data. Sua preparação pode começar agora.",
    ctaSubtitle: "Junte-se aos alunos da UNR que decidiram estudar de um jeito mais inteligente.",
    ctaButton: "Quero começar agora",
    copyright: "© 2026 MedClass UNR. Todos os direitos reservados.",
    terms: "Termos de Uso",
    privacy: "Política de Privacidade",
  },
  dashboard: {
    subjects: {
      clinicaMedica: "Clínica Médica",
      cirurgia: "Cirurgia",
      pediatria: "Pediatria",
      ginecologia: "Ginecologia",
      preventiva: "Preventiva",
    },
    nav: {
      dashboard: "Dashboard",
      cronograma: "Cronograma",
      bancoQuestoes: "Banco de Questões",
      checklists: "Resumos",
      simulados: "Videoaulas",
      desempenho: "Desempenho",
    },
    slides: {
      dashboard: { subtitle: "Visão geral · Ciclo básico e clínico", badge: "+12%" },
      cronograma: { subtitle: "Seu plano de estudos", badge: "Em dia" },
      bancoQuestoes: { subtitle: "+3.000 questões disponíveis", badge: "Atualizado" },
      checklists: { subtitle: "Resumos por cátedra e período", badge: "Novo" },
      simulados: { subtitle: "Aulas curtas, direto ao ponto", badge: "Novo" },
      desempenho: { subtitle: "Currículo UNR · Ciclo 2025", badge: "+12%" },
    },
    overview: {
      totalSimulados: "Questões Feitas",
      concluidos: "Concluídos",
      mediaGeral: "Média Geral",
      recentes: "Recentes",
      verHistorico: "Ver histórico completo",
      activity: [
        { name: "Resumo · Fisiologia Renal", time: "Há 2h", score: 85 },
        { name: "Questões · Clínica Médica", time: "Ontem", score: 72 },
        { name: "Videoaula · Farmacologia", time: "02 Jan", score: 64 },
      ],
    },
    cronogramaPanel: {
      items: [
        { day: "Segunda", subject: "Clínica Médica", status: "Concluído" },
        { day: "Terça", subject: "Cirurgia", status: "Concluído" },
        { day: "Quarta", subject: "Pediatria", status: "Hoje" },
        { day: "Quinta", subject: "Ginecologia", status: "Pendente" },
        { day: "Sexta", subject: "Preventiva", status: "Pendente" },
      ],
    },
    bank: {
      totalBadge: "+3.000 questões",
      totalLabel: "no banco de questões, comentadas e atualizadas",
      searchPlaceholder: "Buscar por cátedra, tema...",
    },
    checklistsPanel: {
      items: [
        { name: "Cardiologia · Insuficiência Cardíaca", score: 78 },
        { name: "Nefrologia · Distúrbios Hidroeletrolíticos", score: 85 },
        { name: "Pneumologia · DPOC", score: 69 },
        { name: "Endocrinologia · Diabetes Mellitus", score: 91 },
      ],
    },
    stats: {
      aproveitamento: "Aproveit.",
      resolvidas: "Resolvidas",
      tempoQuestao: "Tempo/questão",
      ranking: "Ranking",
    },
    evolucaoPorSimulado: "Evolução por semana",
    meta: "Meta",
    percentAcerto: "% de acerto",
    desempenhoPorArea: "Desempenho por área",
    simulado: {
      nivel: "Nível",
      aleatorio: "Aleatório",
      prova: "Parcial",
      questoes: "Questões",
      cronometro: "Cronômetro",
      ativado: "Ativado",
      areasSelecionadas: "Matérias selecionadas",
      montando: "Montando seu simulado",
      resumo: "3 matérias · 30 questões",
      iniciar: "Iniciar Simulado",
    },
    xpLevel: "Nível 7",
    xpAmount: "2.140 XP",
  },
  quiz: {
    badge: "Teste Grátis",
    title: "Teste seus conhecimentos",
    subtitle: "Experimente nossa plataforma com 5 questões de clínica médica, cirurgia e pediatria. Veja como funciona o sistema de simulados.",
    questionLabel: "Questão",
    of: "de",
    confirm: "Confirmar",
    next: "Próxima questão",
    seeResult: "Ver resultado",
    resultLabel: "Resultado",
    resultGood: "Excelente! Você já domina bem esses temas — imagine com acesso a milhares de questões e resumos completos da UNR.",
    resultBad: "Bom começo! Com resumos organizados e questões comentadas, você fecha essas lacunas rapidinho.",
    restart: "Refazer teste",
    ctaFinal: "Quero estudar com o MedClass UNR",
  },
}

const es: typeof pt = {
  nav: {
    links: {
      inicio: "Inicio",
      plataforma: "Recursos",
      comoFunciona: "Cómo funciona",
      depoimentos: "Testimonios",
      planos: "Planes",
      faq: "Preguntas",
    },
    entrar: "Ingresar",
  },
  dashboardNav: {
    inicio: "Inicio",
    cronograma: "Cronograma",
    materiais: "Materiales",
    videoaulas: "Videoclases",
    resumos: "Resúmenes",
    flashcards: "Flashcards",
    treinamentos: "Entrenamientos",
    desempenho: "Rendimiento",
    historico: "Historial",
    estatisticas: "Estadísticas",
    desafiosClinicos: "Desafíos Clínicos",
    estudar: "Estudiar",
    ranking: "Ranking",
    medcoins: "MedCoins",
    lojaMedcoins: "Tienda MedCoins",
    extrato: "Movimientos",
    conquistas: "Logros",
    feedback: "Feedback",
    painelAdmin: "Panel Admin",
    sair: "Salir",
    minhaConta: "Mi cuenta",
    carregando: "Cargando...",
    planoMensal: "Plan Mensual",
    planoTrimestral: "Plan Trimestral",
    planoExpirado: "Plan vencido",
    planoGratuito: "Plan gratuito",
    administrador: "Administrador",
    testeGratis: "Prueba gratis",
    horasRestantes: "restantes",
    recursoExclusivo: "Recurso exclusivo de los planes pagos",
    navegacaoPrincipal: "Navegación principal",
    abrirMenu: "Abrir menú",
    menuNavegacao: "Menú de navegación",
    bemVindoDeVolta: "Bienvenido/a de nuevo",
    continueProgresso: "Continuá tu progreso en el estudio.",
    seuProgresso: "Tu Progreso",
    oQueFazerAgora: "Qué Hacer Ahora",
  },
  homeStats: {
    taxaAcerto: "Tasa de Acierto",
    questoesFeitas: "Preguntas Resueltas",
    tempoDeEstudo: "Tiempo de Estudio",
    simuladosSemana: "Simulacros Esta Semana",
  },
  actionCards: {
    praticarTitulo: "Practicar Ahora",
    praticarDescricao: "Resolvé preguntas seleccionadas para consolidar tu aprendizaje.",
    praticarCta: "Iniciar sesión",
    criarTitulo: "Crear Simulacro",
    criarDescricao: "Armá un simulacro personalizado con las materias que necesitás estudiar.",
    criarCta: "Crear nuevo",
  },
  dailyTip: {
    label: "Consejo del día",
  },
  desempenhoWidget: {
    titulo: "Tu Rendimiento",
    verEstatisticas: "Ver estadísticas",
    carregando: "Cargando...",
    vazio: "Todavía no resolviste ningún simulacro. ¿Qué tal empezar ahora?",
    aproveitamento: "Rendimiento",
    questoesFeitas: "Preguntas resueltas",
    pontos: "Puntos",
  },
  rankingWidget: {
    titulo: "Ranking",
    verCompleto: "Ver completo",
    carregando: "Cargando...",
    vazio: "Todavía nadie sumó puntos. ¡Resolvé un simulacro para aparecer acá!",
    voce: "Vos",
    suaPosicao: "Tu posición",
  },
  medcoinsWidget: {
    verExtrato: "Ver movimientos",
    carregando: "Cargando...",
    saldoDisponivel: "Saldo disponible",
    acumuladosNoTotal: "acumulados en total",
  },
  cronograma: {
    diasSemanaLabel: { mon: "Lun", tue: "Mar", wed: "Mié", thu: "Jue", fri: "Vie", sat: "Sáb", sun: "Dom" } as Record<string, string>,
    localeData: "es-AR",
    carregando: "Cargando cronograma...",
    trilhasTitulo: "Rutas del equipo MedClass",
    trilhasSubtitulo: "Seguí una ruta de entrenamiento armada por el equipo, en vez de crear tu propio cronograma.",
    entrarTrilhaConfirm: (nome: string) =>
      `¿Entrar a la ruta "${nome}"? Va a reemplazar tu rutina personal mientras la sigas.`,
    entrarTrilhaErro: "No se pudo entrar a la ruta",
    entrar: "Entrar",
    criarRotinaTitulo: "Crear Rutina de Estudio",
    area: "Área",
    horario: "Horario",
    questoesPorSessao: "Preguntas por sesión",
    diasDaSemana: "Días de la Semana",
    adicionarRotina: "Agregar Rutina",
    erroSalvarRotina: "Error al guardar la rutina",
    rotinasCadastradas: "Rutinas Registradas",
    nenhumaRotina: "Todavía no hay ninguna rutina registrada.",
    questoesPorSessaoLabel: "preguntas/sesión",
    proximasSessoes: "Próximas sesiones",
    nenhumaSessao: "No hay ninguna sesión programada.",
  },
  planRestricted: {
    verPlanos: "Ver planes disponibles",
    materiaisTitulo: "Materiales es exclusivo de los planes pagos",
    materiaisDescricao: "Videoclases, resúmenes y flashcards están disponibles para quienes se suscriben al plan mensual o trimestral. Elegí un plan para desbloquear.",
  },
  materiais: {
    carregando: "Cargando...",
    videoaulas: "Videoclases",
    resumos: "Resúmenes",
    flashcards: "Flashcards",
    tituloPagina: "Materiales",
    subtituloPagina: "Accedé a tus videoclases, resúmenes y flashcards",
  },
  resumosGrid: {
    carregando: "Cargando...",
    vazio: "No hay ningún resumen disponible por el momento.",
    secoes: "secciones",
  },
  videoaulasGrid: {
    carregando: "Cargando...",
    vazio: "No hay ninguna videoclase disponible por el momento.",
  },
  flashcardsGrid: {
    carregando: "Cargando...",
    vazio: "No hay ningún mazo de flashcards disponible por el momento.",
    concluido: "Completado",
    cartoes: "tarjetas",
    respondidos: "respondidas",
  },
  hero: {
    badge: "Hecho para estudiantes de Medicina de la UNR",
    headline: "Dejá de ahogarte en apuntes. Empezá a aprobar en Rosario.",
    subheadline:
      "Resúmenes completos, banco de preguntas y videoclases alineados al programa de la UNR — para que llegues a cada parcial y final con confianza, no con pánico.",
    motivational: "Hecho por quienes entienden lo que es estudiar medicina lejos de casa.",
    ctaPrimary: "Quiero estudiar con MedClass UNR",
    ctaSecondary: "Ver cómo funciona",
    socialProofStrong: "Contenido pensado para la UNR",
    socialProof: "del ciclo básico al clínico, sin vacíos",
  },
  pain: {
    badge: "La realidad",
    titleLead: "Estudiar medicina lejos de casa ya es difícil.",
    titleHighlight: "Hacerlo sin material organizado, es una locura.",
    subtitle: "Si alguna de estas situaciones te resulta familiar, no estás solo — y no tenés que seguir así.",
    items: [
      {
        title: "Apuntes desordenados por todos lados",
        description: "Fotocopia de compañero, grupo de WhatsApp, resumen incompleto de años anteriores. Perdés más tiempo buscando material que estudiando de verdad.",
      },
      {
        title: "Los parciales no esperan a nadie",
        description: "El calendario de la UNR no perdona. Apenas terminás de estudiar una materia y ya está golpeando la puerta el próximo examen.",
      },
      {
        title: "Contenido disperso, sin estructura clara",
        description: "Cátedras distintas, bibliografías distintas, cada una a su manera. Armar un plan de estudio propio te quita un tiempo que no tenés de sobra.",
      },
      {
        title: "Lejos de casa, sin un apoyo real",
        description: "Sin alguien que entienda de verdad lo que es estudiar en otra ciudad, es fácil sentirte perdido — y eso pesa tanto como el contenido del examen.",
      },
    ],
    closing: "No tenés que seguir estudiando así.",
  },
  features: {
    badge: "La solución",
    titleLead: "Todo lo que necesitás para aprobar,",
    titleHighlight: "en un solo lugar",
    subtitle: "Creado específicamente para el programa de la UNR — del ciclo básico al clínico.",
    items: [
      { title: "Resúmenes Completos del Programa UNR", description: "Directo al punto, organizados por materia y por cátedra, para que estudies exactamente lo que toma tu examen." },
      { title: "Banco de Preguntas para Practicar", description: "Cientos de preguntas estilo parcial y final, con corrección comentada, para entrenar hasta dominar cada tema." },
      { title: "Videoclases Didácticas y Directas", description: "Clases cortas y al punto, para repasar un tema complicado en minutos, no en horas." },
      { title: "Ciclo Básico y Clínico, sin vacíos", description: "De Anatomía y Fisiología hasta las materias clínicas, todo el material que necesitás en un solo lugar." },
      { title: "Hecho por quienes conocen la UNR", description: "Contenido pensado para la realidad de quien estudia en la UNR, no una traducción genérica de apuntes." },
      { title: "Estudiá a tu ritmo, donde estés", description: "Accedé desde la computadora o el celular, entre una clase y otra, en la biblioteca o en tu casa." },
    ],
  },
  howItWorks: {
    badge: "Cómo funciona",
    titleLead: "Empezá a estudiar en",
    titleHighlight: "3 pasos simples",
    subtitle: "Sin vueltas: elegí, estudiá y seguí tu evolución.",
    steps: [
      { title: "Elegí tu plan", description: "Suscribite a MedClass UNR y desbloqueá acceso completo a la plataforma en minutos." },
      { title: "Encontrá tu materia", description: "Buscá por cátedra, tema o cuatrimestre y llegá directo al resumen, la videoclase o las preguntas que necesitás." },
      { title: "Estudiá, practicá y repasá", description: "Alterná entre resumen, preguntas y videoclase hasta que el contenido realmente quede." },
      { title: "Llegá segura/o al examen", description: "Seguí tu progreso por materia y sabé exactamente dónde reforzar antes de cada parcial." },
    ],
  },
  testimonials: {
    badge: "Testimonios",
    titleLead: "Estudiantes de la UNR que ya están",
    titleHighlight: "estudiando distinto",
    subtitle: "Testimonios ilustrativos — pronto, historias reales de quienes ya usan MedClass UNR.",
    items: [
      {
        quote:
          "Antes perdía horas buscando apuntes de compañeros. Con los resúmenes de MedClass UNR, organicé todo mi estudio y entendí mucho mejor cada tema.",
        author: "Sofía Martínez",
        role: "4º año, Medicina UNR",
      },
      {
        quote:
          "Las preguntas comentadas fueron lo que más me ayudó en el parcial de Fisiología. Pude identificar exactamente dónde me equivocaba y corregirlo antes del examen.",
        author: "Tomás Ibarra",
        role: "2º año, Medicina UNR",
      },
      {
        quote:
          "Por fin un material pensado para cómo realmente estudiamos en la UNR. Cambió por completo mi rutina de estudio.",
        author: "Valentina Rojas",
        role: "3º año, Medicina UNR",
      },
    ],
  },
  pricing: {
    badge: "Planes",
    titleLead: "Una inversión simple",
    titleHighlight: "para no trabarte en ningún examen",
    subtitle: "Cancelá cuando quieras, sin letra chica.",
    paymentNote: "Pago por transferencia (CBU/ALIAS).",
    plans: [
      {
        name: "Plan Mensual",
        price: "$6.000 ARS",
        period: "/mes",
        description: "Para quienes quieren probar la plataforma.",
        features: [
          "Acceso a todos los resúmenes del programa UNR",
          "Banco de preguntas completo con corrección comentada",
          "Videoclases de todas las materias",
          "Soporte por correo electrónico",
        ],
        cta: "Suscribirse al Plan Mensual",
      },
      {
        name: "Plan Trimestral",
        price: "$15.000 ARS",
        period: "/trimestre",
        description: "Para quienes quieren estudiar sin interrupciones hasta el próximo final.",
        badge: "Mejor Relación Precio-Beneficio",
        features: [
          "Todo lo del Plan Mensual",
          "Descuento exclusivo (ahorrá 15%)",
          "Prioridad en nuevas actualizaciones de contenido",
          "Soporte prioritario",
        ],
        cta: "Suscribirse al Plan Trimestral",
      },
    ],
  },
  faq: {
    badge: "Preguntas",
    titleLead: "Preguntas",
    titleHighlight: "frecuentes",
    subtitle: "Si todavía tenés alguna duda, escribinos a soporte.",
    items: [
      {
        question: "¿El material cubre todas las materias de la UNR?",
        answer: "Sí. Cubrimos del ciclo básico al clínico, organizado por cátedra y cuatrimestre, siguiendo el programa real de la UNR.",
      },
      {
        question: "¿Sirve tanto para quien recién empieza como para quien ya está en años avanzados?",
        answer: "Sí. Podés navegar libremente y enfocarte solo en las materias que estás cursando en este momento.",
      },
      {
        question: "¿Puedo cancelar cuando quiera?",
        answer: "Sí, sin permanencia mínima y sin multas. Cancelás cuando quieras directamente desde la plataforma.",
      },
      {
        question: "¿El contenido se actualiza?",
        answer: "Sí. Revisamos periódicamente los resúmenes, preguntas y videoclases para acompañar cambios en el programa y en los exámenes.",
      },
      {
        question: "¿Necesito descargar alguna aplicación?",
        answer: "No. La plataforma es 100% online y funciona directo desde el navegador de la computadora o el celular.",
      },
    ],
  },
  footer: {
    ctaTitle: "Tu próximo parcial ya tiene fecha. Tu preparación puede empezar ahora.",
    ctaSubtitle: "Sumate a los estudiantes de la UNR que decidieron estudiar de una forma más inteligente.",
    ctaButton: "Quiero empezar ahora",
    copyright: "© 2026 MedClass UNR. Todos los derechos reservados.",
    terms: "Términos de Uso",
    privacy: "Política de Privacidad",
  },
  dashboard: {
    subjects: {
      clinicaMedica: "Medicina Clínica",
      cirurgia: "Cirugía",
      pediatria: "Pediatría",
      ginecologia: "Ginecología",
      preventiva: "Preventiva",
    },
    nav: {
      dashboard: "Dashboard",
      cronograma: "Cronograma",
      bancoQuestoes: "Banco de Preguntas",
      checklists: "Resúmenes",
      simulados: "Videoclases",
      desempenho: "Rendimiento",
    },
    slides: {
      dashboard: { subtitle: "Visión general · Ciclo básico y clínico", badge: "+12%" },
      cronograma: { subtitle: "Tu plan de estudio", badge: "Al día" },
      bancoQuestoes: { subtitle: "+3.000 preguntas disponibles", badge: "Actualizado" },
      checklists: { subtitle: "Resúmenes por cátedra y cuatrimestre", badge: "Nuevo" },
      simulados: { subtitle: "Clases cortas, directo al punto", badge: "Nuevo" },
      desempenho: { subtitle: "Programa UNR · Ciclo 2025", badge: "+12%" },
    },
    overview: {
      totalSimulados: "Preguntas Resueltas",
      concluidos: "Completados",
      mediaGeral: "Media General",
      recentes: "Recientes",
      verHistorico: "Ver historial completo",
      activity: [
        { name: "Resumen · Fisiología Renal", time: "Hace 2h", score: 85 },
        { name: "Preguntas · Medicina Clínica", time: "Ayer", score: 72 },
        { name: "Videoclase · Farmacología", time: "02 Ene", score: 64 },
      ],
    },
    cronogramaPanel: {
      items: [
        { day: "Lunes", subject: "Medicina Clínica", status: "Completado" },
        { day: "Martes", subject: "Cirugía", status: "Completado" },
        { day: "Miércoles", subject: "Pediatría", status: "Hoy" },
        { day: "Jueves", subject: "Ginecología", status: "Pendiente" },
        { day: "Viernes", subject: "Preventiva", status: "Pendiente" },
      ],
    },
    bank: {
      totalBadge: "+3.000 preguntas",
      totalLabel: "en el banco de preguntas, comentadas y actualizadas",
      searchPlaceholder: "Buscar por cátedra, tema...",
    },
    checklistsPanel: {
      items: [
        { name: "Cardiología · Insuficiencia Cardíaca", score: 78 },
        { name: "Nefrología · Trastornos Hidroelectrolíticos", score: 85 },
        { name: "Neumología · EPOC", score: 69 },
        { name: "Endocrinología · Diabetes Mellitus", score: 91 },
      ],
    },
    stats: {
      aproveitamento: "Rendim.",
      resolvidas: "Resueltas",
      tempoQuestao: "Tiempo/pregunta",
      ranking: "Ranking",
    },
    evolucaoPorSimulado: "Evolución por semana",
    meta: "Meta",
    percentAcerto: "% de acierto",
    desempenhoPorArea: "Rendimiento por área",
    simulado: {
      nivel: "Nivel",
      aleatorio: "Aleatorio",
      prova: "Parcial",
      questoes: "Preguntas",
      cronometro: "Cronómetro",
      ativado: "Activado",
      areasSelecionadas: "Materias seleccionadas",
      montando: "Armando tu simulacro",
      resumo: "3 materias · 30 preguntas",
      iniciar: "Iniciar Simulacro",
    },
    xpLevel: "Nivel 7",
    xpAmount: "2.140 XP",
  },
  quiz: {
    badge: "Prueba Gratis",
    title: "Pon a prueba tus conocimientos",
    subtitle: "Probá nuestra plataforma con 5 preguntas de medicina clínica, cirugía y pediatría. Mirá cómo funciona el sistema de simulacros.",
    questionLabel: "Pregunta",
    of: "de",
    confirm: "Confirmar",
    next: "Siguiente pregunta",
    seeResult: "Ver resultado",
    resultLabel: "Resultado",
    resultGood: "¡Excelente! Ya dominás bien estos temas — imaginate con acceso a miles de preguntas y resúmenes completos de la UNR.",
    resultBad: "¡Buen comienzo! Con resúmenes organizados y preguntas comentadas, cerrás esas brechas muy rápido.",
    restart: "Repetir prueba",
    ctaFinal: "Quiero estudiar con MedClass UNR",
  },
}

export const translations: Record<Lang, typeof pt> = { pt, es }

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: typeof pt
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const STORAGE_KEY = "medclass-unr-lang"

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es")

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === "pt" || stored === "es") setLangState(stored)
  }, [])

  function setLang(next: Lang) {
    setLangState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider")
  return ctx
}
