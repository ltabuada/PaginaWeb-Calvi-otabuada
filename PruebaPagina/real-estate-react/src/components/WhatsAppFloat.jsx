import { useState, useEffect, useRef } from 'react'
import { WHATSAPP, waLink } from '../lib/contacto'

// Botón flotante de WhatsApp. Alquileres y consultas generales van a números
// distintos, así que primero se elige y recién después se abre el chat.
export default function WhatsAppFloat() {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef(null)

  // Cerrar al hacer clic afuera o con Escape.
  useEffect(() => {
    if (!abierto) return
    const fuera = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false) }
    const esc = (e) => { if (e.key === 'Escape') setAbierto(false) }
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', fuera); document.removeEventListener('keydown', esc) }
  }, [abierto])

  const opciones = [
    { tipo: 'alquiler', icono: 'fa-key' },
    { tipo: 'general', icono: 'fa-comments' },
  ]

  return (
    <div className={`wa-float${abierto ? ' wa-float--open' : ''}`} ref={ref}>
      <div className="wa-menu" role="menu" aria-hidden={!abierto}>
        <div className="wa-menu-head">¿Sobre qué querés consultar?</div>
        {opciones.map(({ tipo, icono }) => (
          <a
            key={tipo}
            href={waLink(tipo)}
            target="_blank"
            rel="noopener noreferrer"
            className="wa-opcion"
            role="menuitem"
            tabIndex={abierto ? 0 : -1}
            onClick={() => setAbierto(false)}
          >
            <span className="wa-opcion-icono"><i className={`fa-solid ${icono}`} /></span>
            <span className="wa-opcion-texto">
              <strong>{WHATSAPP[tipo].titulo}</strong>
              <small>{WHATSAPP[tipo].desc}</small>
              <em>{WHATSAPP[tipo].label}</em>
            </span>
          </a>
        ))}
      </div>

      <button
        type="button"
        className="wa-boton"
        onClick={() => setAbierto(v => !v)}
        aria-expanded={abierto}
        aria-label={abierto ? 'Cerrar opciones de WhatsApp' : 'Contactar por WhatsApp'}
      >
        <i className={`fa-brands fa-whatsapp${abierto ? ' wa-icono--oculto' : ''}`} />
        <i className={`fa-solid fa-xmark wa-icono-cerrar${abierto ? '' : ' wa-icono--oculto'}`} />
      </button>
    </div>
  )
}
