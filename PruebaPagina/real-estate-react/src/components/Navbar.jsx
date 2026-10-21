import { useState, useEffect, useRef } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { waLink } from '../lib/contacto'

// El texto del link se duplica en un atributo: el CSS lo usa para el "rodillo",
// donde la palabra sube y la misma palabra entra desde abajo.
const Rodillo = ({ children }) => <span data-texto={children}>{children}</span>

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [oculta, setOculta] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(false)
  useEffect(() => { menuRef.current = menuOpen }, [menuOpen])

  // Se esconde al bajar (el contenido pasa a ser lo único que importa) y vuelve
  // al subir (señal de que se busca algo). Nunca mientras el menú está abierto.
  useEffect(() => {
    let ultimo = window.scrollY
    let raf = 0
    const medir = () => {
      raf = 0
      const y = window.scrollY
      setScrolled(y > 60)
      if (!menuRef.current && Math.abs(y - ultimo) > 6) {
        setOculta(y > 420 && y > ultimo)
        ultimo = y
      }
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(medir) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])

  const cerrar = () => setMenuOpen(false)

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}${oculta && !menuOpen ? ' navbar--oculta' : ''}`} aria-label="Principal">
      <div className="nav-container">
        <NavLink to="/" className="nav-logo" onClick={cerrar} viewTransition aria-label="Calviño Tabuada Propiedades — Inicio">
          <img src="/LogoInicio.png" alt="" width="105" height="44" />
        </NavLink>

        <ul id="menu-principal" className={`nav-links${menuOpen ? ' open' : ''}`}>
          <li><NavLink to="/" end onClick={cerrar} viewTransition><Rodillo>Inicio</Rodillo></NavLink></li>
          <li><NavLink to="/propiedades" onClick={cerrar} viewTransition><Rodillo>Propiedades</Rodillo></NavLink></li>
          <li><NavLink to="/emprendimientos" onClick={cerrar} viewTransition><Rodillo>Emprendimientos</Rodillo></NavLink></li>
          <li><a href="/#nosotros" onClick={cerrar}><Rodillo>Nosotros</Rodillo></a></li>
          <li><Link to="/" state={{ scrollTo: 'contacto' }} onClick={cerrar}><Rodillo>Contacto</Rodillo></Link></li>
        </ul>

        <div className="nav-actions">
          <a href={waLink('general')} className="nav-cta" data-magnetic target="_blank" rel="noopener noreferrer">
            <i className="fa-brands fa-whatsapp" aria-hidden="true" /> <span>Contactanos</span>
          </a>
          <button
            type="button"
            className="hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="menu-principal"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  )
}
