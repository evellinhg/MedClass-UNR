"use client"

import type { RefObject } from "react"
import { Bold, Italic, Pilcrow } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  textareaRef: RefObject<HTMLTextAreaElement | null>
  value: string
  onChange: (value: string) => void
}

/** Botões de atalho para o Textarea: negrito (*palavra*), itálico (_palavra_) e novo parágrafo. */
export function TextFormattingToolbar({ textareaRef, value, onChange }: Props) {
  const aplicarMarcador = (marcador: string) => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selecionado = value.slice(start, end) || "texto"
    const novoValor = `${value.slice(0, start)}${marcador}${selecionado}${marcador}${value.slice(end)}`
    onChange(novoValor)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + marcador.length, start + marcador.length + selecionado.length)
    })
  }

  const aplicarNegrito = () => aplicarMarcador("*")
  const aplicarItalico = () => aplicarMarcador("_")

  const inserirParagrafo = () => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const novoValor = `${value.slice(0, start)}\n${value.slice(end)}`
    onChange(novoValor)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + 1, start + 1)
    })
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button type="button" variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={aplicarNegrito}>
        <Bold className="h-3 w-3" />
        Negrito
      </Button>
      <Button type="button" variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={aplicarItalico}>
        <Italic className="h-3 w-3" />
        Itálico
      </Button>
      <Button type="button" variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={inserirParagrafo}>
        <Pilcrow className="h-3 w-3" />
        Parágrafo
      </Button>
    </div>
  )
}
