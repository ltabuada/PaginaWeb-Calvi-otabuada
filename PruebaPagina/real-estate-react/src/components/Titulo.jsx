import { Fragment } from 'react'

/**
 * Título que se levanta palabra por palabra desde una máscara.
 *
 * `lineas` es una lista de { t: 'texto', em?: true }; cada línea nueva es un
 * salto de línea, y `em` marca el énfasis (que se resuelve por peso y color de
 * la marca, no por un segundo estilo). El texto completo viaja en `aria-label`
 * y las palabras partidas se ocultan al lector de pantalla, así lo que se
 * escucha es el título entero y no un deletreo.
 *
 * El movimiento lo dispara el observador global cuando el título entra en
 * pantalla (`data-reveal="palabras"`); sin JS el título se ve igual, completo.
 */
export default function Titulo({ as: Etiqueta = 'h2', lineas, className, retraso = 0, decorativo = false }) {
  let n = 0
  const propsA11y = decorativo
    ? { 'aria-hidden': 'true' }
    : { 'aria-label': lineas.map(l => l.t).join(' ') }

  return (
    <Etiqueta
      className={className}
      data-reveal="palabras"
      style={retraso ? { '--retraso': `${retraso}ms` } : undefined}
      {...propsA11y}
    >
      {lineas.map((linea, li) => {
        const palabras = linea.t.split(' ')
        const nodos = palabras.map((p, i) => (
          <Fragment key={`${li}-${i}-${p}`}>
            <span className="w" aria-hidden="true"><span style={{ '--i': n++ }}>{p}</span></span>
            {i < palabras.length - 1 ? ' ' : null}
          </Fragment>
        ))
        return (
          <Fragment key={li}>
            {li > 0 && <br />}
            {linea.em ? <span className="em">{nodos}</span> : nodos}
          </Fragment>
        )
      })}
    </Etiqueta>
  )
}
