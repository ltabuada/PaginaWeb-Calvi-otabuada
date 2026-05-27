import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'

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
        <Link to="/" className="nav-logo">
        </Link>

        <ul className={`nav-links${menuOpen ? ' open' : ''}`}>
          <li><NavLink to="/" end onClick={() => setMenuOpen(false)}>Inicio</NavLink></li>
          <li><NavLink to="/propiedades" onClick={() => setMenuOpen(false)}>Propiedades</NavLink></li>
          <li><a href="/#servicios" onClick={() => setMenuOpen(false)}>Servicios</a></li>
          <li><a href="/#nosotros" onClick={() => setMenuOpen(false)}>Nosotros</a></li>
          <li><a href="/#contacto" onClick={() => setMenuOpen(false)}>Contacto</a></li>
        </ul>

        <div className="nav-actions">
          <button className="hamburger" onClick={() => setMenuOpen(o => !o)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  )
}
