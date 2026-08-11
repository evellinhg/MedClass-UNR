// Reproducción estática de una pantalla de monitor de UCI, en el mismo
// lenguaje visual del monitor en vivo (hospital-simulacao-monitor.tsx, que
// no debe tocarse) -- pero como "impreso" congelado, no animado. Se dibuja
// por código en vez de usar una foto/imagen generada por IA de un monitor
// real: así el trazado es medicamente correcto (para FV: caótico, sin
// complejos QRS discernibles, amplitud y frecuencia irregulares) y no hay
// riesgo de derechos de autor de fotos de monitores de fabricantes reales.

const LARGURA = 800
const ALTURA = 160

function pseudoAleatorio(semente: number) {
  let s = semente
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

function gerarTrazadoFV(largura: number, altura: number, pontos = 320): string {
  const aleatorio = pseudoAleatorio(42)
  const meio = altura / 2
  let fase1 = 0
  let fase2 = 0
  let fase3 = 0
  let d = `M 0 ${meio.toFixed(1)}`
  for (let i = 1; i <= pontos; i++) {
    const x = (i / pontos) * largura
    fase1 += 0.85 + aleatorio() * 0.7
    fase2 += 0.3 + aleatorio() * 0.35
    fase3 += 1.5 + aleatorio() * 1.3
    const amp = altura * 0.16 * (0.55 + aleatorio() * 0.85)
    const y = meio + Math.sin(fase1) * amp * 0.6 + Math.sin(fase2) * amp * 0.85 + Math.sin(fase3) * amp * 0.3
    d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`
  }
  return d
}

const TRAZADOS: Record<"fv", { path: string; alarma: string; corTrazado: string }> = {
  fv: {
    path: gerarTrazadoFV(LARGURA, ALTURA),
    alarma: "FIBRILACIÓN VENTRICULAR — SIN PULSO",
    corTrazado: "#2fe36f",
  },
}

interface HospitalSimulacaoImpresoMonitorProps {
  ritmo: "fv"
}

export function HospitalSimulacaoImpresoMonitor({ ritmo }: HospitalSimulacaoImpresoMonitorProps) {
  const t = TRAZADOS[ritmo]

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(#d8dade,#b6b9bf)",
        padding: "12px 16px 14px 12px",
        boxShadow: "0 2px 0 #8f949b inset, 0 8px 20px rgba(0,0,0,.5)",
      }}
    >
      <div className="overflow-hidden rounded-[3px]" style={{ background: "#000", boxShadow: "0 0 0 2px #23262b" }}>
        <div
          className="flex flex-wrap items-center gap-2 px-2 py-1"
          style={{ borderBottom: "1px solid #1c1c1c", fontFamily: "'IBM Plex Sans Condensed',sans-serif", fontSize: 10.5 }}
        >
          <span style={{ color: "#7fd0ff", fontWeight: 700 }}>Paciente, Masculino</span>
          <span style={{ color: "#ffd24a", fontWeight: 700 }}>58a</span>
          <span
            className="ml-auto rounded-[2px] px-2 py-0.5 font-bold"
            style={{ background: "#ff2323", color: "#fff", fontSize: 10.5, animation: "hs-imp-blink .5s steps(1,end) infinite" }}
          >
            {t.alarma}
          </span>
        </div>

        <div className="relative" style={{ background: "#000" }}>
          <svg viewBox={`0 0 ${LARGURA} ${ALTURA}`} preserveAspectRatio="none" className="block h-[150px] w-full sm:h-[180px]">
            <defs>
              <pattern id={`hs-imp-grid-${ritmo}`} width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#123018" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width={LARGURA} height={ALTURA} fill={`url(#hs-imp-grid-${ritmo})`} />
            <path d={t.path} fill="none" stroke={t.corTrazado} strokeWidth="2.5" />
          </svg>
          <span className="absolute left-1 top-1 text-[10px] font-bold" style={{ color: t.corTrazado }}>
            ECG II
          </span>
        </div>

        <div className="flex items-center gap-6 border-t px-3 py-2" style={{ borderColor: "#242424" }}>
          <div>
            <p className="font-bold" style={{ color: "#ff5a63", fontSize: 11 }}>
              FC
            </p>
            <p
              className="font-bold tabular-nums"
              style={{ color: "#ff5a63", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 30, lineHeight: 0.85 }}
            >
              ---
            </p>
          </div>
          <div>
            <p className="font-bold" style={{ color: "#31d6f2", fontSize: 11 }}>
              SpO₂
            </p>
            <p
              className="font-bold tabular-nums"
              style={{ color: "#31d6f2", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 30, lineHeight: 0.85 }}
            >
              - -
            </p>
          </div>
          <div>
            <p className="font-bold" style={{ color: "#ff8a92", fontSize: 11 }}>
              PA
            </p>
            <p
              className="font-bold tabular-nums"
              style={{ color: "#ff8a92", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 30, lineHeight: 0.85 }}
            >
              --/--
            </p>
          </div>
        </div>
      </div>
      <style>{`@keyframes hs-imp-blink{50%{opacity:.35}}`}</style>
    </div>
  )
}
