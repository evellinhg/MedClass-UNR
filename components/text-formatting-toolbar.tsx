"use client"

import type { RefObject } from "react"
import { Bold, Heading, Italic, Pilcrow } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  textareaRef: RefObject<HTMLTextAreaElement | null>
  value: string
  onChange: (value: string) => void
}

/** Botões de atalho para o Textarea: negrito (*palavra*), itálico (_palavra_), título de seção (# Título) e novo parágrafo. */
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

  const inserirTitulo = () => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selecionado = value.slice(start, end) || "Título"
    const antes = value.slice(0, start)
    const prefixo = antes.length > 0 && !antes.endsWith("\n") ? "\n# " : "# "
    const novoValor = `${antes}${prefixo}${selecionado}\n${value.slice(end)}`
    onChange(novoValor)
    requestAnimationFrame(() => {
      el.focus()
      const selStart = start + prefixo.length
      el.setSelectionRange(selStart, selStart + selecionado.length)
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
      <Button type="button" variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={inserirTitulo}>
        <Heading className="h-3 w-3" />
        Título
      </Button>
      <Button type="button" variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={inserirParagrafo}>
        <Pilcrow className="h-3 w-3" />
        Parágrafo
      </Button>
    </div>
  )
}
