"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const options = [
    { value: "dark", Icon: Moon, label: "Escuro" },
    { value: "light", Icon: Sun, label: "Claro" },
  ] as const

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-border bg-foreground/[0.03] p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => setTheme(option.value)}
          aria-label={option.label}
          aria-pressed={mounted && theme === option.value}
          className={`flex items-center justify-center rounded-full p-1.5 transition-colors ${
            mounted && theme === option.value
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground/70"
          }`}
        >
          <option.Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  )
}
