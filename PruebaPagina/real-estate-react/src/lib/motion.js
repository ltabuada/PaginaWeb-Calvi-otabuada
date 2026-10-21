import { useEffect, useRef, useState } from 'react'

export const movimientoActivo = () =>
  typeof document !== 'undefined' && document.documentElement.dataset.motion === 'on'

/** Devuelve [ref, visto]: `visto` pasa a true la primera vez que el elemento entra en pantalla. */
export function useEnPantalla(umbral = 0.4) {
  const ref = useRef(null)
  const [visto, setVisto] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || visto) return
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisto(true); o.disconnect() }
    }, { threshold: umbral })
    o.observe(el)
    return () => o.disconnect()
  }, [visto, umbral])

  return [ref, visto]
}

/**
 * Cuenta de 0 a `objetivo` con desaceleración exponencial: arranca rápido y se
 * asienta, que es como se lee un número que "llega" y no uno que "corre".
 * Con movimiento reducido salta directo al valor final.
 */
export function useCuenta(objetivo, activo, { duracion = 1800, decimales = 0 } = {}) {
  const [valor, setValor] = useState(0)

  useEffect(() => {
    if (!activo) return
    if (!movimientoActivo()) { setValor(objetivo); return }
    let raf
    let inicio
    const paso = (t) => {
      inicio ??= t
      const p = Math.min((t - inicio) / duracion, 1)
      setValor(objetivo * (1 - Math.pow(1 - p, 4)))
      if (p < 1) raf = requestAnimationFrame(paso)
    }
    raf = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(raf)
  }, [objetivo, activo, duracion])

  return decimales ? valor.toFixed(decimales) : Math.round(valor)
}

/**
 * Un único IntersectionObserver para toda la app: marca `.is-in` en todo lo que
 * lleva `data-reveal`, y el CSS decide cómo entra cada variante. Devuelve la
 * función que lo desmonta.
 */
export function observarEntradas() {
  if (!movimientoActivo()) return () => {}

  const io = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) }
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0 })

  const mirar = (raiz) => {
    if (raiz.matches?.('[data-reveal]:not(.is-in)')) io.observe(raiz)
    raiz.querySelectorAll?.('[data-reveal]:not(.is-in)').forEach(el => io.observe(el))
  }
  mirar(document)

  // El contenido llega tarde (listados, rutas cargadas on demand): se observa
  // lo que se agregue después, sin volver a escanear todo el documento.
  const mo = new MutationObserver((cambios) => {
    for (const c of cambios) c.addedNodes.forEach(n => { if (n.nodeType === 1) mirar(n) })
  })
  mo.observe(document.getElementById('root'), { childList: true, subtree: true })

  return () => { io.disconnect(); mo.disconnect() }
}
