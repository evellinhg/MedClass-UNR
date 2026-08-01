"use client"

import { Users } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useLanguage } from "@/lib/i18n"

const GRUPO_URL = "https://chat.whatsapp.com/JC6z8bHq2NOLoxzY6EnjC4?s=hd&p=i&mlu=4"

function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.34.663 4.523 1.813 6.377L4 29l7.803-1.777A11.93 11.93 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.7c-1.95 0-3.766-.55-5.312-1.5l-.38-.226-4.63 1.054 1.077-4.51-.248-.393A9.65 9.65 0 0 1 5.3 15c0-5.907 4.802-10.7 10.704-10.7 5.902 0 10.696 4.793 10.696 10.7s-4.794 10.7-10.696 10.7Zm5.86-8.01c-.32-.16-1.892-.933-2.185-1.04-.293-.107-.507-.16-.72.16-.213.32-.827 1.04-1.014 1.253-.187.213-.373.24-.693.08-.32-.16-1.35-.497-2.572-1.585-.95-.847-1.592-1.893-1.778-2.213-.187-.32-.02-.493.14-.653.144-.143.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.733-.986-2.373-.26-.626-.524-.54-.72-.55l-.613-.01c-.213 0-.56.08-.853.4-.293.32-1.12 1.093-1.12 2.666 0 1.573 1.146 3.093 1.306 3.307.16.213 2.253 3.44 5.46 4.826.763.33 1.36.527 1.825.674.767.244 1.465.21 2.017.127.615-.092 1.892-.773 2.16-1.52.267-.746.267-1.386.187-1.52-.08-.133-.293-.213-.613-.373Z" />
    </svg>
  )
}

export function WhatsappHeaderButtons() {
  const { t } = useLanguage()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={GRUPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.whatsapp.grupo}
          className="group relative flex h-9 w-9 items-center justify-center rounded-full bg-[#0d2a1a] text-[#25D366] transition-all hover:scale-110 hover:bg-[#0f3a22] hover:shadow-[0_0_12px_2px_rgba(37,211,102,0.65)]"
        >
          <WhatsappIcon className="h-5 w-5 fill-current drop-shadow-[0_0_4px_rgba(37,211,102,0.9)] transition-transform group-hover:scale-110" />
          <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-card ring-1 ring-[#25D366]/60">
            <Users className="h-2.5 w-2.5 text-[#25D366]" strokeWidth={2.5} />
          </span>
        </a>
      </TooltipTrigger>
      <TooltipContent>{t.whatsapp.grupo}</TooltipContent>
    </Tooltip>
  )
}
