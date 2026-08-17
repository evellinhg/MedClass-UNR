function renderNegrito(linha: string, keyPrefix: string) {
  const partes = linha.split(/(\*[^*]+\*)/g).filter((p) => p !== "")
  return partes.map((parte, i) =>
    parte.startsWith("*") && parte.endsWith("*") && parte.length > 2 ? (
      <strong key={`${keyPrefix}-${i}`}>{parte.slice(1, -1)}</strong>
    ) : (
      <span key={`${keyPrefix}-${i}`}>{parte}</span>
    )
  )
}

interface Props {
  text: string
  className?: string
}

/** Parágrafos separados por quebra de linha e *palavra* -> negrito. */
export function FormattedText({ text, className }: Props) {
  const paragrafos = text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p !== "")
  return (
    <div className={className}>
      {paragrafos.map((p, i) => (
        <p key={i} className={i > 0 ? "mt-3" : undefined}>
          {renderNegrito(p, `p${i}`)}
        </p>
      ))}
    </div>
  )
}
