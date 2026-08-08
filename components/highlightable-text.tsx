"use client"

import { useEffect, useRef, useState } from "react"
import { Highlighter } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TextRange {
  start: number
  end: number
}

function mergeRanges(ranges: TextRange[]): TextRange[] {
  const sorted = [...ranges].sort((a, b) => a.start - b.start)
  const merged: TextRange[] = []
  for (const r of sorted) {
    const last = merged[merged.length - 1]
    if (last && r.start <= last.end) {
      last.end = Math.max(last.end, r.end)
    } else {
      merged.push({ ...r })
    }
  }
  return merged
}

export function HighlightableText({ text }: { text: string }) {
  const containerRef = useRef<HTMLParagraphElement>(null)
  const [active, setActive] = useState(false)
  const [ranges, setRanges] = useState<TextRange[]>([])

  // No celular a seleção é feita com o dedo, arrastando as alças nativas do
  // navegador -- mouseup/touchend na maioria das vezes nem chegam a disparar
  // no nosso elemento, porque quem recebe o toque final é a alça da seleção
  // (UI nativa do navegador, fora do nosso DOM). selectionchange no
  // document é o único evento que dispara de forma confiável em qualquer
  // dispositivo, então observamos ele e aplicamos a marcação com um pequeno
  // debounce (só quando a seleção parar de mudar por 350ms, senão dispararia
  // a cada milímetro de arraste).
  useEffect(() => {
    if (!active) return
    let timeout: ReturnType<typeof setTimeout> | null = null

    const aplicarSelecao = () => {
      const container = containerRef.current
      if (!container) return
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) return
      const range = selection.getRangeAt(0)
      if (!container.contains(range.commonAncestorContainer)) return

      const preRange = document.createRange()
      preRange.selectNodeContents(container)
      preRange.setEnd(range.startContainer, range.startOffset)
      const start = preRange.toString().length
      const end = start + range.toString().length

      if (end > start) {
        setRanges((prev) => mergeRanges([...prev, { start, end }]))
      }
      selection.removeAllRanges()
    }

    const onSelectionChange = () => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(aplicarSelecao, 350)
    }

    document.addEventListener("selectionchange", onSelectionChange)
    return () => {
      document.removeEventListener("selectionchange", onSelectionChange)
      if (timeout) clearTimeout(timeout)
    }
  }, [active])

  const segments: { text: string; highlighted: boolean }[] = []
  let cursor = 0
  for (const r of ranges) {
    if (r.start > cursor) segments.push({ text: text.slice(cursor, r.start), highlighted: false })
    segments.push({ text: text.slice(r.start, r.end), highlighted: true })
    cursor = r.end
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), highlighted: false })

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end gap-2">
        {ranges.length > 0 && (
          <Button type="button" size="sm" variant="ghost" onClick={() => setRanges([])}>
            Limpar marcações
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          variant={active ? "gradient" : "outline"}
          className="gap-1.5"
          onClick={() => setActive((a) => !a)}
        >
          <Highlighter className="h-3.5 w-3.5" />
          {active ? "Marcando..." : "Marca-texto"}
        </Button>
      </div>
      <p
        ref={containerRef}
        className={`select-text rounded-lg p-3 text-base font-medium leading-relaxed text-foreground sm:text-[17px] ${
          active ? "cursor-text bg-accent/30 ring-1 ring-primary/40" : ""
        }`}
        style={{ WebkitUserSelect: "text", WebkitTouchCallout: "default" }}
      >
        {segments.map((seg, i) =>
          seg.highlighted ? (
            <mark key={i} className="rounded bg-yellow-300/70 px-0.5 text-foreground">
              {seg.text}
            </mark>
          ) : (
            <span key={i}>{seg.text}</span>
          )
        )}
      </p>
    </div>
  )
}
