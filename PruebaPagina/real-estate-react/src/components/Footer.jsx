import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/logoChiquito.png" alt="Logo" onError={e => { e.target.style.display='none' }}/>
            <p>Tu inmobiliaria de confianza en Argentina. Encontrá el hogar ideal con nosotros.</p>
            <div className="social-row">
              <a href="#" className="social-btn social-btn--dark"><i className="fa-brands fa-instagram" /></a>
              <a href="#" className="social-btn social-btn--dark"><i className="fa-brands fa-facebook-f" /></a>
              <a href="#" className="social-btn social-btn--dark"><i className="fa-brands fa-whatsapp" /></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Navegación</h4>
            <ul>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/propiedades">Propiedades</Link></li>
              <li><a href="/#nosotros">Nosotros</a></li>
              <li><a href="/#contacto">Contacto</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Propiedades</h4>
            <ul>
              <li><Link to="/propiedades?tipo=departamento">Departamentos</Link></li>
              <li><Link to="/propiedades?tipo=casa">Casas</Link></li>
              <li><Link to="/propiedades?tipo=ph">PH</Link></li>
              <li><Link to="/propiedades">Todas</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contacto</h4>
            <ul>
              <li><i className="fa-solid fa-location-dot" /> Av. Corrientes 1234, CABA</li>
              <li><i className="fa-solid fa-phone" /> +54 11 1234-5678</li>
              <li><i className="fa-solid fa-envelope" /> contacto@inmobiliaria.com</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>© 2026 Inmobiliaria. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
