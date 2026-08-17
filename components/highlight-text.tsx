"use client"

import { useEffect, useRef, useState, type MouseEvent } from "react"
import { Highlighter } from "lucide-react"

interface Props {
  text: string
  className?: string
}

const CORES = [
  { nome: "Amarillo", valor: "#fef08a" },
  { nome: "Verde", valor: "#bbf7d0" },
  { nome: "Rosa", valor: "#fbcfe8" },
  { nome: "Celeste", valor: "#bfdbfe" },
  { nome: "Naranja", valor: "#fed7aa" },
]

/**
 * Parágrafo com marcador de texto manual: selecionar um trecho grifa com a
 * cor ativa; clicar num trecho já grifado remove. Manipula o DOM diretamente
 * via ref (fora do ciclo do React) e não persiste — some ao recarregar a página.
 */
function renderNegrito(linha: string, keyPrefix: string) {
  const partes = linha.split(/(\*[^*]+\*|_[^_]+_)/g).filter((p) => p !== "")
  return partes.map((parte, i) => {
    if (parte.startsWith("*") && parte.endsWith("*") && parte.length > 2) {
      return <strong key={`${keyPrefix}-${i}`}>{parte.slice(1, -1)}</strong>
    }
    if (parte.startsWith("_") && parte.endsWith("_") && parte.length > 2) {
      return <em key={`${keyPrefix}-${i}`}>{parte.slice(1, -1)}</em>
    }
    return <span key={`${keyPrefix}-${i}`}>{parte}</span>
  })
}

export function HighlightText({ text, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [corAtiva, setCorAtiva] = useState(CORES[0].valor)
  const corAtivaRef = useRef(corAtiva)
  corAtivaRef.current = corAtiva

  // No celular a seleção de texto é feita arrastando as alças nativas do
  // navegador -- o toque final quase sempre acontece na alça (UI nativa,
  // fora do nosso DOM), então mouseup/touchend no parágrafo não são
  // confiáveis. selectionchange no document dispara em qualquer dispositivo;
  // aplicamos com um debounce pra só marcar quando a seleção parar de mudar.
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null

    const aplicarSelecao = () => {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) return
      const range = selection.getRangeAt(0)
      if (!ref.current || !ref.current.contains(range.commonAncestorContainer)) return
      if (range.toString().trim() === "") return

      try {
        const span = document.createElement("span")
        span.style.backgroundColor = corAtivaRef.current
        span.style.color = "#1f2937"
        span.style.borderRadius = "3px"
        span.style.padding = "0 1px"
        span.className = "cursor-pointer"
        range.surroundContents(span)
        selection.removeAllRanges()
      } catch {
        // Seleção cruzando um trecho já marcado — ignora, tenta de novo com um trecho menor
      }
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
  }, [])

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (target.tagName !== "SPAN" || !target.parentElement) return
    const parent = target.parentElement
    while (target.firstChild) parent.insertBefore(target.firstChild, target)
    parent.removeChild(target)
    parent.normalize()
  }

  return (
    <div>
      <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
        <Highlighter className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground">Marcador de texto</span>
        <div className="flex items-center gap-1.5">
          {CORES.map((cor) => (
            <button
              key={cor.valor}
              type="button"
              onClick={() => setCorAtiva(cor.valor)}
              title={cor.nome}
              aria-label={cor.nome}
              className={`h-5 w-5 rounded-full border-2 transition-transform ${
                corAtiva === cor.valor ? "scale-110 border-foreground" : "border-transparent hover:scale-105"
              }`}
              style={{ backgroundColor: cor.valor }}
            />
          ))}
        </div>
      </div>
      <div
        ref={ref}
        onClick={handleClick}
        className={className}
        style={{ WebkitUserSelect: "text", WebkitTouchCallout: "default" } as React.CSSProperties}
      >
        {text
          .split(/\n+/)
          .map((p) => p.trim())
          .filter((p) => p !== "")
          .map((p, i) => {
            const isTitulo = p.startsWith("# ")
            const conteudo = isTitulo ? p.slice(2).trim() : p
            return isTitulo ? (
              <h3 key={i} className={`text-[1.05em] font-bold ${i > 0 ? "mt-4" : ""}`}>
                {renderNegrito(conteudo, `p${i}`)}
              </h3>
            ) : (
              <p key={i} className={i > 0 ? "mt-3" : undefined}>
                {renderNegrito(conteudo, `p${i}`)}
              </p>
            )
          })}
      </div>
    </div>
  )
}
