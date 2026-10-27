import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { movimientoActivo, observarEntradas } from '../lib/motion'

/**
 * Controlador global de movimiento. Se monta una sola vez dentro del router y
 * se ocupa de tres cosas que no conviene repartir por las páginas:
 *
 *  1. Revelado: un único IntersectionObserver marca `.is-in` en todo lo que
 *     lleva `data-reveal`; el CSS decide cómo entra cada variante.
 *  2. Puntero: efecto magnético en botones y foco de luz en tarjetas. Solo con
 *     mouse real (hover + pointer fine); en táctil no existe.
 *  3. Barra de progreso de lectura, arriba de todo.
 *
 * Nada de esto toca el contenido: si el JS falla o el visitante pidió
 * movimiento reducido, la página queda completa y quieta.
 */
export default function Movimiento() {
  const { pathname, hash, state } = useLocation()
  const barra = useRef(null)

  // 1 ─ Revelado al entrar en pantalla
  useEffect(() => observarEntradas(), [])

  // 2 ─ Puntero: magnetismo y foco de luz
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const magnetico = movimientoActivo()
    let raf = 0
    let ultimo = null

    const aplicar = () => {
      raf = 0
      if (!ultimo) return
      const { x, y, objetivo } = ultimo

      const luz = objetivo?.closest?.('[data-spot]')
      if (luz) {
        const r = luz.getBoundingClientRect()
        luz.style.setProperty('--mx', `${x - r.left}px`)
        luz.style.setProperty('--my', `${y - r.top}px`)
      }

      if (!magnetico) return
      // Primero se lee todo, después se escribe: sin mezclar lecturas de layout
      // con escrituras de estilo en el mismo cuadro.
      const imanes = [...document.querySelectorAll('[data-magnetic]')]
      const medidas = imanes.map(el => el.getBoundingClientRect())
      imanes.forEach((el, i) => {
        const r = medidas[i]
        const dx = x - (r.left + r.width / 2)
        const dy = y - (r.top + r.height / 2)
        const alcance = Math.max(r.width, r.height) * 0.9
        const d = Math.hypot(dx, dy)
        if (d < alcance) {
          const fuerza = (1 - d / alcance) * 0.34
          el.style.setProperty('--tx', `${(dx * fuerza).toFixed(1)}px`)
          el.style.setProperty('--ty', `${(dy * fuerza).toFixed(1)}px`)
        } else {
          el.style.setProperty('--tx', '0px')
          el.style.setProperty('--ty', '0px')
        }
      })
    }

    const mover = (e) => {
      ultimo = { x: e.clientX, y: e.clientY, objetivo: e.target }
      if (!raf) raf = requestAnimationFrame(aplicar)
    }
    const salir = () => {
      document.querySelectorAll('[data-magnetic]').forEach(el => {
        el.style.setProperty('--tx', '0px'); el.style.setProperty('--ty', '0px')
      })
    }
    window.addEventListener('pointermove', mover, { passive: true })
    document.documentElement.addEventListener('pointerleave', salir)
    return () => {
      window.removeEventListener('pointermove', mover)
      document.documentElement.removeEventListener('pointerleave', salir)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // 3 ─ Progreso de lectura
  useEffect(() => {
    let raf = 0
    const pintar = () => {
      raf = 0
      const alto = document.documentElement.scrollHeight - window.innerHeight
      const p = alto > 0 ? Math.min(window.scrollY / alto, 1) : 0
      if (barra.current) barra.current.style.transform = `scaleX(${p})`
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(pintar) }
    pintar()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [pathname])

  // Cambio de ruta: el inicio gestiona su propio scroll (destinos, apertura);
  // las demás páginas abren por arriba.
  useEffect(() => {
    if (pathname === '/' || hash || state?.scrollTo) return
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash, state])

  return <div className="progreso" aria-hidden="true"><span ref={barra} /></div>
}
