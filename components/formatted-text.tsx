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

interface Props {
  text: string
  className?: string
}

/** Parágrafos separados por quebra de linha, *palavra* -> negrito, _palavra_ -> itálico, # Título -> subtítulo. */
export function FormattedText({ text, className }: Props) {
  const paragrafos = text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p !== "")
  return (
    <div className={className}>
      {paragrafos.map((p, i) => {
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
  )
}
