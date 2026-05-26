import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="" alt="Logo" onError={e => { e.target.style.display='none' }}/>
            <p>Tu inmobiliaria de confianza en Argentina. Encontrá el hogar ideal con nosotros.</p>
            <div className="social-row">
              <a href="https://www.instagram.com/calvinotabuada/" className="social-btn social-btn--dark"><i className="fa-brands fa-instagram" /></a>
              <a href="https://www.facebook.com/inmobiliaria2804" className="social-btn social-btn--dark"><i className="fa-brands fa-facebook-f" /></a>
              <a href="https://wa.me/5491145713005" className="social-btn social-btn--dark"><i className="fa-brands fa-whatsapp" /></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Navegación</h4>
            <ul>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/propiedades">Propiedades</Link></li>
              <li><a href="/#servicios">Servicios</a></li>
              <li><a href="/#nosotros">Nosotros</a></li>
              <li><a href="/#contacto">Contacto</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Nuestros Servicios</h4>
            <ul>
              <li><Link to="/propiedades?operacion=alquiler">Alquiler</Link></li>
              <li><Link to="/propiedades?operacion=venta">Compra y Venta</Link></li>
              <li><a href="/#servicios">Tasación Gratuita</a></li>
              <li><a href="/#servicios">Inversión</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contacto</h4>
            <ul>
              <li><i className="fa-solid fa-location-dot" /> Av. Mosconi 2804, Buenos Aires</li>
              <li><i className="fa-solid fa-phone" /> +54 9 11 4571-3005</li>
              <li><i className="fa-solid fa-envelope" /> calvinotabuada@hotmail.com</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>© 2026 CalviñoTabuadaPropiedades. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
