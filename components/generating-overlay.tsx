"use client"

import Image from "next/image"

interface GeneratingOverlayProps {
  message: string
}

export function GeneratingOverlay({ message }: GeneratingOverlayProps) {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 bg-background/90 backdrop-blur-sm">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-[#c6ff3a]/25 blur-2xl" />
        <div className="relative h-20 w-20 animate-spin [animation-duration:1.4s]">
          <Image src="/logo-icon.png" alt="" fill sizes="80px" className="object-contain drop-shadow-[0_0_12px_rgba(198,255,58,0.55)]" priority />
        </div>
      </div>
      <p className="text-center text-base font-medium text-foreground">{message}</p>
    </div>
  )
}
