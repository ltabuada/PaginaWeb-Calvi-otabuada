import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-container">
        <NavLink to="/" className="nav-logo" onClick={() => setMenuOpen(false)} aria-label="Calviño Tabuada Propiedades - Inicio">
          <img src="/LogoInicio.png" alt="Calviño Tabuada Propiedades" />
        </NavLink>

        <ul className={`nav-links${menuOpen ? ' open' : ''}`}>
          <li><NavLink to="/" end onClick={() => setMenuOpen(false)}>Inicio</NavLink></li>
          <li><NavLink to="/propiedades" onClick={() => setMenuOpen(false)}>Propiedades</NavLink></li>
          <li><NavLink to="/emprendimientos" onClick={() => setMenuOpen(false)}>Emprendimientos</NavLink></li>
          <li><a href="/#nosotros" onClick={() => setMenuOpen(false)}>Nosotros</a></li>
          <li><a href="/#contacto" onClick={() => setMenuOpen(false)}>Contacto</a></li>
        </ul>

        <div className="nav-actions">
          <a href="https://wa.me/5491145713005" className="nav-cta" target="_blank" rel="noopener noreferrer">
            <i className="fa-brands fa-whatsapp" /> <span>Contactanos</span>
          </a>
          <button className="hamburger" onClick={() => setMenuOpen(o => !o)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  )
}
