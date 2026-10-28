import { useState, useEffect, useRef } from 'react'
import { imgCard, imgFull } from '../lib/media'

/**
 * Recorrido por scroll para emprendimientos que todavía no existen.
 *
 * El problema de un pozo es que no hay nada que fotografiar: solo renders del
 * resultado. Generar "fases de obra" con IA quedó descartado por dos razones
 * (ver PLAN-EMPRENDIMIENTOS.md): cinco generaciones son cinco edificios
 * distintos, y sobre todo, quien compra en pozo puede leer esas imágenes como
 * el estado real de la obra.
 *
 * Así que acá no se inventa nada. Es el mismo render en todo momento: arranca
 * como plano técnico y se materializa a medida que la persona baja. Se lee como
 * proyección, que es exactamente lo que es.
 */
export default function RecorridoObra({ emp, pasos }) {
  const [activo, setActivo] = useState(0)
  const refs = useRef([])

  useEffect(() => {
    const obs = new IntersectionObserver(
      entradas => {
        entradas.forEach(e => {
          if (e.isIntersecting) setActivo(Number(e.target.dataset.paso))
        })
      },
      // La banda angosta en el medio evita que dos pasos se disputen el foco.
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )
    refs.current.forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [pasos.length])

  const paso = pasos[activo] ?? pasos[0]

  return (
    <section className="obra" aria-label={`Recorrido del proyecto ${emp.titulo}`}>
      {/* La imagen queda fija mientras el texto avanza al lado. */}
      <div className="obra-visual">
        <div className="obra-visual-marco">
          {/* Capa base: el edificio proyectado, siempre presente en los pasos
              de obra. Sin esto, un revelado de 0% deja un rectángulo vacío en
              vez de mostrar lo que se va a construir. */}
          <img
            className={`obra-img obra-img--fantasma${paso.plano ? ' obra-img--activa' : ''}`}
            src={imgFull(pasos[0].img)}
            alt=""
            aria-hidden="true"
            decoding="async"
          />

          {pasos.map((p, i) => (
            <img
              key={`${i}-${p.titulo}`}
              src={imgFull(p.img)}
              alt=""
              aria-hidden="true"
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className={`obra-img${i === activo ? ' obra-img--activa' : ''}${p.plano ? ' obra-img--plano' : ''}`}
              style={{ '--revelado': p.revelado ?? '100%' }}
            />
          ))}

          {/* Retícula de plano: solo sobre los pasos que aún no se materializaron. */}
          <div className={`obra-reticula${paso.plano ? ' obra-reticula--visible' : ''}`} aria-hidden="true" />

          <div className="obra-progreso" aria-hidden="true">
            {pasos.map((p, i) => (
              <span key={p.titulo} className={`obra-punto${i === activo ? ' obra-punto--activo' : ''}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Los pasos. Son el contenido real: existen y se leen aunque el
          observador nunca llegue a correr. */}
      <div className="obra-pasos">
        {pasos.map((p, i) => (
          <article
            key={p.titulo}
            ref={el => (refs.current[i] = el)}
            data-paso={i}
            className={`obra-paso${i === activo ? ' obra-paso--activo' : ''}`}
          >
            <span className="obra-paso-indice" aria-hidden="true">
              {String(i + 1).padStart(2, '0')} / {String(pasos.length).padStart(2, '0')}
            </span>
            <h3>{p.titulo}</h3>
            <p>{p.texto}</p>

            {p.datos?.length > 0 && (
              <ul className="obra-datos">
                {p.datos.map(d => (
                  <li key={d}>
                    <i aria-hidden="true" className="fa-solid fa-check" /> {d}
                  </li>
                ))}
              </ul>
            )}

            {/* En celular la imagen fija no funciona: cada paso lleva la suya. */}
            <img className="obra-img-movil" src={imgCard(p.img)} alt={p.alt} loading="lazy" decoding="async" />
          </article>
        ))}
      </div>
    </section>
  )
}
