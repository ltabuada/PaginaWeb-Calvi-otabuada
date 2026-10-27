/**
 * Cinta de texto en movimiento continuo. Es ornamento puro (aria-hidden): lo
 * que dice ya está dicho en las secciones que la rodean. Se detiene al pasar el
 * mouse por encima y con movimiento reducido queda estática.
 */
export default function Cinta({ palabras, inversa = false, contorno = false }) {
  const grupo = (k) => (
    <div className="cinta-grupo" key={k}>
      {palabras.map((p) => (
        <span className="cinta-item" key={p}>
          {p}
          <span className="cinta-marca" />
        </span>
      ))}
    </div>
  )

  return (
    <div className={`cinta${inversa ? ' cinta--inversa' : ''}${contorno ? ' cinta--contorno' : ''}`} aria-hidden="true">
      <div className="cinta-pista">{grupo('a')}{grupo('b')}</div>
    </div>
  )
}
