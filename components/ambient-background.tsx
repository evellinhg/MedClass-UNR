// Glow ambiente do fundo: usa radial-gradient (já nasce com transição suave
// pra transparente) em vez de `filter: blur` em círculos grandes. Blur em
// elementos grandes força o navegador a recompositar a cada frame de scroll
// no celular e trava o layout; o gradiente dá o mesmo efeito visual sem esse
// custo, porque não precisa reamostrar nada por trás dele.
export function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -left-40 -top-40 h-[32rem] w-[32rem]"
        style={{ backgroundImage: "radial-gradient(circle, rgba(198,255,58,0.45) 0%, rgba(198,255,58,0) 70%)" }}
      />
      <div
        className="absolute -right-40 top-1/4 h-[28rem] w-[28rem]"
        style={{ backgroundImage: "radial-gradient(circle, rgba(132,204,22,0.4) 0%, rgba(132,204,22,0) 70%)" }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-[36rem] w-[36rem]"
        style={{ backgroundImage: "radial-gradient(circle, rgba(190,242,100,0.3) 0%, rgba(190,242,100,0) 70%)" }}
      />
    </div>
  )
}
