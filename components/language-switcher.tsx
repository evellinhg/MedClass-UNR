"use client"

import { useLanguage, type Lang } from "@/lib/i18n"

const OPTIONS: { code: Lang; flag: string; label: string }[] = [
  { code: "pt", flag: "🇧🇷", label: "PT" },
  { code: "es", flag: "🇦🇷", label: "ES" },
]

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.03] p-0.5">
      {OPTIONS.map((option) => (
        <button
          key={option.code}
          onClick={() => setLang(option.code)}
          aria-label={option.label}
          className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors ${
            lang === option.code
              ? "bg-[#c6ff3a]/20 text-[#c6ff3a]"
              : "text-white/40 hover:bg-white/5 hover:text-white/70"
          }`}
        >
          <span>{option.flag}</span>
          <span className="hidden sm:inline">{option.label}</span>
        </button>
      ))}
    </div>
  )
}
