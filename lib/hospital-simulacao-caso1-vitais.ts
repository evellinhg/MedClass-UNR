// Deltas de sinais vitais por decisão do Caso 1 (IAMCEST anterior), aplicados
// cumulativamente sobre a linha de base (FC 70, PA sistólica 120, SatO2 98%)
// conforme o aluno responde cada etapa. Não vem do caso1_iam.json (que só
// tem impacto_bp) -- é uma camada de interpretação clínica própria, baseada
// na farmacologia/fisiopatologia real de cada conduta:
//
//  - Etapa 3C (levantar e caminhar/flexão com dor torácica ativa): esforço
//    físico durante isquemia em curso pode precipitar arritmia e piorar a
//    isquemia -> taquicardia, queda de PA e SatO2.
//  - Etapa 5C (CPAP/reservatório 15L sem indicação, SatO2 já >90%): hiperoxia
//    causa vasoconstrição coronariana e aumenta a área de infarto (DETO2X-AMI,
//    AVOID) -> queda de PA apesar da SatO2 "melhorar" artificialmente.
//  - Etapa 7C (morfina 10mg IM em bolo, sem avaliar PA): opioide em dose alta
//    -> hipotensão e depressão respiratória (queda de SatO2).
//  - Etapa 9B (metoprolol IV rápido sem avaliar risco): betabloqueio agressivo
//    precoce aumenta risco de choque cardiogênico (lição do COMMIT) ->
//    bradicardia e hipotensão.
//  - Etapa 9C (nifedipino sublingual): di-hidropiridina de ação curta causa
//    taquicardia reflexa + hipotensão abrupta + roubo coronariano -> classicamente
//    associado a maior mortalidade no IAM.
//  - Etapa 12C (deixar a artéria culpada -- DA -- sem tratar): o infarto
//    continua evoluindo sem reperfusão -> deterioração progressiva grave.
//  - Etapa 13 (fibrilação ventricular): A = desfibrilação imediata reverte o
//    quadro (recuperação); B = atraso com drogas antes do choque agrava;
//    C = cardioversão sincronizada não dispara em FV (sem onda R) -> atraso
//    grave, quase parada.
//  - Etapa 16C (digoxina em dose alta): risco de toxicidade digitálica,
//    arritmia.
//  - Etapa 17C (insulina ultra-agressiva pra normalização estrita): risco de
//    hipoglicemia -> resposta simpática (taquicardia).
//  - Etapa 19C (suspender tudo abruptamente, incl. betabloqueador): retirada
//    abrupta de betabloqueador -> taquicardia/hipertensão rebote.
//
// Etapas puramente cognitivas/comportamentais sem efeito hemodinâmico agudo
// plausível (anamnese, prescrição de estatina, aconselhamento, seguimento
// ambulatorial etc.) ficam com delta 0 ou próximo disso -- o placar (BP) já
// penaliza a conduta subótima nesses casos, sem forçar uma reação vital
// clinicamente implausível.
export interface VitalDelta {
  fc: number
  pas: number
  spo2: number
}

export const VITAIS_BASE = { fc: 70, pas: 120, spo2: 98 }

export const CASO1_VITAIS_DELTAS: Record<number, Record<string, VitalDelta>> = {
  1: { A: { fc: 0, pas: 0, spo2: 0 }, B: { fc: 3, pas: -3, spo2: 0 }, C: { fc: 8, pas: -8, spo2: -2 } },
  2: { A: { fc: 0, pas: 0, spo2: 0 }, B: { fc: 2, pas: 0, spo2: 0 }, C: { fc: 3, pas: -3, spo2: 0 } },
  3: { A: { fc: 0, pas: 0, spo2: 0 }, B: { fc: 2, pas: 0, spo2: 0 }, C: { fc: 15, pas: -10, spo2: -3 } },
  4: { A: { fc: 0, pas: 0, spo2: 0 }, B: { fc: 5, pas: -5, spo2: 0 }, C: { fc: 10, pas: -10, spo2: -3 } },
  5: { A: { fc: 0, pas: 0, spo2: 0 }, B: { fc: 2, pas: -2, spo2: 1 }, C: { fc: 5, pas: -8, spo2: 2 } },
  6: { A: { fc: 0, pas: 0, spo2: 0 }, B: { fc: 3, pas: -2, spo2: 0 }, C: { fc: 5, pas: -5, spo2: 0 } },
  7: { A: { fc: -2, pas: -3, spo2: 0 }, B: { fc: 5, pas: 2, spo2: 0 }, C: { fc: 5, pas: -15, spo2: -5 } },
  8: { A: { fc: 0, pas: 0, spo2: 0 }, B: { fc: 3, pas: 0, spo2: 0 }, C: { fc: 5, pas: -5, spo2: 0 } },
  9: { A: { fc: 0, pas: -5, spo2: 0 }, B: { fc: -15, pas: -15, spo2: 0 }, C: { fc: 20, pas: -25, spo2: 0 } },
  10: { A: { fc: 0, pas: 0, spo2: 0 }, B: { fc: 3, pas: -3, spo2: 0 }, C: { fc: 8, pas: -8, spo2: -3 } },
  11: { A: { fc: 0, pas: 0, spo2: 0 }, B: { fc: 2, pas: -2, spo2: 0 }, C: { fc: 5, pas: -3, spo2: 0 } },
  12: { A: { fc: 0, pas: 0, spo2: 0 }, B: { fc: 5, pas: -3, spo2: 0 }, C: { fc: 15, pas: -15, spo2: -5 } },
  13: { A: { fc: -5, pas: 10, spo2: 5 }, B: { fc: -10, pas: -20, spo2: -10 }, C: { fc: -15, pas: -30, spo2: -15 } },
  14: { A: { fc: 0, pas: 0, spo2: 0 }, B: { fc: 3, pas: 0, spo2: 0 }, C: { fc: 2, pas: -2, spo2: 0 } },
  15: { A: { fc: 0, pas: 0, spo2: 0 }, B: { fc: 0, pas: 0, spo2: 0 }, C: { fc: 0, pas: 0, spo2: 0 } },
  16: { A: { fc: 0, pas: 0, spo2: 0 }, B: { fc: 0, pas: 0, spo2: 0 }, C: { fc: 10, pas: -5, spo2: 0 } },
  17: { A: { fc: 0, pas: 0, spo2: 0 }, B: { fc: 2, pas: 0, spo2: 0 }, C: { fc: 15, pas: -5, spo2: 0 } },
  18: { A: { fc: 0, pas: 0, spo2: 0 }, B: { fc: 0, pas: 0, spo2: 0 }, C: { fc: 0, pas: 0, spo2: 0 } },
  19: { A: { fc: 0, pas: 0, spo2: 0 }, B: { fc: 0, pas: 0, spo2: 0 }, C: { fc: 10, pas: 5, spo2: 0 } },
  20: { A: { fc: 0, pas: 0, spo2: 0 }, B: { fc: 0, pas: 0, spo2: 0 }, C: { fc: 0, pas: 0, spo2: 0 } },
}

export function clampVitais(v: VitalDelta & { fc: number; pas: number; spo2: number }) {
  return {
    fc: Math.max(30, Math.min(180, v.fc)),
    pas: Math.max(40, Math.min(180, v.pas)),
    spo2: Math.max(60, Math.min(100, v.spo2)),
  }
}
