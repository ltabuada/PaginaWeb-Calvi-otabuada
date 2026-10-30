import { useState, useEffect, useRef } from 'react'
import { imgCard, imgFull } from '../lib/media'

/**
 * Recorrido a pantalla completa para emprendimientos en pozo.
 *
 * El edificio ocupa todo el fondo y se construye de abajo hacia arriba atado al
 * scroll real —continuo, no por saltos—, mientras la información pasa por
 * encima. Arranca como plano técnico sobre una retícula y termina en el render
 * a color.
 *
 * Por qué no hay fases generadas con IA: cinco generaciones son cinco edificios
 * distintos, y quien compra en pozo puede leer esas imágenes como el estado
 * real de la obra. Es siempre el mismo render; lo que cambia es cuánto se
 * muestra. Ver PLAN-EMPRENDIMIENTOS.md.
 */
export default function RecorridoObra({ emp, pasos }) {
  const [activo, setActivo] = useState(0)
  const seccion = useRef(null)
  const refs = useRef([])

  // Progreso continuo de construcción. Escribe una sola custom property por
  // frame: el navegador recompone el clip-path sin recalcular layout.
  useEffect(() => {
    const el = seccion.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.setProperty('--p', '1')
      return
    }

    let pedido = null
    const medir = () => {
      pedido = null
      const r = el.getBoundingClientRect()
      const recorrido = r.height - window.innerHeight
      if (recorrido <= 0) return

      // La obra termina de levantarse en el primer tramo; de ahí en adelante el
      // recorrido muestra el proyecto en vez de seguir construyéndolo.
      const bruto = (-r.top) / (recorrido * 0.38)
      el.style.setProperty('--p', String(Math.min(1, Math.max(0, bruto))))

      // Paso activo: el que tiene su centro más cerca del centro de pantalla.
      // Se calcula acá y no con IntersectionObserver porque un salto de scroll
      // puede no disparar el observer y dejar el texto fuera de sincronía con
      // el fondo.
      const mitad = window.innerHeight / 2
      let cerca = 0, menor = Infinity
      refs.current.forEach((paso, i) => {
        if (!paso) return
        const pr = paso.getBoundingClientRect()
        const d = Math.abs(pr.top + pr.height / 2 - mitad)
        if (d < menor) { menor = d; cerca = i }
      })
      setActivo(a => (a === cerca ? a : cerca))
    }
    const alScroll = () => { if (!pedido) pedido = requestAnimationFrame(medir) }

    medir()
    window.addEventListener('scroll', alScroll, { passive: true })
    window.addEventListener('resize', alScroll)
    return () => {
      window.removeEventListener('scroll', alScroll)
      window.removeEventListener('resize', alScroll)
      if (pedido) cancelAnimationFrame(pedido)
    }
  }, [pasos.length])

  const paso = pasos[activo] ?? pasos[0]
  const enObra = paso.plano

  return (
    <section
      className="obra"
      ref={seccion}
      aria-label={`Recorrido del proyecto ${emp.titulo}`}
    >
      {/* FONDO — ocupa la pantalla entera y queda fijo mientras se recorre */}
      <div className="obra-fondo" aria-hidden="true">
        {pasos.map((p, i) => (
          <div key={`capa-${i}`} className={`obra-capa${i === activo ? ' obra-capa--activa' : ''}`}>
            <img
              className="obra-foto"
              src={imgFull(p.img)}
              alt=""
              decoding="async"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}

        {/* La misma imagen en frío, recortada por el progreso de scroll: es la
            parte "ya construida" durante los pasos de obra. */}
        <div className={`obra-plano${enObra ? ' obra-plano--visible' : ''}`}>
          <img className="obra-foto obra-foto--frio" src={imgFull(pasos[0].img)} alt="" decoding="async" />
          <div className="obra-reticula" />
          <div className="obra-linea" />
        </div>

        <div className="obra-vineta" />
      </div>

      {/* HUD — en qué punto del recorrido va */}
      <div className="obra-hud" aria-hidden="true">
        <span className="obra-hud-num">{String(activo + 1).padStart(2, '0')}</span>
        <div className="obra-hud-barra">
          <span className="obra-hud-relleno" style={{ '--i': activo, '--total': pasos.length }} />
        </div>
        <span className="obra-hud-total">{String(pasos.length).padStart(2, '0')}</span>
      </div>

      {/* PASOS — el contenido va por encima del fondo */}
      <div className="obra-pasos">
        {pasos.map((p, i) => (
          <article
            key={p.titulo}
            ref={el => (refs.current[i] = el)}
            data-paso={i}
            className={`obra-paso${i === activo ? ' obra-paso--activo' : ''}`}
          >
            <div className="obra-tarjeta">
              <h3 className="obra-titulo">
                {p.titulo.split(' ').map((w, j) => (
                  <span key={`${j}-${w}`} className="obra-palabra" style={{ '--j': j }}>{w}&nbsp;</span>
                ))}
              </h3>
              <p className="obra-texto">{p.texto}</p>

              {p.datos?.length > 0 && (
                <ul className="obra-datos">
                  {p.datos.map((d, k) => (
                    <li key={d} style={{ '--k': k }}>
                      <i aria-hidden="true" className="fa-solid fa-check" /> {d}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* En celular el fondo fijo no tiene dónde quedarse: cada paso
                lleva su propia imagen y el recorrido se lee en vertical. */}
            <img className="obra-img-movil" src={imgCard(p.img)} alt={p.alt} loading="lazy" decoding="async" />
          </article>
        ))}
      </div>
    </section>
  )
}
