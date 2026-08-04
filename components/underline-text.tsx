"use client"

import { useRef, type MouseEvent } from "react"

interface Props {
  text: string
  className?: string
}

/**
 * Parágrafo com sublinhado manual: selecionar um trecho aplica underline;
 * clicar num trecho já sublinhado remove. Manipula o DOM diretamente via ref
 * (fora do ciclo do React) e não persiste — some ao recarregar a página.
 */
export function UnderlineText({ text, className }: Props) {
  const ref = useRef<HTMLParagraphElement>(null)

  const handleMouseUp = () => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    if (!ref.current || !ref.current.contains(range.commonAncestorContainer)) return
    if (range.toString().trim() === "") return

    try {
      const span = document.createElement("span")
      span.className = "underline decoration-2 decoration-primary underline-offset-2"
      range.surroundContents(span)
      selection.removeAllRanges()
    } catch {
      // Seleção cruzando um sublinhado existente — ignora, tenta de novo com um trecho menor
    }
  }

  const handleClick = (e: MouseEvent<HTMLParagraphElement>) => {
    const target = e.target as HTMLElement
    if (target.tagName !== "SPAN" || !target.parentElement) return
    const parent = target.parentElement
    while (target.firstChild) parent.insertBefore(target.firstChild, target)
    parent.removeChild(target)
    parent.normalize()
  }

  return (
    <p ref={ref} onMouseUp={handleMouseUp} onClick={handleClick} className={className}>
      {text}
    </p>
  )
}
