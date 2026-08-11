// Reproducción estática de una pantalla de monitor multiparamétrico de UCI
// (estilo ancho, varias líneas apiladas + columna numérica a la derecha +
// barra de botones abajo), inspirada en el diseño genérico de monitores
// reales de mercado -- pero dibujada 100% por código (SVG con curvas
// suaves tipo Catmull-Rom), no es una foto ni un ícono/logo de ningún
// fabricante. Por eso el trazado sale limpio y continuo (nunca "punteado"
// como pasaba con la imagen generada por IA anteriormente) y no hay riesgo
// de derechos de autor de interfaz de un dispositivo real.
// No confundir con hospital-simulacao-monitor.tsx (el monitor EN VIVO del
// juego, que no debe tocarse) -- este es solo el "impreso" congelado.

const LARGURA = 900
const ALTURA_ECG = 130
const ALTURA_LANE = 46

function pseudoAleatorio(semente: number) {
  let s = semente
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

// Catmull-Rom -> Bezier: produce una curva suave y continua pasando por
// todos los puntos, sin los picos de alta frequencia que causaban el
// aspecto "punteado" de una polilinea con ruido de alta frequencia.
function pathSuave(pontos: [number, number][]): string {
  if (pontos.length < 2) return ""
  let d = `M ${pontos[0][0].toFixed(1)} ${pontos[0][1].toFixed(1)}`
  for (let i = 0; i < pontos.length - 1; i++) {
    const p0 = pontos[i === 0 ? i : i - 1]
    const p1 = pontos[i]
    const p2 = pontos[i + 1]
    const p3 = pontos[i + 2 < pontos.length ? i + 2 : i + 1]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d
}

// Ondulación caótica e irregular (sin complejos QRS discernibles, sin
// línea de base, amplitud y frecuencia variables) -- se genera con un
// paseo aleatorio suavizado hacia blancos aleatorios, no con senoides de
// alta frecuencia (esa fue la causa real del aspecto "punteado" anterior).
function gerarPontosFV(largura: number, altura: number, n = 70): [number, number][] {
  const rand = pseudoAleatorio(42)
  const meio = altura / 2
  const pontos: [number, number][] = [[0, meio]]
  let y = meio
  for (let i = 1; i <= n; i++) {
    const x = (i / n) * largura
    const alvo = meio + (rand() - 0.5) * altura * 0.8
    y = y + (alvo - y) * (0.4 + rand() * 0.35)
    pontos.push([x, y])
  }
  return pontos
}

function gerarLinhaPlana(largura: number, altura: number, semente: number, ruido: number, n = 40): [number, number][] {
  const rand = pseudoAleatorio(semente)
  const meio = altura / 2
  const pontos: [number, number][] = []
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * largura
    pontos.push([x, meio + (rand() - 0.5) * ruido])
  }
  return pontos
}

const TRAZADO_FV = pathSuave(gerarPontosFV(LARGURA, ALTURA_ECG))
const TRAZADO_ABP = pathSuave(gerarLinhaPlana(LARGURA, ALTURA_LANE, 7, 3))
const TRAZADO_PLETH = pathSuave(gerarLinhaPlana(LARGURA, ALTURA_LANE, 13, 2))
const TRAZADO_CO2 = pathSuave(gerarLinhaPlana(LARGURA, ALTURA_LANE, 19, 2))

const TRAZADOS: Record<"fv", { alarma: string }> = {
  fv: { alarma: "FIBRILACIÓN VENTRICULAR — SIN PULSO" },
}

interface HospitalSimulacaoImpresoMonitorProps {
  ritmo: "fv"
}

function Grade({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={id} width="22" height="22" patternUnits="userSpaceOnUse">
        <path d="M 22 0 L 0 0 0 22" fill="none" stroke="#0f1f14" strokeWidth="1" />
      </pattern>
    </defs>
  )
}

export function HospitalSimulacaoImpresoMonitor({ ritmo }: HospitalSimulacaoImpresoMonitorProps) {
  const t = TRAZADOS[ritmo]

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(#232427,#0c0d0f)",
        padding: "10px 12px 12px",
        boxShadow: "0 2px 0 #3a3c40 inset, 0 10px 26px rgba(0,0,0,.6)",
      }}
    >
      <div className="mb-2 flex items-center gap-1.5 px-1">
        <span className="h-2 w-2 rounded-full" style={{ background: "#2f8fe0" }} />
        <span className="h-2 w-2 rounded-full" style={{ background: "#e08a2f" }} />
        <span className="ml-2 h-1.5 flex-1 rounded-full" style={{ background: "#3a3c40" }} />
      </div>

      <div className="overflow-hidden rounded-[3px]" style={{ background: "#000", boxShadow: "0 0 0 2px #1a1c1f" }}>
        <div
          className="flex flex-wrap items-center gap-2 px-2 py-1"
          style={{ borderBottom: "1px solid #1c1c1c", fontFamily: "'IBM Plex Sans Condensed',sans-serif", fontSize: 10.5 }}
        >
          <span style={{ color: "#7fd0ff", fontWeight: 700 }}>Paciente, Masculino</span>
          <span style={{ color: "#ffd24a", fontWeight: 700 }}>58a</span>
          <span style={{ color: "#5a5f66" }}>DERIVACIÓN II</span>
          <span
            className="ml-auto rounded-[2px] px-2 py-0.5 font-bold"
            style={{ background: "#ff2323", color: "#fff", fontSize: 10.5, animation: "hs-imp-blink .5s steps(1,end) infinite" }}
          >
            {t.alarma}
          </span>
        </div>

        <div className="grid grid-cols-[1fr_150px]">
          {/* pistas de trazado */}
          <div className="min-w-0" style={{ background: "#000" }}>
            <div className="relative border-b" style={{ borderColor: "#161616" }}>
              <svg viewBox={`0 0 ${LARGURA} ${ALTURA_ECG}`} preserveAspectRatio="none" className="block h-[128px] w-full sm:h-[150px]">
                <Grade id="hs-imp-grid-ecg" />
                <rect width={LARGURA} height={ALTURA_ECG} fill="url(#hs-imp-grid-ecg)" />
                <path
                  d={TRAZADO_FV}
                  fill="none"
                  stroke="#2fe36f"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <span className="absolute left-1 top-1 text-[10px] font-bold" style={{ color: "#2fe36f" }}>
                ECG II
              </span>
            </div>

            <div className="relative border-b" style={{ borderColor: "#161616" }}>
              <svg viewBox={`0 0 ${LARGURA} ${ALTURA_LANE}`} preserveAspectRatio="none" className="block h-[44px] w-full">
                <path
                  d={TRAZADO_ABP}
                  fill="none"
                  stroke="#ff5a63"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <span className="absolute left-1 top-0.5 text-[9px] font-bold" style={{ color: "#ff5a63" }}>
                ABP
              </span>
              <span className="absolute right-1 top-0.5 text-[8px] font-medium" style={{ color: "#5a5f66" }}>
                sin señal
              </span>
            </div>

            <div className="relative border-b" style={{ borderColor: "#161616" }}>
              <svg viewBox={`0 0 ${LARGURA} ${ALTURA_LANE}`} preserveAspectRatio="none" className="block h-[44px] w-full">
                <path
                  d={TRAZADO_PLETH}
                  fill="none"
                  stroke="#31d6f2"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <span className="absolute left-1 top-0.5 text-[9px] font-bold" style={{ color: "#31d6f2" }}>
                PLETH
              </span>
              <span className="absolute right-1 top-0.5 text-[8px] font-medium" style={{ color: "#5a5f66" }}>
                sin señal
              </span>
            </div>

            <div className="relative">
              <svg viewBox={`0 0 ${LARGURA} ${ALTURA_LANE}`} preserveAspectRatio="none" className="block h-[44px] w-full">
                <path
                  d={TRAZADO_CO2}
                  fill="none"
                  stroke="#c9c07a"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <span className="absolute left-1 top-0.5 text-[9px] font-bold" style={{ color: "#c9c07a" }}>
                CO₂
              </span>
              <span className="absolute right-1 top-0.5 text-[8px] font-medium" style={{ color: "#5a5f66" }}>
                sin señal
              </span>
            </div>
          </div>

          {/* columna numérica */}
          <div style={{ borderLeft: "1px solid #1a1a1a" }} className="flex flex-col">
            <div className="flex flex-1 flex-col justify-center border-b px-2 py-1" style={{ borderColor: "#1a1a1a" }}>
              <p className="font-bold" style={{ color: "#2fe36f", fontSize: 10.5 }}>
                FC
              </p>
              <p
                className="text-right font-bold tabular-nums"
                style={{ color: "#2fe36f", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, lineHeight: 0.85 }}
              >
                ---
              </p>
            </div>
            <div className="flex flex-1 flex-col justify-center border-b px-2 py-1" style={{ borderColor: "#1a1a1a" }}>
              <p className="font-bold" style={{ color: "#31d6f2", fontSize: 10.5 }}>
                SpO₂
              </p>
              <p
                className="text-right font-bold tabular-nums"
                style={{ color: "#31d6f2", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, lineHeight: 0.85 }}
              >
                - -
              </p>
            </div>
            <div className="flex flex-1 flex-col justify-center border-b px-2 py-1" style={{ borderColor: "#1a1a1a" }}>
              <p className="font-bold" style={{ color: "#ff8a92", fontSize: 10.5 }}>
                PA (NIBP)
              </p>
              <p
                className="text-right font-bold tabular-nums"
                style={{ color: "#ff8a92", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, lineHeight: 0.85 }}
              >
                --/--
              </p>
            </div>
            <div className="flex flex-1 flex-col justify-center px-2 py-1">
              <p className="text-center font-bold tabular-nums" style={{ color: "#ff5a63", fontSize: 15, letterSpacing: 1 }}>
                (-?-)
              </p>
            </div>
          </div>
        </div>

        {/* barra de botones (decorativa, generica -- nao reproduz interface de nenhum fabricante) */}
        <div className="flex items-center gap-1.5 px-2 py-1.5" style={{ background: "#0c1220", borderTop: "1px solid #1a2233" }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="h-4 flex-1 rounded-sm" style={{ background: "#17233a" }} />
          ))}
        </div>
      </div>
      <style>{`@keyframes hs-imp-blink{50%{opacity:.35}}`}</style>
    </div>
  )
}
