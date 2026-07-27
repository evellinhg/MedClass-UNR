#!/usr/bin/env python3
"""
Gera revalida_2024_1_classificado.json com todas as 95 questões do REVALIDA 2024/1
classificadas por área, matéria, tags, dificuldade, justificativa e comentários por alternativa.
"""
import json

# Carrega dados brutos
with open("revalida_2024_1_questoes.json") as f:
    questoes_raw = json.load(f)
with open("revalida_2024_1_gabarito.json") as f:
    gabarito = json.load(f)

# Questões anuladas pelo INEP
ANULADAS = {"7", "17", "43", "49", "83"}

# ============================================================
# CLASSIFICAÇÃO COMPLETA DAS 95 QUESTÕES VÁLIDAS
# ============================================================
CLASSIFICACAO = {
    "1": {
        "area": "Clínica Médica",
        "materia": "Infecciologia / Urologia",
        "tags": ["revalida", "2024", "edicao-regular", "ITU", "antibioticoterapia"],
        "dificuldade": "fácil",
        "justificativa": "A paciente apresenta quadro clássico de ITU baixa (sintomas miccionais, ausência de febre e sintomas sistêmicos). Nitrofurantoína é primeira linha para ITU baixa não complicada. Norfloxacino seria para ITU alta. A resposta correta é A.",
        "opcoes_comentario": [
            "CORRETA — ITU baixa não complicada: nitrofurantoína é primeira linha conforme protocolo do MS.",
            "Errada — Norfloxacino é indicado para ITU alta, não baixa. A paciente não apresenta sintomas de comprometimento renal.",
            "Errada — A apresentação clínica não sugere ITU por S. aureus nem justifica antibioticoterapia de amplo espectro.",
            "Errada — Não há sinais de nefrolitíase complicada (colica renal, hematúria macroscópica). Não se aguarda urocultura para iniciar tratamento de ITU baixa."
        ]
    },
    "2": {
        "area": "Cirurgia",
        "materia": "Urologia / Trauma",
        "tags": ["revalida", "2024", "edicao-regular", "trauma", "trato-urinário"],
        "dificuldade": "médio",
        "justificativa": "No contexto de trauma abdominal com suspeita de lesão do trato urinário, a uretrocistografia retrógrada é o método de eleição para avaliar integridade da bexiga e uretra. A resposta correta é A.",
        "opcoes_comentario": [
            "CORRETA — Uretrocistografia retrógrada é o gold standard para avaliar lesão de bexiga e uretra no trauma.",
            "Errada — Cistostomia suprapúbica é procedimento cirúrgico, não método diagnóstico.",
            "Errada — Tomografia sem contraste tem baixa sensibilidade para lesões do trato urinário inferior.",
            "Errada — Ultrassonografia tem sensibilidade limitada para lesões de bexiga e uretra."
        ]
    },
    "3": {
        "area": "Pediatria",
        "materia": "Oftalmologia Pediátrica / Neurologia",
        "tags": ["revalida", "2024", "edicao-regular", "nistagmo", "lactente"],
        "dificuldade": "médio",
        "justificativa": "O lactente apresenta nistagmo (movimentos oculares oscilatórios) com teste do olhinho inconclusivo. Nistagmo congênito requer encaminhamento ao oftalmologista e neuropediatra para investigação de causas subjacentes. Resposta correta: C.",
        "opcoes_comentario": [
            "Errada — Catarata congênita não se manifesta como nistagmo oscilatório; o teste do olhinho já foi realizado.",
            "Errada — O padrão de movimento não é compatível com estrabismo.",
            "CORRETA — Nistagmo com teste do olhinho inconclusivo requer encaminhamento oftalmológico e neuropediátrico para investigação.",
            "Errada — Xeroftalmia por deficiência de vitamina A não apresenta nistagmo; seria hipopigmentação e xerosis conjuntival."
        ]
    },
    "4": {
        "area": "Ginecologia e Obstetrícia",
        "materia": "Abortamento",
        "tags": ["revalida", "2024", "edicao-regular", "abortamento", "sangramento-vaginal"],
        "dificuldade": "médio",
        "justificativa": "Gestante com sangramento vivo e colo pérvio no toque bimanual = abortamento em evolução. A conduta deve respeitar a autonomia da paciente, oferecendo opção entre AMIU/curetagem ou conduta expectante. Resposta correta: D.",
        "opcoes_comentario": [
            "Errada — Não é ameaça de abortamento (já há colo pérvio e restos ovulares).",
            "Errada — Ameaça de abortamento requer colo fechado; aqui o colo está pérvio.",
            "Errada — Embora o diagnóstico esteja correto, a conduta de internação e USG não respeita a autonomia da paciente.",
            "CORRETA — Abortamento em evolução com colo pérvio: explicar situação e oferecer opção entre AMIU/curetagem ou conduta expectante, respeitando autonomia."
        ]
    },
    "5": {
        "area": "Medicina da Família e Comunidade",
        "materia": "SUS / Organização do Trabalho",
        "tags": ["revalida", "2024", "edicao-regular", "SUS", "visita-domiciliar"],
        "dificuldade": "fácil",
        "justificativa": "O médico promoveu roda de conversa com a equipe para discutir critérios de visitas domiciliares como ferramenta de trabalho em equipe. O princípio do SUS que mais se enquadra é o da integralidade (olhar o indivíduo em sua totalidade, incluindo aspecto familiar e comunitário). Resposta correta: C.",
        "opcoes_comentario": [
            "Errada — Equidade refere-se à igualdade de acesso, não à integralidade do cuidado.",
            "Errada — Autonomia refere-se à liberdade de decisão do paciente e dos profissionais.",
            "CORRETA — Integralidade: abordar o indivíduo em seu aspecto familiar e comunitário é essência da integralidade no SUS.",
            "Errada — Universalidade refere-se ao direito de todos ao acesso, não à forma de organizar o cuidado."
        ]
    },
    "6": {
        "area": "Medicina da Família e Comunidade",
        "materia": "Imunização / Vacinas",
        "tags": ["revalida", "2024", "edicao-regular", "vacinas", "atualização-vacinal"],
        "dificuldade": "fácil",
        "justificativa": "Paciente com história de sarampo, caxumba, rubéola e varicela antes dos 5 anos e hepatite A aos 10 anos. As vacinas contra essas doenças vivas atenuadas são contraindicadas após infecção natural. A vacina varicela-zóster é indicada para idosos (≥60 anos). Para esta paciente de 64 anos, a vacina indicada é varicela-zóster. Resposta correta: D.",
        "opcoes_comentario": [
            "Errada — Já teve caxumba, não precisa da vacina.",
            "Errada — Já teve hepatite A, possui imunidade natural.",
            "Errada — Tríplice viral é contraindicada pois já teve sarampo, caxumba e rubéola.",
            "CORRETA — Varicela-zóster é indicada para idosos ≥60 anos para prevenção de herpes zóster. A paciente já teve varicela na infância, mas a vacina é recomendada nessa faixa etária."
        ]
    },
    "7": {"area": "Cirurgia", "materia": "Pós-operatório", "tags": [], "dificuldade": "difícil", "justificativa": "Questão anulada pelo INEP.", "opcoes_comentario": []},
    "8": {
        "area": "Pediatria",
        "materia": "Neurologia Pediátrica / Convulsão Febril",
        "tags": ["revalida", "2024", "edicao-regular", "convulsão-febril", "lactente"],
        "dificuldade": "médio",
        "justificativa": "Lactente de 2 anos com convulsão tônico-clônica generalizada associada a febre, duração de 7 minutos, primeiro episódio, sem sinais meníngeos, sem déficits neurológicos residuais. Convulsão febril simples: investigar causa da febre e tratar. Resposta correta: C.",
        "opcoes_comentario": [
            "Errada — Convulsão febril simples não requer TC nem punção lombar de rotina.",
            "Errada — Convulsão complexa requer duração >15 min, recorrência em 24h ou déficits residuais; este caso é simples.",
            "CORRETA — Convulsão febril simples: investigar causa da febre e tratar de acordo com os resultados. Não requer TC nem punção lombar.",
            "Errada — Não há critérios para convulsão complexa; RM e internação não são indicados."
        ]
    },
    "9": {
        "area": "Ginecologia e Obstetrícia",
        "materia": "Mama / Rastreamento",
        "tags": ["revalida", "2024", "edicao-regular", "mamografia", "BIRADS"],
        "dificuldade": "fácil",
        "justificativa": "Mamografia BIRADS 4 (sugestivo de malignidade) requer biópsia para diagnóstico histológico. Não é indicado apenas acompanhamento ou outra imagem. Resposta correta: B.",
        "opcoes_comentario": [
            "Errada — Quadrantectomia é tratamento cirúrgico, não diagnóstico. Não se opera sem diagnóstico histológico.",
            "CORRETA — BIRADS 4 requer biópsia para diagnóstico histológico antes de qualquer conduta.",
            "Errada — Repetir mamografia em 6 meses é conduta para BIRADS 3 (provavelmente benigno).",
            "Errada — USG complementar pode ser feita, mas não substitui a biópsia em BIRADS 4."
        ]
    },
    "10": {
        "area": "Clínica Médica",
        "materia": "Cardiologia / Emergência Hipertensiva",
        "tags": ["revalida", "2024", "edicao-regular", "HAS", "emergência-hipertensiva"],
        "dificuldade": "médio",
        "justificativa": "Paciente com PA 190x120 mmHg, dor torácica, dispneia e alteração do nível de consciência = emergência hipertensiva com comprometimento de órgão-alvo. Conduta: monitorar e encaminhar para urgência imediatamente com AAS. Resposta correta: D.",
        "opcoes_comentario": [
            "Errada — Reduzir PA em 24-48h é para hipertensão acelerada, não emergência hipertensiva.",
            "Errada — Anti-hipertensivo oral comencaminhamento para observação é insuficiente para emergência hipertensiva.",
            "Errada — Avaliar adesão é conduta ambulatorial, não de emergência.",
            "CORRETA — Emergência hipertensiva com comprometimento de órgão-alvo: monitorar, AAS e encaminhar para urgência imediatamente."
        ]
    },
    "11": {
        "area": "Clínica Médica",
        "materia": "Endocrinologia / Tireoide",
        "tags": ["revalida", "2024", "edicao-regular", "doença-de-graves", "hipertireoidismo"],
        "dificuldade": "difícil",
        "justificativa": "Doença de Graves: captação elevada de iodo radioativo e distribuição difusa na cintilografia são achados característicos. TRAb e anti-TPO podem estar elevados, mas os níveis de TSH estariam suprimidos, não elevados. Resposta correta: D.",
        "opcoes_comentario": [
            "Errada — TRAb e anti-TPO positivos não descartam; mas a alternativa diz 'reduzidos', o que está errado para Graves.",
            "Errada — Aumento da ecogenicidade e nódulos císticos difusos não são achados de Graves.",
            "Errada — TSH elevado e T4 livre suprimido são achados de hipotireoidismo, não hipertireoidismo.",
            "CORRETA — Captação elevada de iodo radioativo e cintilografia com distribuição difusa são achados clássicos de Doença de Graves."
        ]
    },
    "12": {
        "area": "Cirurgia",
        "materia": "Urologia / Oncologia",
        "tags": ["revalida", "2024", "edicao-regular", "tumor-testicular", "orquiectomia"],
        "dificuldade": "fácil",
        "justificativa": "Homem de 22 anos com nódulo testicular endurecido, sem aumento à Valsalva, transiluminação negativa = suspeita de tumor testicular. Conduta: orquiectomia inguinal radical. Resposta correta: A.",
        "opcoes_comentario": [
            "CORRETA — Lesão testicular sólida em adulto jovem = suspeita de tumor; orquiectomia inguinal radical é conduta padrão.",
            "Errada — Hidrocele apresenta transiluminação positiva e massa moles.",
            "Errada — Hérnia inguinescrotal apresenta bulbo à基底部 do escroto e redução à manobra.",
            "Errada — Orquiepididimite apresenta sinais inflamatórios (edema, hiperemia, calor)."
        ]
    },
    "13": {
        "area": "Cirurgia",
        "materia": "Gastroenterologia / Pediatria",
        "tags": ["revalida", "2024", "edicao-regular", "hirschsprung", "enterocolite"],
        "dificuldade": "difícil",
        "justificativa": "Lactente com aganglionose do sigmoide, agora com enterocolite necrosante (diarreia sanguinolenta, febre, distensão). Após estabilização, tratamento definitivo é sigmoidectomia abdominoperineal com colostomia definitiva. Resposta correta: D.",
        "opcoes_comentario": [
            "Errada — Abaixamento de cólon endoanal sem colostomia é para Hirschsprung sem enterocolite.",
            "Errada — Abaixamento com colostomia temporária é opção, mas não o definitivo para este caso.",
            "Errada — Colostomia descompressiva é apenas temporária para estabilizar.",
            "CORRETA — Sigmoidectomia abdominoperineal com colostomia definitiva é o tratamento definitivo para aganglionose com enterocolite grave."
        ]
    },
    "14": {
        "area": "Ginecologia e Obstetrícia",
        "materia": "Pré-natal / Hipertensão Gestacional",
        "tags": ["revalida", "2024", "edicao-regular", "pré-eclâmpsia", "pré-natal"],
        "dificuldade": "difícil",
        "justificativa": "Gestante com PA 142/88 na 35ª semana e 140/82 na 31ª semana: elevação progressiva da PA. USG morfológica do 2º trimestre foi solicitada no momento incorreto (deveria ter sido entre 20-24 sem). Resposta correta: D.",
        "opcoes_comentario": [
            "Errada — O pré-natal NÃO foi adequadamente realizado: USG morfológica fora do timing e sem investigação de pré-eclâmpsia.",
            "Errada — Pré-eclâmpsia sem critérios de gravidade pode ser estabelecida, mas a frase está incompleta e a USG morfológica é o achado mais relevante.",
            "Errada — O encaminhamento para alto risco NÃO está indicado no momento correto, mas a frase diz que 'não está indicado', o que está errado.",
            "CORRETA — A USG morfológica do 2º trimestre foi solicitada no momento incorreto (fora do período de 20-24 semanas)."
        ]
    },
    "15": {
        "area": "Pediatria",
        "materia": "Dermatologia / Parasitologia",
        "tags": ["revalida", "2024", "edicao-regular", "tungíase", "dermatologia"],
        "dificuldade": "médio",
        "justificativa": "Criança com pápulas ceratóticas com elevação central enegrecida, lesões pustulosas, em área de contato com solo (sítio) = tungíase. Tratamento: remoção cirúrgica do parasita na UBS. Resposta correta: C.",
        "opcoes_comentario": [
            "Errada — Larva migrans apresenta lesões lineiras, não pápulas com ponto negro central.",
            "Errada — Eczema disidrótico apresenta vesículas na palma das mãos, sem ponto negro.",
            "CORRETA — Pápulas com elevação central enegrecida em pés = tungíase. Remoção cirúrgica na UBS com material esterilizado é o tratamento.",
            "Errada — Verruga viral não apresenta ponto negro central nem lesões pustulosas."
        ]
    },
    "16": {
        "area": "Clínica Médica",
        "materia": "Neurologia / Cefaleia",
        "tags": ["revalida", "2024", "edicao-regular", "migrânea", "cefaleia"],
        "dificuldade": "fácil",
        "justificativa": "Cefaleia hemicraniana, pulsátil, com aura visual, fono e fotofobia, duração 6-10h = migrânea. Triptano é tratamento agudo de escolha. Resposta correta: A.",
        "opcoes_comentario": [
            "CORRETA — Migrânea com aura: triptano é primeira linha para tratamento agudo.",
            "Errada — Cefaleia tensional é bilateral, em aperto, sem aura.",
            "Errada — Cefaleia em salvas é unilateral periorbitária, muito intensa, com lacrimejamento e rinorreia.",
            "Errada — Não há sinais de malformação vascular; exame neurológico normal."
        ]
    },
    "17": {"area": "Clínica Médica", "materia": "Otorrinolaringologia", "tags": [], "dificuldade": "difícil", "justificativa": "Questão anulada pelo INEP.", "opcoes_comentario": []},
    "18": {
        "area": "Pediatria",
        "materia": "Neonatologia / Respiratório",
        "tags": ["revalida", "2024", "edicao-regular", "neonato", "DST", "surfactante"],
        "dificuldade": "difícil",
        "justificativa": "RN de 36 sem com desconforto respiratório, ausculta sem ruídos, FR 82 irpm. Suspeita de disease da membrana hialina (DMH). Conduta: intubação + surfactante + extubar e cateter nasal. Resposta correta: C.",
        "opcoes_comentario": [
            "Errada — Capuz de oxigênio e fisioterapia são insuficientes para desconforto respiratório grave em neonato.",
            "Errada — Cateter de O e hidratação venosa são suporte, mas não resolvem o problema de surfactante.",
            "CORRETA — DMH em prematuro: intubação + surfactante exógeno + extubar e oxigênio suplementar é conduta padrão.",
            "Errada — VNI pode ser tentada, mas neste caso com ausculta pulmonar sem ruídos e FR 82 irpm, intubação é mais segura."
        ]
    },
    "19": {
        "area": "Ginecologia e Obstetrícia",
        "materia": "Parto / Cardiotocografia",
        "tags": ["revalida", "2024", "edicao-regular", "pós-termo", "CTG", "bem-estar-fetal"],
        "dificuldade": "médio",
        "justificativa": "Gestante >40 sem, CTG normal (variabilidade 10-20 bpm, 2 acelerações, sem desacelerações), USG cefálico com líquido normal = bem-estar fetal. Conduta: orientar retorno em 3 dias. Resposta correta: D.",
        "opcoes_comentario": [
            "Errada — A CTG mostra bem-estar fetal, não hipóxia. Não há indicação de indução.",
            "Errada — Acelerações transitórias são sinais de BEM-ESTAR fetal, não de hipóxia.",
            "Errada — Embora a conduta de internar possa ser considerada, os exames mostram bem-estar fetal.",
            "CORRETA — CTG e USG mostram bem-estar fetal. Orientar retorno em 3 dias (41 sem pela DUM) para reavaliação."
        ]
    },
    "20": {
        "area": "Pediatria",
        "materia": "Nutrição / Crescimento",
        "tags": ["revalida", "2024", "edicao-regular", "crescimento", "escore-z", "sobrepeso"],
        "dificuldade": "médio",
        "justificativa": "Criança de 2 anos com IMC/Iade = +2,8 (sobrepeso) e estatura/Iade = -0,7 (dentro da normalidade). Conduta: orientar sobre estilo de vida. Resposta correta: D.",
        "opcoes_comentario": [
            "Errada — A criança NÃO está com peso adequado: IMC/Iade +2,8 indica sobrepeso.",
            "Errada — Estatura/Iade -0,7 está dentro da normalidade (entre -2 e +2).",
            "Errada — A estatura é adequada, não há indicação de encaminhamento a endocrinopediatra.",
            "CORRETA — IMC/Iade +2,8 = sobrepeso. Estatura adequada. Orientar mudanças no estilo de vida (alimentação e atividade física)."
        ]
    },
    "21": {
        "area": "Clínica Médica",
        "materia": "Neurologia / Neuropatia",
        "tags": ["revalida", "2024", "edicao-regular", "guillain-barré", "LCR"],
        "dificuldade": "difícil",
        "justificativa": "Paciente com paresia ascendente, arreflexia, parestesia em bota e luva, após infecção viral. LCR com albumino-citolose dissociada (proteína elevada, células normais) = Guillain-Barré. Resposta correta: B.",
        "opcoes_comentario": [
            "Errada — Miastenia Gravis apresenta fraqueza fatigável, não paresia ascendente.",
            "CORRETA — Paresia ascendente + arreflexia + albumino-citolose dissociada no LCR = Síndrome de Guillain-Barré.",
            "Errada — AVC apresenta déficit focal agudo, não paresia ascendente progressiva.",
            "Errada — ELA apresenta fraqueza progressiva com atrofia, sem comprometimento sensitivo."
        ]
    },
    "22": {
        "area": "Clínica Médica",
        "materia": "Endocrinologia / Pé Diabético",
        "tags": ["revalida", "2024", "edicao-regular", "pé-diabético", "DM"],
        "dificuldade": "fácil",
        "justificativa": "Pé diabético com lesão neuropática (sem dor, sem hiperemia, com hiperqueratose e tecido de granulação). Tratamento: curativo e adaptação de calçado. Resposta correta: D.",
        "opcoes_comentario": [
            "Errada — Simpatectomia lombar é para dor neuropática refratária, não para lesão neuropática sem dor.",
            "Errada — Enxerto é para feridas com perda de substância significativa, não para lesão com tecido de granulação.",
            "Errada — Terapia compressiva é para úlceras venosas, não neuropáticas.",
            "CORRETA — Pé diabético neuropático: curativo adequado e adaptação de calçado para descompressão do ponto de pressão."
        ]
    },
    "23": {
        "area": "Pediatria",
        "materia": "Gastroenterologia / Cirurgia Pediátrica",
        "tags": ["revalida", "2024", "edicao-regular", "piloestenose", "vômito-em-jato"],
        "dificuldade": "difícil",
        "justificativa": "Lactente com vômitos em jato, conteúdo leitoso, perda de peso, massa palpável em epigástrio, alcalose metabólica hipoclorêmica = estenose hipertrófica do piloro. Conduta: estabilizar + piloromiotomia. Resposta correta: A.",
        "opcoes_comentario": [
            "CORRETA — Vômitos em jato + massa em epigástrio + alcalose hipoclorêmica = estenose pilórica. Piloromiotomia é tratamento definitivo.",
            "Errada — Fundoplicatura é para refluxo gastroesofágico, não estenose pilórica.",
            "Errada — Erros inatos do metabolismo não apresentam massa palpável em epigástrio.",
            "Errada — Alergia a proteína do leite de vaca não causa vômitos em jato nem massa palpável."
        ]
    },
    "24": {
        "area": "Ginecologia e Obstetrícia",
        "materia": "Pré-eclâmpsia / Hipertensão Gestacional",
        "tags": ["revalida", "2024", "edicao-regular", "pré-eclâmpsia", "proteinúria"],
        "dificuldade": "médio",
        "justificativa": "Gestante com PA 140x95 mmHg, edema importante, sem proteinúria confirmada = pré-eclâmpsia sem critérios de gravidade. Conduta: solicitar exames para confirmar proteinúria e disfunção de órgão-alvo. Resposta correta: B.",
        "opcoes_comentario": [
            "Errada — Internação e interrupção da gestação são para pré-eclâmpsia grave, não sem critérios de gravidade.",
            "CORRETA — Pré-eclâmpsia sem critérios de gravidade: confirmar proteinúria e disfunção de órgão-alvo antes de definir conduta.",
            "Errada — HAS crônica seria PA elevada antes de 20 semanas; aqui a PA era normal antes.",
            "Errada — Emergência hipertensiva requer PA >180/120; aqui a PA é 140/95."
        ]
    },
    "25": {
        "area": "Medicina da Família e Comunidade",
        "materia": "Epidemiologia / Vigilância em Saúde",
        "tags": ["revalida", "2024", "edicao-regular", "cólera", "vigilância-epidemiológica"],
        "dificuldade": "médio",
        "justificativa": "Criança com diarreia aquosa em área sem esgotamento sanitário, contato com pessoa de Moçambique (endêmica para cólera). Conduta: reidratação oral, notificação e vigilância epidemiológica. Resposta correta: C.",
        "opcoes_comentario": [
            "Errada — Reidratação endovenosa é para desidratação grave; a criança está levemente desidratada.",
            "Errada — Quimioprofilaxia não é indicada para cólera; isolamento sanitário domiciliar não se aplica.",
            "CORRETA — Diarreia aquosa + fator epidemiológico: reidratação oral, notificação compulsória e vigilância epidemiológica/ambiental/sanitária.",
            "Errada — Antibióticos não são primeira linha para diarreia aguda; a notificação deve ser imediata, não condicionada à piora."
        ]
    },
    "26": {
        "area": "Medicina da Família e Comunidade",
        "materia": "Emergência / RCP",
        "tags": ["revalida", "2024", "edicao-regular", "RCP", "parada-cardíaca"],
        "dificuldade": "fácil",
        "justificativa": "Parada cardíaca: iniciar compressões torácicas imediatamente (C-A-B), 5 cm de profundidade, 100-120/min. Resposta correta: D.",
        "opcoes_comentario": [
            "Errada — Ventilação a cada 2-3s não é o protocolo; compressões contínuas com ventilação a cada 30:2.",
            "Errada — Abertura de vias aéreas ANTES das compressões não segue o protocolo C-A-B atual.",
            "Errada — Checar pulso a cada 5 min é frequência insuficiente; deve ser a cada 2 min.",
            "CORRETA — Protocolo C-A-B: compressões torácicas ≥5cm, 100-120/min, seguidas de abertura de vias aéreas e ventilação."
        ]
    },
    "27": {
        "area": "Cirurgia",
        "materia": "Tórax / Trauma",
        "tags": ["revalida", "2024", "edicao-regular", "hemotórax", "toracostomia"],
        "dificuldade": "difícil",
        "justificativa": "Ferimento por arma branca em tórax com instabilidade hemodinâmica, macicez à percussão e ausência de murmúrio = hemotórax tensionado. Conduta: toracotomia de emergência. Resposta correta: A.",
        "opcoes_comentario": [
            "CORRETA — Hemotórax tensionado com instabilidade hemodinâmica: toracotomia de emergência é vida-saving.",
            "Errada — Drenagem em selo d'água é para hemotórax sem tensão; aqui há instabilidade hemodinâmica.",
            "Errada — Punção torácica é diagnóstica, não terapêutica; toracotomia é urgente.",
            "Errada — Radiografia consome tempo e o paciente está instável; conduta cirúrgica é imediata."
        ]
    },
    "28": {
        "area": "Medicina da Família e Comunidade",
        "materia": "Imunização / Vacinas",
        "tags": ["revalida", "2024", "edicao-regular", "vacinas", "imunossuprimido"],
        "dificuldade": "médio",
        "justificativa": "Criança de 6 anos com nefropatia crônica em uso de corticoide >3mg/kg/dia (imunossuprimida), sem cicatriz de BCG. Contraindicado: vacinas vivas atenuadas (BCG, tríplice viral, tetraviral). Indicado: vacinas inativadas (hepatite B, influenza). Resposta correta: B.",
        "opcoes_comentario": [
            "Errada — Vacinas vivas (BCG, tríplice viral, tetraviral) são contraindicadas em imunossuprimidos.",
            "CORRETA — Tríplice bacteriana (DTP) e hepatite B são inativadas, seguras para imunossuprimidos.",
            "Errada — Tetraviral é vacina viva atenuada, contraindicada.",
            "Errada — BCG é vacina viva atenuada, contraindicada."
        ]
    },
    "29": {
        "area": "Ginecologia e Obstetrícia",
        "materia": "Endocrinologia / Tireoide na Gestação",
        "tags": ["revalida", "2024", "edicao-regular", "hipotireoidismo", "gestação"],
        "dificuldade": "difícil",
        "justificativa": "Gestante com TSH 8,20 mUI/L (elevado) e sintomas de hipotireoidismo. TSH elevado na gestação se correlaciona com perdas fetais, especialmente se anti-TPO positivo. Resposta correta: C.",
        "opcoes_comentario": [
            "Errada — Metimazol é para hipertireoidismo, não hipotireoidismo.",
            "Errada — TBG elevada na gestação pode elevar T4 total, mas TSH elevado é significativo.",
            "CORRETA — TSH elevado na gestação se correlaciona com perdas fetais; gravidade aumenta se anti-TPO positivo.",
            "Errada — Levotiooxina deve ser iniciada imediatamente, não após 12 semanas, pois o hipotireoidismo materno prejudica o desenvolvimento fetal."
        ]
    },
    "30": {
        "area": "Medicina da Família e Comunidade",
        "materia": "Saúde Pública / Tabagismo",
        "tags": ["revalida", "2024", "edicao-regular", "tabagismo", "adolescentes"],
        "dificuldade": "médio",
        "justificativa": "Estratégias prioritárias para combate ao tabagismo em adolescentes: capacitação dos profissionais para atender pacientes com desejo de cessação (estratégia de abordagem do tabagismo). Resposta correta: B.",
        "opcoes_comentario": [
            "Errada — Prescrever medicamentos para quem não deseja parar não é prioritário; primeiro capacitar profissionais.",
            "CORRETA — Capacitação dos profissionais de saúde para tratamento do tabagismo é estratégia prioritária.",
            "Errada — Comitês de bairro e regulação da venda não são atribuições diretas da equipe de saúde.",
            "Errada — Encaminhamento para nível secundário não é necessário; o atendimento pode ser feito na APS."
        ]
    },
    "31": {
        "area": "Clínica Médica",
        "materia": "Hematologia / Toxicologia",
        "tags": ["revalida", "2024", "edicao-regular", "intoxicação-chumbo", "anemia"],
        "dificuldade": "difícil",
        "justificativa": "Trabalhador de reciclagem de baterias com anemia microcítica refratária ao ferro e confusão mental = intoxicação por chumbo. Exame indicado: chumbo sérico. Resposta correta: C.",
        "opcoes_comentario": [
            "Errada — Mielograma é para investigação de doenças medulares.",
            "Errada — Haptoglobina é para hemólise intravascular.",
            "CORRETA — Exposição ocupacional a chumbo + anemia microcítica refratária + confusão mental = chumbo sérico.",
            "Errada — Teste de Coombs é para anemia hemolítica autoimune."
        ]
    },
    "32": {
        "area": "Cirurgia",
        "materia": "Queimadura / Profilaxia de Tétano",
        "tags": ["revalida", "2024", "edicao-regular", "queimadura", "tétano"],
        "dificuldade": "fácil",
        "justificativa": "Paciente com 3 doses de vacina antitetânica, última há 3 anos. Para profilaxia de tétano: dose de reforço (5ª dose). Não há indicação de soro antitetânico (SAT). Resposta correta: A.",
        "opcoes_comentario": [
            "CORRETA — 3 doses + intervalo >5 anos desde última dose: indicada dose de reforço. SAT não é necessário.",
            "Errada — SAT é indicado quando esquema vacinal incompleto ou desconhecido; aqui o esquema está completo.",
            "Errada — SAT é para esquema vacinal incompleto; dose de reforço é indicada.",
            "Errada — A vacinação de reforço é sempre indicada em queimadura quando o esquema está completo."
        ]
    },
    "33": {
        "area": "Pediatria",
        "materia": "Neonatologia / Dermatologia",
        "tags": ["revalida", "2024", "edicao-regular", "eritema-tóxico", "neonato"],
        "dificuldade": "fácil",
        "justificativa": "RN a termo com lesões papulares com halo eritematoso em face e tronco, surgidas no 3º dia de vida = eritema tóxico. Lesão autolimitada, não requer tratamento. Resposta correta: B.",
        "opcoes_comentario": [
            "Errada — Miliária rubra apresenta vesículas/minúsculas pústulas, não pápulas com halo eritematoso.",
            "CORRETA — Lesões papulares com halo eritematoso surgindo no 3º dia de vida = eritema tóxico. Autolimitado.",
            "Errada — Melanose pustulosa é mais escura e com padrão diferente.",
            "Errada — Candidíase neonatal apresenta placas esbranquiçadas, não pápulas com halo."
        ]
    },
    "34": {
        "area": "Ginecologia e Obstetrícia",
        "materia": "Infecção na Gestação / Toxoplasmose",
        "tags": ["revalida", "2024", "edicao-regular", "toxoplasmose", "gestação"],
        "dificuldade": "difícil",
        "justificativa": "Gestante com IGM+ e IGG- para toxoplasmose = suspeita de infecção recente. Iniciar espiramicina e solicitar nova sorologia em 3 semanas; se IGG positivar = infecção recente. Resposta correta: C.",
        "opcoes_comentario": [
            "Errada — Avidez alta = infecção antiga, não recente.",
            "Errada — Avidez baixa = infecção RECENTE, não antiga.",
            "CORRETA — IGM+ e IGG-: iniciar espiramicina e repetir sorologia em 3 semanas. Se IGG positivar = infecção recente.",
            "Errada — Não iniciar tratamento é arriscado; a espiramicina deve ser iniciada imediatamente."
        ]
    },
    "35": {
        "area": "Clínica Médica",
        "materia": "Hepatologia / Infectologia",
        "tags": ["revalida", "2024", "edicao-regular", "esquistossomose", "hipertensão-portal"],
        "dificuldade": "difícil",
        "justificativa": "Paciente da Bahia, marceneiro, banha em rios com caramujos, com hematêmese, melena, hepatomegalia e esplenomegalia = esquistossomose hepatoesplênica. Conduta: USG abdominal + ETA + pesquisa de ovos nas fezes. Resposta correta: B.",
        "opcoes_comentario": [
            "Errada — Endoscopia é para hemorragia ativa, mas a investigação inicial requer imagem e parasitológico.",
            "CORRETA — USG abdominal (avaliar fígado e baço) + ETA (avaliar varizes) + pesquisa de ovos nas fezes (confirmação parasitológica).",
            "Errada — Ressonância e biópsia retal são mais invasivas; a pesquisa de ovos nas fezes é mais simples.",
            "Errada — Radiografia de tórax não é indicada; sorologia e PCR não são padrão-ouro para esquistossomose."
        ]
    },
    "36": {
        "area": "Clínica Médica",
        "materia": "Infecciologia / Zoonoses",
        "tags": ["revalida", "2024", "edicao-regular", "leptospirose", "icterícia"],
        "dificuldade": "difícil",
        "justificativa": "Homem de 18 anos em área de inundação, com febre, mialgia, icterícia, insuficiência renal, trombocitopenia e exposição a águas de enchura = leptospirose. Resposta correta: D.",
        "opcoes_comentario": [
            "Errada — Dengue apresenta erupção cutânea, não icterícia intensa com insuficiência renal.",
            "Errada — Malária apresenta ciclo febril com calafrios, não mialgia intensa com colúria.",
            "Errada — Hepatite A apresenta icterícia mas não mialgia intensa nem trombocitopenia grave.",
            "CORRETA — Febre + mialgia + icterícia + insuficiência renal + trombocitopenia em área de inundação = leptospirose."
        ]
    },
    "37": {
        "area": "Cirurgia",
        "materia": "Pediatria / Trauma",
        "tags": ["revalida", "2024", "edicao-regular", "trauma-pediátrico", "acesso-venoso"],
        "dificuldade": "médio",
        "justificativa": "Criança atropelada com choque hemorrágico: acesso venoso periférico com solução isotônica aquecida é primeira linha. Acesso central é segunda opção. Resposta correta: C.",
        "opcoes_comentario": [
            "Errada — Dissecção venosa é muito demorada para emergência.",
            "Errada — Acesso subclávio tem risco em crianças e não é primeira opção.",
            "CORRETA — Punção percutânea de acessos venosos periféricos com solução isotônica aquecida é primeira linha no choque pediátrico.",
            "Errada — Acesso jugular é central e tem mais complicações que o periférico."
        ]
    },
    "38": {
        "area": "Pediatria",
        "materia": "Infectologia / Sífilis Congênita",
        "tags": ["revalida", "2024", "edicao-regular", "sífilis-congênita", "penicilina"],
        "dificuldade": "difícil",
        "justificativa": "Lactente com icterícia, hepatomegalia, atraso no desenvolvimento neuropsicomotor, sem pré-natal = sífilis congênita. Conduta: sorologia + penicilina cristalina. Resposta correta: B.",
        "opcoes_comentario": [
            "Errada — Hepatite neonatal não explica atraso no desenvolvimento neuropsicomotor.",
            "CORRETA — Icterícia + hepatomegalia + atraso neuropsicomotor + ausência de pré-natal = sífilis congênita. Penicilina cristalina é tratamento de escolha.",
            "Errada — Síndrome do bebê sacudido apresenta hemorragia retiniana e fraturas, não icterícia.",
            "Errada — Hipotireoidismo não causa icterícia nem hepatomegalia."
        ]
    },
    "39": {
        "area": "Ginecologia e Obstetrícia",
        "materia": "Menopausa / Sangramento Uterino",
        "tags": ["revalida", "2024", "edicao-regular", "sangramento-pós-menopáusico", "endométrio"],
        "dificuldade": "médio",
        "justificativa": "Mulher na pós-menopausa com sangramento transvaginal e endométrio irregular com 8mm = hiperplasia endometrial até prova em contrário. Conduta: histeroscopia diagnóstica. Resposta correta: A.",
        "opcoes_comentario": [
            "CORRETA — Sangramento pós-menopáusico + endométrio 8mm irregular: histeroscopia diagnóstica para biópsia.",
            "Errada — THS é contraindicada em sangramento pós-menopáusico não explicado.",
            "Errada — Ácido tranexâmico é para sangramento uterino funcional, não para investigação de causa orgânica.",
            "Errada — Histerectomia é tratamento, não investigação. Primeiro diagnóstico."
        ]
    },
    "40": {
        "area": "Ginecologia e Obstetrícia",
        "materia": "Pré-natal / Sífilis na Gestação",
        "tags": ["revalida", "2024", "edicao-regular", "sífilis", "anemia", "Coombs"],
        "dificuldade": "difícil",
        "justificativa": "Gestante com sífilis (VDRL 1/32), anemia (Hb 10,5), Rh negativo. Conduta: penicilina benzatina semanal por 3 semanas, VDRL trimestral, sulfato ferroso, Coombs indireto mensal, anti-D no pós-parto se RN Rh+. Resposta correta: A.",
        "opcoes_comentario": [
            "CORRETA — Penicilina semanal por 3 semanas + VDRL mensal + ferro + Coombs mensal + anti-D no pós-parto se RN Rh+.",
            "Errada — Penicilina dose única é para sífilis primária/secundária não gestacional. Na gestação, são 3 doses semanais.",
            "Errada — Penicilina semanal por 3 semanas é correto, mas Coombs no 3º trimestre e anti-D com 28 sem não é o padrão.",
            "Errada — Penicilina por 2 semanas é esquema incompleto; ferro profilático com 20 sem é atrasado."
        ]
    },
    "41": {
        "area": "Clínica Médica",
        "materia": "Gastroenterologia / SII",
        "tags": ["revalida", "2024", "edicao-regular", "intestino-irritável", "SII"],
        "dificuldade": "fácil",
        "justificativa": "Mulher de 28 anos com dor abdominal tipo cólica, alternância constipação/diarreia, melhora com evacuação, investigação negativa, ansiedade = síndrome do intestino irritável. Resposta correta: D.",
        "opcoes_comentario": [
            "Errada — Doença celíaca seria com diarrhea crônica, perda de peso, e anticorpo antitransglutaminase positivo.",
            "Errada — Câncer colorretal é raro em 28 anos e não apresenta esse padrão de dor.",
            "Errada — Retocolite ulcerativa apresenta diarreia com sangue e muco, não alternância.",
            "CORRETA — Dor abdominal que melhora com evacuação, alternância intestinal, investigação negativa, ansiedade = SII."
        ]
    },
    "42": {
        "area": "Cirurgia",
        "materia": "Urologia / Doenças Sexualmente Transmissíveis",
        "tags": ["revalida", "2024", "edicao-regular", "cancro-mole", "DST"],
        "dificuldade": "médio",
        "justificativa": "Homem com úlcera genital de bordos regulares e fundo esbranquiçado, em região de alta endemicidade = cancro mole (Haemophilus ducreyi). Tratamento: ciprofloxacina oral. Resposta correta: B.",
        "opcoes_comentario": [
            "Errada — Biópsia é para investigação de câncer, não para cancro mole.",
            "CORRETA — Cancro mole: ciprofloxacina 500mg VO 12/12h por 3 dias é esquema recomendado.",
            "Errada — Higiene local não é suficiente; necessita antibioticoterapia.",
            "Errada — Penicilina benzatina é para sífilis, não cancro mole."
        ]
    },
    "43": {"area": "Pediatria", "materia": "Gastroenterologia", "tags": [], "dificuldade": "médio", "justificativa": "Questão anulada pelo INEP.", "opcoes_comentario": []},
    "44": {
        "area": "Ginecologia e Obstetrícia",
        "materia": "Ginecologia / Dor Pélvica",
        "tags": ["revalida", "2024", "edicao-regular", "DIP", "PID"],
        "dificuldade": "difícil",
        "justificativa": "Mulher de 21 anos com dor pélvica, febre, sangramento pós-coital, colo friável e sangrante, mobilização anexal dolorosa = doença inflamatória pélvica. Resposta correta: B.",
        "opcoes_comentario": [
            "Errada — Gravidez ectópica rota apresenta sangramento escuro e dor contínua, não febre.",
            "CORRETA — Dor pélvica + febre + colo friável + mobilização anexal dolorosa = DIP. Antibioticoterapia é conduta.",
            "Errada — Torção anexial apresenta dor aguda unilateral, não febre nem colo friável.",
            "Errada — Cisto lúteo roto apresenta dor súbita, não febre nem colo friável."
        ]
    },
    "45": {
        "area": "Clínica Médica",
        "materia": "Pneumologia / Infectologia",
        "tags": ["revalida", "2024", "edicao-regular", "pneumonia", "comorbidades"],
        "dificuldade": "médio",
        "justificativa": "Idoso com HAS e DM, pneumonia adquirida na comunidade com estertores crepitantes, desvio à esquerda (idoso, comorbidades). Padrão ATS: amoxicilina + macrólido. Resposta correta: D.",
        "opcoes_comentario": [
            "Errada — Azitromicina isolada não cobre S. pneumoniae em paciente com comorbidades.",
            "Errada — Ceftriaxona IV é para pneumonia grave; aqui o paciente está estável.",
            "Errada — Ampicilina + sulbactam IV é para pneumonia hospitalar.",
            "CORRETA — Idoso com comorbidades + PAC: amoxicilina + ácido clavulânico + macrólido em regime ambulatorial."
        ]
    },
    "46": {
        "area": "Clínica Médica",
        "materia": "Pneumologia / Tuberculose",
        "tags": ["revalida", "2024", "edicao-regular", "tuberculose", "hemoptise"],
        "dificuldade": "difícil",
        "justificativa": "Paciente em situação de rua, com tosse produtiva, hemoptise, febre, emagrecimento, radiografia com infiltrado, PCR negativo, sem melhora com antibioticoterapia = tuberculose pulmonar. Iniciar tratamento empírico. Resposta correta: B.",
        "opcoes_comentario": [
            "Errada — Trocar antibiótico não resolve; a alta probabilidade clínica e epidemiológica justifica tratamento para TB.",
            "CORRETA — Alta probabilidade clínica e epidemiológica de TB: iniciar tratamento empírico com esquema RIPE.",
            "Errada — Cirurgia não é primeira linha para TB pulmonar.",
            "Errada — Resposta lenta não justifica manter antibioticoterapia convencional; TB requer esquema específico."
        ]
    },
    "47": {
        "area": "Cirurgia",
        "materia": "Aparelho Digestivo / Apendicite",
        "tags": ["revalida", "2024", "edicao-regular", "apendicite", "laparoscopia"],
        "dificuldade": "fácil",
        "justificativa": "Mulher com dor em FID, febre, leucocitose, TC com apêndice aumentado = apendicite aguda. Conduta: apendicectomia laparoscópica + antibioticoterapia pré-operatória com cefazolina + metronidazol. Resposta correta: D.",
        "opcoes_comentario": [
            "Errada — Videolaparoscopia exploratória não é o procedimento; apendicectomia é o tratamento.",
            "Errada — Apendicectomia aberta é opção, mas a laparoscópica é preferencial.",
            "Errada — Laparotomia é muito invasiva para apendicite não complicada.",
            "CORRETA — Apendicectomia laparoscópica + antibioticoterapia pré-operatória com cefazolina + metronidazol."
        ]
    },
    "48": {
        "area": "Pediatria",
        "materia": "Reumatologia Pediátrica / Kawasaki",
        "tags": ["revalida", "2024", "edicao-regular", "kawasaki", "aneurisma-coronário"],
        "dificuldade": "difícil",
        "justificativa": "Criança de 12 meses com febre 6 dias + edema de mãos/pés + conjuntivite + adenomegalia + língua em framboesa = doença de Kawasaki. Achado principal: aneurisma das artérias coronárias. Resposta correta: D.",
        "opcoes_comentario": [
            "Errada — Orquiepididite não é achado de Kawasaki.",
            "Errada — Trombocitopenia é rara em Kawasaki; geralmente é trombocitose.",
            "Errada — Faringite exsudativa não é achado de Kawasaki (faringe é hiperemiada, sem exsudato).",
            "CORRETA — Doença de Kawasaki: aneurisma das artérias coronárias é a complicação mais grave e achado principal."
        ]
    },
    "49": {"area": "Ginecologia e Obstetrícia", "materia": "Obstetrícia / Neonatologia", "tags": [], "dificuldade": "médio", "justificativa": "Questão anulada pelo INEP.", "opcoes_comentario": []},
    "50": {
        "area": "Medicina da Família e Comunidade",
        "materia": "Declaração de Óbito / Mortalidade",
        "tags": ["revalida", "2024", "edicao-regular", "declaração-de-óbito", "IAM"],
        "dificuldade": "médio",
        "justificativa": "Óbito domiciliar por dor precordial, sudorese, queda no chão = provável IAM. Na DO: causa básica = IAM; causa imediata = parada cardíaca. Resposta correta: C.",
        "opcoes_comentario": [
            "Errada — Síndrome metabólica é fator de risco, não causa básica do óbito.",
            "Errada — DM é causa contributiva, não causa imediata.",
            "CORRETA — Causa básica: infarto agudo do miocárdio (causa que iniciou a cadeia de eventos).",
            "Errada — Doença aterosclerótica é causa intermediária, não imediata."
        ]
    },
    "51": {
        "area": "Clínica Médica",
        "materia": "Reumatologia / Dermatologia",
        "tags": ["revalida", "2024", "edicao-regular", "eritema-nodoso", "hanseníase"],
        "dificuldade": "difícil",
        "justificativa": "Homem com nódulos cutâneos dolorosos, eritematosos, em braços/coxas/dorso, com artrite e granulomas dérmicos + vasculite = reação hansênica tipo 2 (eritema nodoso hansênico). Resposta correta: A.",
        "opcoes_comentario": [
            "CORRETA — Nódulos cutâneos dolorosos + artrite + granulomas dérmicos + vasculite = reação hansênica tipo 2.",
            "Errada — Granulomatose de Wegener apresenta comprometimento respiratório e renal.",
            "Errada — Leishmaniose tegumentar apresenta úlceras, não nódulos difusos.",
            "Errada — Retocolite ulcerativa não causa nódulos cutâneos."
        ]
    },
    "52": {
        "area": "Cirurgia",
        "materia": "Urologia / Oncologia",
        "tags": ["revalida", "2024", "edicao-regular", "tumor-bexiga", "hematúria"],
        "dificuldade": "médio",
        "justificativa": "Homem de 68 anos, tabagista, com disúria e hematúria há 3 meses, cistites recorrentes = suspeita de tumor de bexiga. Exame: cistoscopia com biópsia. Resposta correta: B.",
        "opcoes_comentario": [
            "Errada — Nefrolitíase apresenta cólica renal, não hematúria crônica.",
            "CORRETA — Tabagista + hematúria + cistites recorrentes = suspeita de tumor de bexiga. Cistoscopia com biópsia é padrão-ouro.",
            "Errada — Adenocarcinoma prostático seria avaliado com PSA e USG transretal.",
            "Errada — Cistite hemorrágica não justifica hematúria crônica em idoso tabagista."
        ]
    },
    "53": {
        "area": "Pediatria",
        "materia": "Síndromes Genéticas / Ortopedia",
        "tags": ["revalida", "2024", "edicao-regular", "down", "luxação-quadril"],
        "dificuldade": "médio",
        "justificativa": "Criança com T21, ecocardiograma normal, hemograma normal, tireoide normal, hipotonia e instabilidade do quadril = luxação do quadril. Conduta: USG do quadril + acompanhamento ortopédico. Resposta correta: B.",
        "opcoes_comentario": [
            "Errada — Ecocardiograma já foi realizado e normal; não há indicação de repetir.",
            "CORRETA — Hipotonia + instabilidade do quadril em T21: USG do quadril + acompanhamento ortopédico pediátrico.",
            "Errada — Tireoide já foi avaliada e normal; não há indicação de USG de tireoide.",
            "Errada — Hemograma normal; não há indicação de hemograma mensal."
        ]
    },
    "54": {
        "area": "Medicina da Família e Comunidade",
        "materia": "Ética Médica / Idoso",
        "tags": ["revalida", "2024", "edicao-regular", "autonomia", "idoso"],
        "dificuldade": "médio",
        "justificativa": "Paciente de 70 anos, lúcida, orientada, com independência financeira e social, que deseja decidir sobre sua saúde = respeitar autonomia. Solicitar USG transvaginal. Resposta correta: B.",
        "opcoes_comentario": [
            "Errada — Comunicar à filha viola sigilo e autonomia da paciente.",
            "CORRETA — Paciente lúcia e capaz: respeitar autonomia, privacidade e sigilo. Solicitar USG transvaginal.",
            "Errada — Exigir responsável é violação da autonomia; paciente é capaz.",
            "Errada — Conduta expectante não é indicada; paciente quer investigar."
        ]
    },
    "55": {
        "area": "Medicina da Família e Comunidade",
        "materia": "Populações Especiais / Saúde Indígena",
        "tags": ["revalida", "2024", "edicao-regular", "indígenas", "DSEI"],
        "dificuldade": "difícil",
        "justificativa": "DSEIs consideram distribuição demográfica tradicional que pode não coincidir com limites estaduais. Equipes de saúde da família ribeirinhas não respeitam esses limites estaduais. Resposta correta: A.",
        "opcoes_comentario": [
            "CORRETA — DSEIs são delimitados pela distribuição demográfica tradicional indígena, que pode não coincidir com limites estaduais.",
            "Errada — Demarcações de áreas indígenas não resolvem todos os problemas de vulnerabilidade.",
            "Errada — Desnutrição infantil é frequente tanto em populações indígenas quanto ribeirinhas.",
            "Errada — Populações ribeirinhas mantêm práticas tradicionais de saúde."
        ]
    },
    "56": {
        "area": "Medicina da Família e Comunidade",
        "materia": "Saúde Mental / Adolescente",
        "tags": ["revalida", "2024", "edicao-regular", "anorexia-nervosa", "adolescente"],
        "dificuldade": "fácil",
        "justificativa": "Adolescente com perda de peso significativa, amenorreia 4 meses, prática excessiva de exercícios, dietas de redes sociais = anorexia nervosa. Tratamento: psicoterapia. Resposta correta: C.",
        "opcoes_comentario": [
            "Errada — Bulimia apresenta episódios de ingesta com purgação; não há relato de vômitos autoprovocados.",
            "Errada — Hipertireoidismo não explica perda de peso com restrição alimentar.",
            "CORRETA — Restrição alimentar + perda de peso + amenorreia + prática excessiva de exercícios = anorexia nervosa. Psicoterapia é tratamento.",
            "Errada — Transtorno de purgação apresenta purgação sem episódios de ingesta compensatória."
        ]
    },
    "57": {
        "area": "Cirurgia",
        "materia": "Ortopedia / Infecção",
        "tags": ["revalida", "2024", "edicao-regular", "osteomielite", "prótese"],
        "dificuldade": "difícil",
        "justificativa": "Paciente com cirurgia prévia no fêmur, dor, edema, hiperemia e febre = suspeita de osteomielite. RM é exame de eleição para diagnóstico. Resposta correta: A.",
        "opcoes_comentario": [
            "CORRETA — Dor + edema + hiperemia + febre em local de cirurgia prévia = suspeita de osteomielite. RM é padrão-ouro.",
            "Errada — Radiografia pode ser normal nas fases iniciais; artrite séptica apresenta comprometimento articular.",
            "Errada — USG com punção articular é para artrite séptica, não osteomielite.",
            "Errada — Cintilografia tem alta sensibilidade mas baixa especificidade; osteoartrose não apresenta febre."
        ]
    },
    "58": {
        "area": "Pediatria",
        "materia": "Endocrinologia / Emergência",
        "tags": ["revalida", "2024", "edicao-regular", "cetoacidose-diabética", "criança"],
        "dificuldade": "difícil",
        "justificativa": "Criança com DM1, glicemia 300, pH 7,19, HCO3 15 = cetoacidose diabética. Níveis reduzidos de insulina (causa) e potássio total (deslocamento intracelular). Resposta correta: A.",
        "opcoes_comentario": [
            "CORRETA — CAD: deficiência absoluta de insulina causa hiperglicemia e cetoacidose; potássio desloca para intracelular, reduzindo o total.",
            "Errada — Cortisol não está reduzido na CAD; pode estar elevado.",
            "Errada — Sódio pode estar pseudobaquixado (hipernatremia dilucional), não reduzido.",
            "Errada — Glucagon pode estar elevado, não reduzido."
        ]
    },
    "59": {
        "area": "Ginecologia e Obstetrícia",
        "materia": "Menopausa / Terapia Hormonal",
        "tags": ["revalida", "2024", "edicao-regular", "menopausa", "THS", "tabagismo"],
        "dificuldade": "difícil",
        "justificativa": "Mulher de 54 anos na menopausa, tabagista, com HAS, com fogachos e secura vaginal. THS sistêmica é contraindicada (tabagismo + HAS = risco cardiovascular). Indicado: estriol vaginal. Resposta correta: A.",
        "opcoes_comentario": [
            "CORRETA — Tabagista + HAS = contraindicação para THS sistêmica. Estriol vaginal local é seguro para sintomas urogenitais.",
            "Errada — THS oral é contraindicada em tabagistas (risco tromboembólico).",
            "Errada — THS é contraindicada, mas orientar mudanças não resolve fogachos.",
            "Errada — THS transdérmica tem menor risco, mas ainda é contraindicada em tabagistas com HAS."
        ]
    },
    "60": {
        "area": "Medicina da Família e Comunidade",
        "materia": "Epidemiologia / Diagnóstico",
        "tags": ["revalida", "2024", "edicao-regular", "PPV", "sensibilidade", "especificidade"],
        "dificuldade": "difícil",
        "justificativa": "Prevalência 10%, sensibilidade 80%, falso-positivo 20%. PPV = (0,8 × 0,1) / [(0,8 × 0,1) + (0,2 × 0,9)] = 0,08 / (0,08 + 0,18) = 0,08/0,26 ≈ 31%. Resposta correta: A.",
        "opcoes_comentario": [
            "CORRETA — PPV = (sensibilidade × prevalência) / [(sens × prev) + (1 - especificidade) × (1 - prevalência)] = 31%.",
            "Errada — 97% seria o VPP se a sensibilidade e especificidade fossem muito altas.",
            "Errada — 69% seria o VNN (valor preditivo negativo).",
            "Errada — 80% é a sensibilidade, não o VPP."
        ]
    },
    "61": {
        "area": "Clínica Médica",
        "materia": "Psiquiatria / Transtornos de Humor",
        "tags": ["revalida", "2024", "edicao-regular", "depressão", "pânico"],
        "dificuldade": "difícil",
        "justificativa": "Homem com humor deprimido há 2 meses + 2 crises de pânico súbitas + insônia + perda de appetite + fadiga = transtorno depressivo com ataques de pânico. Resposta correta: D.",
        "opcoes_comentario": [
            "Errada — Transtorno de pânico com agorafobia: as crises não são desencadeadas por situações.",
            "Errada — Transtorno bipolar requer episódios de mania/hipomania; aqui há apenas depressão.",
            "Errada — TAG apresenta preocupação exagerada, não humor deprimido.",
            "CORRETA — Humor deprimido + ansiedade + crises de pânico súbitas + alterações neurovegetativas = transtorno depressivo com ataques de pânico."
        ]
    },
    "62": {
        "area": "Cirurgia",
        "materia": "Pneumologia / Pneumologia Intervencionista",
        "tags": ["revalida", "2024", "edicao-regular", "nódulo-pulmonar", "tabagista"],
        "dificuldade": "médio",
        "justificativa": "Tabagista com nódulo pulmonar solitário calcificado de 1,5cm. Nódulos calcificados geralmente são benignos. Conduta: acompanhamento ambulatorial. Resposta correta: C.",
        "opcoes_comentario": [
            "Errada — Ressecção cirúrgica é para nódulos de alto risco ou crescimento documentado.",
            "Errada — Broncoscopia pode ser considerada, mas nódulo calcificado é provavelmente benigno.",
            "CORRETA — Nódulo pulmonar solitário calcificado em tabagista: acompanhamento ambulatorial com TC de controle.",
            "Errada — Biópsia é para nódulos suspeitos; calcificação sugere benignidade."
        ]
    },
    "63": {
        "area": "Pediatria",
        "materia": "Pneumologia / Laringotraqueíte",
        "tags": ["revalida", "2024", "edicao-regular", "laringotraqueíte", "estridor"],
        "dificuldade": "fácil",
        "justificativa": "Bebê de 24 dias com obstrução nasal, coriza, estridor, saturação 91% = laringotraqueíte (papilomatose laringea ou laringite). Conduta: hidratação + oxigênio + higiene nasal. Resposta correta: B.",
        "opcoes_comentario": [
            "Errada — Antibiótico e corticoide não são indicados para laringite viral.",
            "CORRETA — Laringite em lactente: hidratação + oxigênio suplementar + higiene nasal.",
            "Errada — Broncodilatador é para sibilância, não estridor laringeo.",
            "Errada — Antibiótico não é indicado; o estridor é por edema viral, não bacteriano."
        ]
    },
    "64": {
        "area": "Ginecologia e Obstetrícia",
        "materia": "Endocrinologia / SOP",
        "tags": ["revalida", "2024", "edicao-regular", "SOP", "amenorreia"],
        "dificuldade": "médio",
        "justificativa": "Mulher de 30 anos com amenorreia secundária, hirsutismo, acne, IMC 27, FSH normal, TSH normal, prolactina normal = anovulação crônica hiperandrogênica (SOP). Resposta correta: D.",
        "opcoes_comentario": [
            "Errada — Falência ovariana prematura apresenta FSH elevado; aqui FSH está normal.",
            "Errada — Hipogonadismo hipogonadotrófico apresenta FSH baixo; aqui está normal.",
            "Errada — Uso prolongado de AOC pode causar amenorreia, mas o hirsutismo e acne sugerem SOP.",
            "CORRETA — Amenorreia + hirsutismo + acne + IMC elevado + FSH/TSH/prolactina normais = SOP (anovulação crônica hiperandrogênica)."
        ]
    },
    "65": {
        "area": "Medicina da Família e Comunidade",
        "materia": "Populações Especiais / Saúde Indígena",
        "tags": ["revalida", "2024", "edicao-regular", "indígenas", "respeito-cultural"],
        "dificuldade": "médio",
        "justificativa": "Criança indígena com taquipneia, tosse, febre e uso de emplastros de ervas. Respeitar a cultura, mas orientar remoção dos emplastros e iniciar tratamento parenteral em internação. Resposta correta: B.",
        "opcoes_comentario": [
            "Errada — Manter emplastros pode dificultar a avaliação e o tratamento.",
            "CORRETA — Respeitar a cultura, mas orientar remoção dos emplastros e iniciar tratamento parenteral em internação.",
            "Errada — Tratar apenas com ervas tradicionais é inadequado para infecção respiratória grave.",
            "Errada — Antibiótico domiciliar com mantença do emplastro não é adequado para quadro grave."
        ]
    },
    "66": {
        "area": "Clínica Médica",
        "materia": "Cardiologia / Arritmias",
        "tags": ["revalida", "2024", "edicao-regular", "fibrilação-atrial", "choque-elétrico"],
        "dificuldade": "difícil",
        "justificativa": "Homem de 26 anos com FC 125 bpm, ritmo irregular, ondas F no ECG, sem sinais de choque = FA. Massagem de seio carotídeo para aumentar tônus vagal e tentar reversão. Resposta correta: C.",
        "opcoes_comentario": [
            "Errada — Betabloqueador é para controle de frequência, não para reversão aguda.",
            "Errada — Desfibrilação é para fibrilação ventricular ou choque cardiogênico.",
            "CORRETA — FA sem sinais de choque: massagem de seio carotídeo pode revertar a arritmia.",
            "Errada — Lidocaína é para arritmias ventriculares, não FA."
        ]
    },
    "67": {
        "area": "Cirurgia",
        "materia": "Aparelho Digestivo / Viabiliar",
        "tags": ["revalida", "2024", "edicao-regular", "coledocolitíase", "icterícia"],
        "dificuldade": "difícil",
        "justificativa": "Mulher obesa com dor em QSD, icterícia, bilirrubina direta elevada, fosfatase alcalina aumentada, sem sinal de Murphy = suspeita de coledocolitíase. RM abdominal é mais acurácia. Resposta correta: C.",
        "opcoes_comentario": [
            "Errada — USG tem sensibilidade limitada para coledocolitíase.",
            "Errada — Radiografia simples não detecta cálculos biliares.",
            "CORRETA — RM abdominal (colangio-RM) é mais acurácia para diagnóstico de coledocolitíase.",
            "Errada — TC tem sensibilidade inferior à RM para cálculos biliares."
        ]
    },
    "68": {
        "area": "Pediatria",
        "materia": "Hematologia / Triagem Neonatal",
        "tags": ["revalida", "2024", "edicao-regular", "traço-falciforme", "triagem-neonatal"],
        "dificuldade": "fácil",
        "justificativa": "RN com teste de triagem positivo para traço falciforme. Conduta: tranquilizar pais (é heterozigose, não doença falciforme). Resposta correta: D.",
        "opcoes_comentario": [
            "Errada — Eletroforese de hemoglobina é para investigar doença falciforme, não traço.",
            "Errada — Teste de falcização e solubilidade são para triagem, não para confirmação de traço.",
            "Errada — Refazer o teste não é necessário; o resultado é confiável.",
            "CORRETA — Traço falciforme = heterozigose (HbAS). Pais devem ser tranquilizados: é condição benigna, sem anemia falciforme."
        ]
    },
    "69": {
        "area": "Ginecologia e Obstetrícia",
        "materia": "Parto / Cardiotocografia",
        "tags": ["revalida", "2024", "edicao-regular", "CTG", "trabalho-de-parto"],
        "dificuldade": "difícil",
        "justificativa": "Parturiente com CTG mostrando desacelerações do tipo precoce (com contrações) = reflexo vagal, geralmente benigno. Linha de base 110-160 bpm, variabilidade moderada. Conduta: seguir acompanhamento. Resposta correta: C.",
        "opcoes_comentario": [
            "Errada — Desacelerações precoces NÃO são do tipo precoce; a alternativa diz 'desacelerações são do tipo precoce', mas a conduta está errada.",
            "Errada — Decúbito materno e hidratação são para desacelerações variáveis, não precoces.",
            "CORRETA — Desacelerações do tipo precoce (durante contrações) = reflexo vagal, benigno. Seguir acompanhamento do trabalho de parto.",
            "Errada — Oxigênio é para desacelerações tardias com características preocupantes."
        ]
    },
    "70": {
        "area": "Ginecologia e Obstetrícia",
        "materia": "Contracepção / DIU",
        "tags": ["revalida", "2024", "edicao-regular", "DIU", "contracepção"],
        "dificuldade": "médio",
        "justificativa": "DIU hormonal pode ser usado para controle de sangramento uterino anormal, redução de dismenorreia e como método contraceptivo. Resposta correta: D.",
        "opcoes_comentario": [
            "Errada — O MS RECOMENDA a inserção do DIU por enfermeiros treinados.",
            "Errada — A inserção do DIU pode ser feita após aborto, com precautions.",
            "Errada — DIU de cobre como anticoncepcional de emergência: até 5 dias após coito, não 7.",
            "CORRETA — DIU hormonal: indicações incluem contracepção, controle de sangramento e redução de dismenorreia."
        ]
    },
    "71": {
        "area": "Clínica Médica",
        "materia": "Neurologia / Infectologia",
        "tags": ["revalida", "2024", "edicao-regular", "toxoplasmose-cerebral", "HIV"],
        "dificuldade": "difícil",
        "justificativa": "Paciente com HIV, rebaixamento do nível de consciência, edema de papila bilateral, bradicardia = suspeita de toxoplasmose cerebral ou outra oportunista. TC de crânio é conduta inicial. Resposta correta: C.",
        "opcoes_comentario": [
            "Errada — Punção lombar é arriscada com edema de papila (risco de herniação).",
            "Errada — EEG é para investigação de crises convulsivas, não para avaliação de rebaixamento de consciência.",
            "CORRETA — HIV + rebaixamento de consciência + edema de papila: TC de crânio é urgente para excluir massas (toxoplasmose, linfoma).",
            "Errada — Contagem de CD4 e carga viral são importantes, mas não são conduta imediata para rebaixamento de consciência."
        ]
    },
    "72": {
        "area": "Cirurgia",
        "materia": "Urologia / Profilaxia",
        "tags": ["revalida", "2024", "edicao-regular", "antibioticoprofilaxia", "cirurgia-eletiva"],
        "dificuldade": "difícil",
        "justificativa": "Paciente nefrectomizado, com hérnia incisional, cirurgia eletiva. Cefazolina 2g EV 60min antes + 1g intraoperatória de 4/4h até fechar a pele. Resposta correta: A.",
        "opcoes_comentario": [
            "CORRETA — Cirurgia limpa em paciente com fatores de risco: cefazolina 2g + doses intraoperatórias, sem manutenção no PO.",
            "Errada — Metronidazol é para cirurgia colorretal, não urológica.",
            "Errada — Manter por 72h no PO é excessivo; antibioticoprofilaxia deve ser descontinuada em 24h.",
            "Errada — Cefazolina + metronidazol é para cirurgia colorretal."
        ]
    },
    "73": {
        "area": "Pediatria",
        "materia": "Dermatologia / Alergia",
        "tags": ["revalida", "2024", "edicao-regular", "dermatite-atópica", "atopia"],
        "dificuldade": "fácil",
        "justificativa": "Lactente com lesão eczematosa em face (exceto maciço central), pescoço e fossa cubital, com história de atopia familiar = dermatite atópica. Resposta correta: A.",
        "opcoes_comentario": [
            "CORRETA — Eczema em face (exceto maciço central), pescoço e flexuras com história atópica = dermatite atópica.",
            "Errada — Tinea corporis apresenta lesão anular com borda ativa.",
            "Errada — Escabiose apresenta lesões lineares por escavação do ácaro.",
            "Errada — Psoríase apresenta placas descamativas em extensões."
        ]
    },
    "74": {
        "area": "Ginecologia e Obstetrícia",
        "materia": "Parto / Assistência",
        "tags": ["revalida", "2024", "edicao-regular", "parto-cesáreo", "distocia"],
        "dificuldade": "difícil",
        "justificativa": "Primígesta em trabalho de parto com exaustão, contrações ineficientes, bradicardia fetal, líquido meconial = sofrimento fetal. Indicar cesáreo de urgência. Resposta correta: A.",
        "opcoes_comentario": [
            "CORRETA — Bradicardia fetal + líquido meconial + contrações ineficientes = sofrimento fetal. Cesáreo de urgência.",
            "Errada — Fórceps é opção quando há indicação de conclusão rápida, mas com bradicardia e meconio, cesáreo é preferencial.",
            "Errada — Nova dose de ocitocina pode piorar a bradicardia fetal.",
            "Errada — Aguardar 3 horas é arriscado com bradicardia fetal e meconio."
        ]
    },
    "75": {
        "area": "Medicina da Família e Comunidade",
        "materia": "Epidemiologia / Métodos de Estudo",
        "tags": ["revalida", "2024", "edicao-regular", "estudo-transversal", "PNS"],
        "dificuldade": "fácil",
        "justificativa": "Pesquisa Nacional de Saúde (PNS) é inquérito domiciliar de base populacional, que avalia morbidade e estilo de vida em um momento = estudo transversal. Resposta correta: B.",
        "opcoes_comentario": [
            "Errada — Coorte segue indivíduos ao longo do tempo; PNS é em um momento.",
            "CORRETA — Inquérito domiciliar que avalia exposição e desfecho em um momento = estudo transversal.",
            "Errada — Experimental requer intervenção; PNS é observacional.",
            "Errada — Caso-controle compara grupos com/sem desfecho; PNS avalia população geral."
        ]
    },
    "76": {
        "area": "Clínica Médica",
        "materia": "Dermatologia / Farmacologia",
        "tags": ["revalida", "2024", "edicao-regular", "farmacodermia", "alergia-medicamentosa"],
        "dificuldade": "fácil",
        "justificativa": "Paciente com lesões papuloeritematosas após uso de naproxeno = farmacodermia. Conduta: suspender naproxeno + anti-histamínico VO. Resposta correta: C.",
        "opcoes_comentario": [
            "Errada — Doença do选拝 é reação de hipersensibilidade tardia; não se mantém o fármaco.",
            "Errada — Anafilaxia apresenta hipotensão, broncoespasmo; aqui os sinais vitais são normais.",
            "CORRETA — Lesões papuloeritematosas após fármaco = farmacodermia. Suspender o agente + anti-histamínico VO.",
            "Errada — Dermatite atópica é doença crônica; anti-histamínico IV não é necessário."
        ]
    },
    "77": {
        "area": "Clínica Médica",
        "materia": "Gastroenterologia / Pâncreas",
        "tags": ["revalida", "2024", "edicao-regular", "pancreatite-crônica", "tabagismo"],
        "dificuldade": "difícil",
        "justificativa": "Homem de 57 anos, tabagista e etilista, com dor abdominal, emagrecimento, diarreia gordurosa, hipocalcemia, anemia = pancreatite crônica. Conduta: analgesia e orientação dietética. Resposta correta: B.",
        "opcoes_comentario": [
            "Errada — Pancreatite aguda seria apresentação súbita com dor intensa; aqui a evolução é crônica.",
            "CORRETA — Dor + emagrecimento + diarreia gordurosa + hipocalcemia em tabagista/etilista = pancreatite crônica.",
            "Errada — Hepatite alcoólica apresenta hepatomegalia dolorosa e icterícia.",
            "Errada — Cirrose apresenta ascite e varizes; não diarreia gordurosa."
        ]
    },
    "78": {
        "area": "Pediatria",
        "materia": "Reumatologia / Vasculite",
        "tags": ["revalida", "2024", "edicao-regular", "vasculite-IgA", "púrpura"],
        "dificuldade": "difícil",
        "justificativa": "Criança com púrpura palpável em membros inferiores + artralgia + dor abdominal + enterorréia após amigdalite = vasculite por IgA (púrpura de Henoch-Schönlein). Resposta correta: D.",
        "opcoes_comentario": [
            "Errada — Poliarterite nodosa é mais comum em adultos.",
            "Errada — Arterite de Takayasu compromete grandes vasos e apresenta diferença de PA entre membros.",
            "Errada — Kawasaki requer febre ≥5 dias + critérios maiores; aqui há púrpura palpável.",
            "CORRETA — Púrpura palpável + artralgia + dor abdominal + enterorréia = vasculite por IgA."
        ]
    },
    "79": {
        "area": "Ginecologia e Obstetrícia",
        "materia": "Puerpério / Lactação",
        "tags": ["revalida", "2024", "edicao-regular", "mastite", "puerpério"],
        "dificuldade": "fácil",
        "justificativa": "Puérpera com dor, hiperemia, calor e febre na mama direita, sem sinais de flutuação = mastite. Conduta: analgesia + manutenção da amamentação + antibioticoterapia VO. Resposta correta: B.",
        "opcoes_comentario": [
            "Errada — Galactocele é cisto lácteo indolor, sem sinais inflamatórios.",
            "CORRETA — Mastite: dor + hiperemia + calor + febre. Manter amamentação + analgésico + antibiótico VO.",
            "Errada — Abscesso requer flutuação e drenagem; aqui não há sinais de flutuação.",
            "Errada — Ingurgitamento é dor sem febre; compressas frias e interrupção da amamentação são para ingurgitamento."
        ]
    },
    "80": {
        "area": "Medicina da Família e Comunidade",
        "materia": "Imunização / Vacinas",
        "tags": ["revalida", "2024", "edicao-regular", "vacinas", "meningite"],
        "dificuldade": "difícil",
        "justificativa": "Criança de 9 meses: 2 doses + reforço da meningocócica C conjugada; 4 anos: 2 doses + reforço; adolescente 15 anos: 1 dose + reforço da ACWY conjugada. Resposta correta: D.",
        "opcoes_comentario": [
            "Errada — 9 meses não tem apenas 1 dose; são 2 doses + reforço.",
            "Errada — 4 anos não tem 2 doses + reforço; são 2 doses + reforço. A adolescente não tem apenas 1 dose.",
            "Errada — As quantidades estão incorretas para todas as idades.",
            "CORRETA — 9 meses: 2 doses + reforço C conjugada; 4 anos: 2 doses + reforço C conjugada; 15 anos: 1 dose + reforço ACWY conjugada."
        ]
    },
    "81": {
        "area": "Clínica Médica",
        "materia": "Cardiologia / Cardiopatias",
        "tags": ["revalida", "2024", "edicao-regular", "DII", "embolia"],
        "dificuldade": "difícil",
        "justificativa": "Mulher de 26 anos com desdobramento fixo da 2ª bulha em foco pulmonar, dispneia progressiva = defeito de septo interatrial. Risco: embolia sistêmica (paradoxal). Resposta correta: C.",
        "opcoes_comentario": [
            "Errada — Estenose pulmonar apresenta sopros, não desdobramento fixo de B2.",
            "Errada — Estenose mitral apresenta desdobramento de B2 com abertura restrita, não fixo.",
            "CORRETA — Desdobramento fixo de B2 em foco pulmonar + dispneia = DSI. Risco: embolia paradoxal (sistêmica).",
            "Errada — Prolapso de valva mitral apresenta estalo sistólico, não desdobramento fixo."
        ]
    },
    "82": {
        "area": "Clínica Médica",
        "materia": "Oftalmologia / Emergência",
        "tags": ["revalida", "2024", "edicao-regular", "queimadura-química", "olho"],
        "dificuldade": "fácil",
        "justificativa": "Exposição a cal (substância cáustica) em olhos. Após lavagem, dor e visão embaçada = emergência oftalmológica. Avaliação por oftalmologista em pronto-socorro é imediata. Resposta correta: B.",
        "opcoes_comentario": [
            "Errada — Colírio lubrificante é insuficiente para queimadura química.",
            "CORRETA — Queimadura química ocular é emergência oftalmológica: avaliação imediata em pronto-socorro.",
            "Errada — Oclusão com gaze pode piorar a lesão; lavagem é a primeira conduta.",
            "Errada — A UBS não tem estrutura para manejo de queimadura química ocular."
        ]
    },
    "83": {"area": "Pediatria", "materia": "Oftalmologia Neonatal", "tags": [], "dificuldade": "médio", "justificativa": "Questão anulada pelo INEP.", "opcoes_comentario": []},
    "84": {
        "area": "Ginecologia e Obstetrícia",
        "materia": "Vulvopatia / Colposcopia",
        "tags": ["revalida", "2024", "edicao-regular", "líquen-escleroso", "vulva"],
        "dificuldade": "difícil",
        "justificativa": "Mulher de 70 anos com lesão vulvar pruriginosa, resistente a corticoides e antifúngicos, HPV negativo, líquen escleroso = suspeita de neoplasia intraepitelial vulvar. Conduta: vulvoscopia + biópsia. Resposta correta: A.",
        "opcoes_comentario": [
            "CORRETA — Lesão vulvar resistente a tratamento + HPV negativo: vulvoscopia + biópsia para excluir neoplasia.",
            "Errada — Testes alérgicos não são indicados; clobetasol é corticoide, já usado sem melhora.",
            "Errada — Cultura de fungos não é indicada; fluconazol já foi usado sem resposta.",
            "Errada — Azul de toluidina é para identificação de áreas displásicas, mas vulvectomia é muito agressiva sem diagnóstico."
        ]
    },
    "85": {
        "area": "Clínica Médica",
        "materia": "Pneumologia / Tuberculose",
        "tags": ["revalida", "2024", "edicao-regular", "tuberculose", "situação-de-rua"],
        "dificuldade": "médio",
        "justificativa": "Paciente em situação de rua com tosse, perda de peso, sudorese noturna e febre = suspeita de TB. Conduta: exame bacteriológico de escarro + testagem para HIV, hepatites e sífilis + TDO se confirmado. Resposta correta: D.",
        "opcoes_comentario": [
            "Errada — Cultura com teste de sensibilidade é para TB multirresistente; primeiro confirma TB.",
            "Errada — Radiografia pode ser normal; prescrever medicamento sem confirmação é inadequado.",
            "Errada — Encaminhar para pneumologia sem confirmação é prematuro.",
            "CORRETA — Suspeita de TB: escarro + testagem de coinfecções + TDO se confirmado."
        ]
    },
    "86": {
        "area": "Clínica Médica",
        "materia": "Nefrologia / Emergência Hipertensiva",
        "tags": ["revalida", "2024", "edicao-regular", "encefalopatia-hipertensiva", "papiledema"],
        "dificuldade": "fácil",
        "justificativa": "Homem de 50 anos com PA 190x130, desorientação, desorientação temporal e espacial = encefalopatia hipertensiva. Achado de fundo de olho: papiledema. Resposta correta: B.",
        "opcoes_comentario": [
            "Errada — Coriorretinite é achado de toxoplasmose ou sífilis, não HAS.",
            "CORRETA — PA 190/130 + desorientação = encefalopatia hipertensiva. Papiledema é achado de fundo de olho.",
            "Errada — AIT apresenta déficit focal transitório, não desorientação persistente.",
            "Errada — AVE hemorrágico apresenta déficit focal; pulso venoso espontâneo é achado de papiledema."
        ]
    },
    "87": {
        "area": "Clínica Médica",
        "materia": "Gastroenterologia / Doenças Inflamatórias",
        "tags": ["revalida", "2024", "edicao-regular", "retocolite", "CII"],
        "dificuldade": "médio",
        "justificativa": "Mulher de 25 anos com sangramento retal, diarreia com muco, urgência e tenesmo, história familiar de câncer colorretal = retocolite ulcerativa. Resposta correta: C.",
        "opcoes_comentario": [
            "Errada — Tumor colorretal seria mais comum em idosos; aqui há diarreia com muco.",
            "Errada — Doença de Crohn apresenta diarreia sem sangue, com dor cólica.",
            "CORRETA — Diarreia com sangue e muco + urgência e tenesmo + história familiar = retocolite ulcerativa.",
            "Errada — Doença hemorroidária apresenta sangramento vivo, não diarreia com muco."
        ]
    },
    "88": {
        "area": "Pediatria",
        "materia": "Pneumologia / Laringite",
        "tags": ["revalida", "2024", "edicao-regular", "laringite", "corticoide"],
        "dificuldade": "médio",
        "justificativa": "Lactente com rouquidão, tosse persistente, estridor inspiratório, tiragem intercostal = laringite aguda (crup). Conduta: corticoide parenteral + nebulização com adrenalina + internação. Resposta correta: B.",
        "opcoes_comentario": [
            "Errada — Corticoide oral e nebulização com beta-2 são para broncoespasmo, não laringite.",
            "CORRETA — Laringite com desconforto respiratório: corticoide parenteral + nebulização com adrenalina + internação.",
            "Errada — Intubação é para laringite grave com falência respiratória; aqui a criança ainda mantém saturação 96%.",
            "Errada — Corticoide inalatório e alta domiciliar são para laringite leve; aqui há tiragem e cianose."
        ]
    },
    "89": {
        "area": "Ginecologia e Obstetrícia",
        "materia": "Oncologia / Colpo Uterino",
        "tags": ["revalida", "2024", "edicao-regular", "LSIL", "HPV", "Papanicolaou"],
        "dificuldade": "fácil",
        "justificativa": "Mulher com LSIL no Papanicolaou, vacina incompleta, início de atividade sexual recente = conduta MS/INCA: colposcopia e 'ver e tratar'. Resposta correta: D.",
        "opcoes_comentario": [
            "Errada — Pesquisa de HPV não é indicada para condução de LSIL no protocolo MS/INCA.",
            "Errada — Repetir citologia em 6 meses é para ASC-US, não LSIL.",
            "Errada — Biópsia é realizada durante a colposcopia, não isoladamente.",
            "CORRETA — LSIL no Papanicolaou: colposcopia + 'ver e tratar' conforme protocolo MS/INCA."
        ]
    },
    "90": {
        "area": "Ginecologia e Obstetrícia",
        "materia": "Sangramento Uterino",
        "tags": ["revalida", "2024", "edicao-regular", "SUA", "sangramento-uterino"],
        "dificuldade": "médio",
        "justificativa": "Mulher de 42 anos com SUA, irregularidade menstrual e fogachos. Presença de lesões vaginais e colo deve ser descarta por exame físico, e gestação excluída. Resposta correta: C.",
        "opcoes_comentario": [
            "Errada — SUA é condição frequente, não rara.",
            "Errada — Histerectomia não é primeira linha; há tratamentos menos invasivos.",
            "CORRETA — SUA: descartar lesões vaginais/coloc por exame físico e excluir gestação antes de conduta.",
            "Errada — USG tem sensibilidade baixa para lesões endometriais; biópsia endometrial é mais acurácia."
        ]
    },
    "91": {
        "area": "Clínica Médica",
        "materia": "Cardiologia / Emergência",
        "tags": ["revalida", "2024", "edicao-regular", "tamponamento-cardíaco", "quimioterapia"],
        "dificuldade": "difícil",
        "justificativa": "Paciente em quimioterapia com dispneia, hipotensão, distensão jugular, bulhas hipofonéticas, baixa voltagem no ECG, P paradoxal = tamponamento cardíaco. Conduta: ecocardiografia + pericardiocentese. Resposta correta: A.",
        "opcoes_comentario": [
            "CORRETA — Triade de Beck (hipotensão + distensão jugular + bulhas abafadas) + P paradoxal = tamponamento. Eco + pericardiocentese.",
            "Errada — Enzimas cardíacas e trombólise são para IAM.",
            "Errada — Vasopressores e antibióticos são para choque séptico.",
            "Errada — Angiotomografia e anticoagulação são para tromboembolismo pulmonar."
        ]
    },
    "92": {
        "area": "Cirurgia",
        "materia": "Aparelho Digestivo / Diverticulite",
        "tags": ["revalida", "2024", "edicao-regular", "diverticulite", "abscesso"],
        "dificuldade": "difícil",
        "justificativa": "Mulher de 60 anos com diverticulose, dor em FIE, febre, plastrão palpável = diverticulite aguda com abscesso pélvico. TC com contraste é exame de confirmação. Resposta correta: D.",
        "opcoes_comentario": [
            "Errada — Colonoscopia é contraindicada na fase aguda de diverticulite (risco de perfuração).",
            "Errada — Radiografia abdominal tem baixa sensibilidade para diverticulite.",
            "Errada — Peritonite fecal seria mais grave; aqui há plastrão, indicando processo localizado.",
            "CORRETA — Diverticulite com plastrão = abscesso pélvico. TC com contraste é padrão-ouro para confirmação."
        ]
    },
    "93": {
        "area": "Medicina da Família e Comunidade",
        "materia": "Saúde da Criança / Transtorno de Aprendizagem",
        "tags": ["revalida", "2024", "edicao-regular", "transtorno-aprendizagem", "escola"],
        "dificuldade": "fácil",
        "justificativa": "Criança de 6 anos com dificuldade de aprendizagem, sem déficits sensoriais ou neurológicos = transtorno de aprendizagem específico. Conduta: avaliação psicopedagógica. Resposta correta: A.",
        "opcoes_comentario": [
            "CORRETA — Sem déficits sensoriais/neurológicos: avaliação psicopedagógica para identificar transtorno específico.",
            "Errada — 6 anos é idade adequada para avaliar transtorno de aprendizagem.",
            "Errada — Neuropediatra é indicado quando há sinais neurológicos; aqui não há.",
            "Errada — Equipe pedagógica não substitui avaliação psicopedagógica formal."
        ]
    },
    "94": {
        "area": "Ginecologia e Obstetrícia",
        "materia": "Mama / Rastreamento",
        "tags": ["revalida", "2024", "edicao-regular", "mamografia", "rastreamento"],
        "dificuldade": "fácil",
        "justificativa": "Mulher de 35 anos, IMC 32, com mastalgia e história familiar de câncer de mama. Para ≥40 anos, indicado exame clínico + mamografia anual. Resposta correta: C.",
        "opcoes_comentario": [
            "Errada — RM anual é para alto risco genético (BRCA1/2), não para rastreamento de rotina.",
            "Errada — USG bienal não é indicada para rastreamento; mamografia é o padrão.",
            "CORRETA — ≥40 anos: exame clínico + mamografia anual conforme protocolo MS.",
            "Errada — Mamografia bienal após 50 anos é protocolo de outros países; no Brasil, é anual após 40."
        ]
    },
    "95": {
        "area": "Clínica Médica",
        "materia": "Infecciologia / Dengue",
        "tags": ["revalida", "2024", "edicao-regular", "dengue", "prova-do-laço"],
        "dificuldade": "fácil",
        "justificativa": "Criança de 6 anos com febre, dores no corpo, exantema, área endêmica para dengue. Conduta: prova do laço + hidratação oral + retorno. Resposta correta: C.",
        "opcoes_comentario": [
            "Errada — Amoxicilina/clavulanato é para infecção bacteriana; dengue é viral.",
            "Errada — Otoscopia e hemograma não são prioritários; prova do laço é mais importante.",
            "CORRETA — Área endêmica + febre + dores + exantema: prova do laço + hidratação oral + retorno para reavaliação.",
            "Errada — Hidratação parenteral é para desidratação grave; aqui a criança está levemente desidratada."
        ]
    },
    "96": {
        "area": "Clínica Médica",
        "materia": "Gastroenterologia / Parasitologia",
        "tags": ["revalida", "2024", "edicao-regular", "amebíase", "disenteria"],
        "dificuldade": "difícil",
        "justificativa": "Homem com diarreia sanguinolenta crônica, tenesmo, dor abdominal, eritema nodoso, artrite migratória, viagem a área endêmica = amebíase invasiva. Pesquisa de trofozoítos de E. histolytica nas fezes. Resposta correta: D.",
        "opcoes_comentario": [
            "Errada — Colonoscopia com biópsia é para investigação de CII, não parasitária.",
            "Errada — Sorologia anti-HIV e pesquisa de Isospora/Cryptosporidium são para imunossuprimidos.",
            "Errada — Toxinas de C. difficile são para diarreia associada a antibióticos.",
            "CORRETA — Disenteria amebiana + eritema nodoso + artrite: pesquisa de trofozoítos de E. histolytica nas fezes."
        ]
    },
    "97": {
        "area": "Cirurgia",
        "materia": "Ortopedia / Coluna",
        "tags": ["revalida", "2024", "edicao-regular", "trauma-medular", "paraplegia"],
        "dificuldade": "difícil",
        "justificativa": "Paciente com perda de sensibilidade e movimento a partir da cicatriz umbilical = nível T10. Nível de lesão medular: T10. Resposta correta: C.",
        "opcoes_comentario": [
            "Errada — L2 seria preservação de membros superiores e parte do tronco.",
            "Errada — T4 seria perda de sensibilidade a partir do mamilo.",
            "CORRETA — Perda de sensibilidade a partir da cicatriz umbilical = nível T10.",
            "Errada — T12 seria perda de sensibilidade abaixo do umbigo."
        ]
    },
    "98": {
        "area": "Pediatria",
        "materia": "Neurologia / Desenvolvimento",
        "tags": ["revalida", "2024", "edicao-regular", "TEA", "autismo"],
        "dificuldade": "médio",
        "justificativa": "Lactente de 9 meses com ausência de extensão de braços para colo, pouco contato visual, história familiar de TEA = suspeita de transtorno do espectro autista. Conduta: iniciar estímulos precoces + retorno breve. Resposta correta: B.",
        "opcoes_comentario": [
            "Errada — Neuropediatria e geneticista são indicados após avaliação inicial; estímulos precoces são primeiros.",
            "CORRETA — Suspeita de TEA em lactente: estímulos precoces imediatamente + retorno breve para reavaliação.",
            "Errada — Tranquilizar a mãe e aguardar é inadequado; sinais de alerta são evidentes.",
            "Errada — Risperidona não é indicada para lactentes; tratamento é multidisciplinar."
        ]
    },
    "99": {
        "area": "Ginecologia e Obstetrícia",
        "materia": "Ginecologia / Ovário",
        "tags": ["revalida", "2024", "edicao-regular", "cisto-ovariano", "projeção-papilar"],
        "dificuldade": "difícil",
        "justificativa": "Paciente de 45 anos com cisto ovariano de 6cm com projeção papilar. Projeções papilares são critério ecográfico de malignidade. Investigação cirúrgica é indicada pela projeção papilar. Resposta correta: C.",
        "opcoes_comentario": [
            "Errada — Cistos <7cm podem ser acompanhados; o tamanho isoladamente não indica cirurgia.",
            "Errada — Idade influencia, mas não é o critério determinante.",
            "CORRETA — Projeção papilar no interior do cisto é critério ecográfico de malignidade → investigação cirúrgica.",
            "Errada — Irregularidade menstrual pode ter outras causas; projeção papilar é o achado determinante."
        ]
    },
    "100": {
        "area": "Medicina da Família e Comunidade",
        "materia": "Saúde Mental / Álcool",
        "tags": ["revalida", "2024", "edicao-regular", "uso-nocivo-álcool", "episódio-depressivo"],
        "dificuldade": "médio",
        "justificativa": "Homem com episódios de tristeza, fadiga, perda de appetite apenas nos 2 dias após ingestão excessiva de álcool. Entre os episódios, funciona normalmente. Uso nocivo de álcool (CID-10: F10.1). Resposta correta: A.",
        "opcoes_comentario": [
            "CORRETA — Sintomas depressivos apenas nos dias seguintes à ingestão excessiva, sem sintomas entre episódios = uso nocivo de álcool.",
            "Errada — Depende de álide requer consumo diário e tolerância; aqui o consumo é 2x/mês.",
            "Errada — Episódio depressivo seria presente mesmo sem ingestão de álcool.",
            "Errada — Síndrome de abstinência apresenta tremor, ansiedade, insônia; aqui são sintomas depressivos."
        ]
    }
}

# ============================================================
# GERAÇÃO DO JSON CLASSIFICADO
# ============================================================

questoes_classificadas = []
for num_str, q_raw in questoes_raw.items():
    num = int(num_str)
    if num_str in ANULADAS:
        continue

    gab = gabarito.get(num_str)
    if gab is None:
        continue

    alt_textos = [a["texto"] for a in q_raw["alternativas"]]

    classif = CLASSIFICACAO.get(num_str, {})

    questao = {
        "enunciado": q_raw["enunciado"],
        "opcoes": alt_textos,
        "indice_correta": gab,
        "prova": "REVALIDA",
        "edicao": "2024/1",
        "dificuldade": classif.get("dificuldade", "médio"),
        "ativo": True,
        "tags": classif.get("tags", ["revalida", "2024", "edicao-regular"]),
        "area": classif.get("area"),
        "materia": classif.get("materia"),
        "justificativa": classif.get("justificativa"),
        "opcoes_comentario": classif.get("opcoes_comentario"),
        "mecanismo_pergunta": None,
        "mecanismo_opcoes": None,
        "mecanismo_indice_correta": None
    }
    questoes_classificadas.append(questao)

# Salva JSON
with open("revalida_2024_1_classificado.json", "w", encoding="utf-8") as f:
    json.dump(questoes_classificadas, f, ensure_ascii=False, indent=2)

print(f"✅ Gerado revalida_2024_1_classificado.json com {len(questoes_classificadas)} questões")

# Validação
areas = {}
for q in questoes_classificadas:
    a = q.get("area") or "null"
    areas[a] = areas.get(a, 0) + 1

print("\nDistribuição por área:")
for a, c in sorted(areas.items()):
    print(f"  {a}: {c}")

with_just = sum(1 for q in questoes_classificadas if q.get("justificativa"))
with_comentario = sum(1 for q in questoes_classificadas if q.get("opcoes_comentario"))
with_edicao = sum(1 for q in questoes_classificadas if q.get("edicao"))
print(f"\nCom justificativa: {with_just}/95")
print(f"Com opcoes_comentario: {with_comentario}/95")
print(f"Com edicao: {with_edicao}/95")
