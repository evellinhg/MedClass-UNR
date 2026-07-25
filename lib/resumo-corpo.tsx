import { Fragment } from "react"

function renderInline(texto: string) {
  const partes = texto.split(/(\*\*.+?\*\*)/g).filter(Boolean)
  return partes.map((parte, i) => {
    if (parte.startsWith("**") && parte.endsWith("**")) {
      return <strong key={i}>{parte.slice(2, -2)}</strong>
    }
    return <Fragment key={i}>{parte}</Fragment>
  })
}

export function ResumoCorpo({ texto }: { texto: string }) {
  const blocos = texto.trim().split(/\n\s*\n/)

  return (
    <>
      {blocos.map((bloco, i) => {
        const linhas = bloco.split("\n").filter((l) => l.trim().length > 0)
        const ehLista = linhas.length > 0 && linhas.every((l) => l.trim().startsWith("- "))

        if (ehLista) {
          return (
            <ul key={i} className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-foreground/90">
              {linhas.map((linha, j) => (
                <li key={j}>{renderInline(linha.trim().slice(2))}</li>
              ))}
            </ul>
          )
        }

        return (
          <p key={i} className="mt-2 text-sm leading-relaxed text-foreground/90 first:mt-0">
            {linhas.map((linha, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {renderInline(linha)}
              </Fragment>
            ))}
          </p>
        )
      })}
    </>
  )
}
