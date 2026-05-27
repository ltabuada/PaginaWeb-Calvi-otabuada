import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div style={{
              width: '160px', height: '60px', marginBottom: '1rem',
              border: '2px dashed rgba(255,255,255,0.25)', borderRadius: '8px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '4px',
              color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem',
              letterSpacing: '1px', textTransform: 'uppercase',
            }}>
              <i className="fa-regular fa-image" style={{ fontSize: '1.1rem' }} />
              <span>Logo aquí · 160×60 px</span>
            </div>

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
