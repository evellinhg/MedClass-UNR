"use client"

// Monitor clínico estilizado como um monitor de UCI real (réplica visual do
// bezel/traçado do simulador do vendor, ver public/simuladores/*.html) --
// aqui reimplementado como componente React puro, alimentado pelos vitais
// calculados em tempo real pelo jogo de perguntas (hospital-simulacao-jogo),
// em vez do motor de física interno do simulador original. Só ECG e pletismografia
// (SpO2) são desenhados -- CO2/impedância/linha arterial não têm dado real
// nesse jogo, então não aparecem (nada de traçado decorativo sem função).

import { useEffect, useRef } from "react"

interface HospitalSimulacaoMonitorProps {
  nome: string
  idade: number
  fc: number
  pas: number
  pad: number
  spo2: number
  stElevacao: number // 0-1, desvia o segmento ST do traçado (maior = pior)
  critico: boolean
}

function gauss(t: number, mu: number, sigma: number, amp: number) {
  return amp * Math.exp(-((t - mu) ** 2) / (2 * sigma * sigma))
}

function ecgAt(t: number, hr: number, st: number) {
  const L = 60 / Math.max(30, Math.min(180, hr))
  const tt = t % L
  let v = gauss(tt, 0.11, 0.022, 0.15)
  v += gauss(tt, 0.205, 0.011, -0.1) + gauss(tt, 0.235, 0.012, 1.15) + gauss(tt, 0.268, 0.013, -0.24)
  const stAmp = st * 0.09
  if (tt > 0.28 && tt < 0.4) v += stAmp
  v += gauss(tt, 0.455, 0.055, 0.3 + stAmp * 0.5)
  return v
}

function plethAt(t: number, hr: number, pas: number) {
  const L = 60 / Math.max(30, Math.min(180, hr))
  const tt = (t % L) / L
  const amp = Math.max(0.12, Math.min(1, pas / 120))
  return amp * (Math.exp(-(((tt - 0.22) / 0.13) ** 2)) + 0.42 * Math.exp(-(((tt - 0.46) / 0.11) ** 2))) * 0.9
}

export function HospitalSimulacaoMonitor({ nome, idade, fc, pas, pad, spo2, stElevacao, critico }: HospitalSimulacaoMonitorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef({ fc, pas, spo2, stElevacao })
  stateRef.current = { fc, pas, spo2, stElevacao }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf: number
    let last = performance.now()
    let waveT = 0
    let px = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * devicePixelRatio
      canvas.height = rect.height * devicePixelRatio
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
      ctx.fillStyle = "#000"
      ctx.fillRect(0, 0, rect.width, rect.height)
    }
    resize()
    window.addEventListener("resize", resize)

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const rect = canvas.getBoundingClientRect()
      const W = rect.width
      const H = rect.height
      const lanes = 2
      const laneH = H / lanes
      const mid = [laneH * 0.55, laneH * 1.55]
      const gain = [laneH * 0.34, laneH * 0.5]
      const col = ["#2fe36f", "#31d6f2"]

      const adv = (W / 6.4) * dt
      const steps = Math.max(1, Math.round(adv))
      for (let i = 0; i < steps; i++) {
        const t0 = waveT + (i / steps) * dt
        const x = px + (i / steps) * adv
        const xi = Math.floor(x) % W
        ctx.fillStyle = "#000"
        ctx.fillRect(xi + 1, 0, 3, H)

        const { fc: fcNow, pas: pasNow, spo2: spo2Now, stElevacao: stNow } = stateRef.current
        const v = [ecgAt(t0, fcNow, stNow), plethAt(t0, fcNow, pasNow) * (spo2Now / 100)]
        for (let l = 0; l < lanes; l++) {
          const y = mid[l] - v[l] * gain[l]
          ctx.fillStyle = col[l]
          ctx.fillRect(xi, Math.max(0, Math.min(H - 1, y)), 2, 2)
        }
      }
      waveT += dt
      px = (px + adv) % W
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{ background: "linear-gradient(#d8dade,#b6b9bf)", padding: "14px 20px 16px 14px", boxShadow: "0 2px 0 #8f949b inset, 0 10px 26px rgba(0,0,0,.5)" }}
    >
      <div className="overflow-hidden rounded-[3px]" style={{ background: "#000", boxShadow: "0 0 0 2px #23262b" }}>
        {/* barra superior */}
        <div
          className="flex flex-wrap items-center gap-3 px-2 py-1"
          style={{ borderBottom: "1px solid #1c1c1c", fontFamily: "'IBM Plex Sans Condensed',sans-serif", fontSize: 10.5 }}
        >
          <span style={{ color: "#7fd0ff", fontWeight: 700 }}>{nome}</span>
          <span style={{ color: "#ffd24a", fontWeight: 700 }}>{idade}a</span>
          <span
            className="ml-auto rounded-[2px] px-3 py-0.5 font-bold"
            style={{
              background: critico ? "#ff2323" : "#0c3a19",
              color: critico ? "#fff" : "#5ecd82",
              fontSize: 11,
              animation: critico ? "hs-blink .5s steps(1,end) infinite" : undefined,
            }}
          >
            {critico ? "ALARME CRÍTICO" : "PACIENTE MONITORADO"}
          </span>
        </div>

        {/* traçados + coluna numérica */}
        <div className="grid grid-cols-[1fr_150px]">
          <div className="relative min-w-0" style={{ background: "#000" }}>
            <canvas ref={canvasRef} className="block h-[180px] w-full sm:h-[220px]" />
            <span className="absolute left-1 top-1 text-[10px] font-bold" style={{ color: "#2fe36f" }}>
              ECG
            </span>
            <span className="absolute bottom-1 left-1 text-[10px] font-bold" style={{ color: "#31d6f2" }}>
              PLETH
            </span>
          </div>

          <div style={{ borderLeft: "1px solid #242424" }} className="flex flex-col">
            <div className="flex flex-1 flex-col justify-center border-b px-2 py-1" style={{ borderColor: "#242424" }}>
              <p className="font-bold" style={{ color: "#2fe36f", fontSize: 11 }}>
                FC
              </p>
              <p
                className="text-right font-bold tabular-nums"
                style={{ color: "#2fe36f", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 40, lineHeight: 0.85 }}
              >
                {Math.round(fc)}
              </p>
              <p className="text-right" style={{ color: "#8a8a8a", fontSize: 9 }}>
                bpm
              </p>
            </div>
            <div className="flex flex-1 flex-col justify-center border-b px-2 py-1" style={{ borderColor: "#242424" }}>
              <p className="font-bold" style={{ color: "#ff8a92", fontSize: 11 }}>
                PA (NIBP)
              </p>
              <p
                className="text-right font-bold tabular-nums"
                style={{ color: "#ff8a92", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 30, lineHeight: 0.85 }}
              >
                {Math.round(pas)}/{Math.round(pad)}
              </p>
              <p className="text-right" style={{ color: "#8a8a8a", fontSize: 9 }}>
                mmHg
              </p>
            </div>
            <div className="flex flex-1 flex-col justify-center px-2 py-1">
              <p className="font-bold" style={{ color: "#31d6f2", fontSize: 11 }}>
                SpO₂
              </p>
              <p
                className="text-right font-bold tabular-nums"
                style={{ color: "#31d6f2", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 40, lineHeight: 0.85 }}
              >
                {Math.round(spo2)}
              </p>
              <p className="text-right" style={{ color: "#8a8a8a", fontSize: 9 }}>
                %
              </p>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes hs-blink{50%{opacity:.35}}`}</style>
    </div>
  )
}
