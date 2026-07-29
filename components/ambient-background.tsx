export function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="animate-blob-1 absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-[#c6ff3a]/45 blur-[100px]" />
      <div className="animate-blob-2 absolute -right-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-[#84cc16]/40 blur-[100px]" />
      <div className="animate-blob-3 absolute left-1/2 top-1/2 h-[36rem] w-[36rem] rounded-full bg-[#bef264]/30 blur-[120px]" />
    </div>
  )
}
