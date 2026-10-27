import { Link } from 'react-router-dom'
import { waLink } from '../lib/contacto'
import Titulo from './Titulo'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/LogoLargo.jpeg" alt="CalviñoTabuada Propiedades" width="110" height="46" loading="lazy" />
            <p>Más de 35 años acompañando a familias y empresas en sus decisiones inmobiliarias. Alquiler, venta, tasación e inversión.</p>
            <div className="social-row">
              <a href="https://www.instagram.com/calvinotabuada/" className="social-btn social-btn--dark" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-instagram" aria-hidden="true" /></a>
              <a href="https://www.facebook.com/inmobiliaria2804" className="social-btn social-btn--dark" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-facebook-f" aria-hidden="true" /></a>
              <a href={waLink('general')} className="social-btn social-btn--dark" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-whatsapp" aria-hidden="true" /></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Navegación</h4>
            <ul>
              <li><Link to="/" viewTransition>Inicio</Link></li>
              <li><Link to="/propiedades" viewTransition>Propiedades</Link></li>
              <li><Link to="/emprendimientos" viewTransition>Emprendimientos</Link></li>
              <li><a href="/#nosotros">Nosotros</a></li>
              <li><Link to="/" state={{ scrollTo: 'contacto' }}>Contacto</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Servicios</h4>
            <ul>
              <li><Link to="/propiedades?operacion=alquiler" viewTransition>Alquiler</Link></li>
              <li><Link to="/propiedades?operacion=venta" viewTransition>Compra y Venta</Link></li>
              <li><a href="/#servicios">Tasación Gratuita</a></li>
              <li><a href="/#servicios">Inversión</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contacto</h4>
            <ul>
              <li><i className="fa-solid fa-location-dot" aria-hidden="true" /> Av. Mosconi 2804, Buenos Aires</li>
              <li><i className="fa-solid fa-phone" aria-hidden="true" /> +54 9 11 4571-3005</li>
              <li><i className="fa-solid fa-envelope" aria-hidden="true" /> calvinotabuada@hotmail.com</li>
            </ul>
          </div>
        </div>
      </div>

      <Titulo as="div" className="footer-gigante" decorativo lineas={[{ t: 'Calviño Tabuada' }]} />

      <div className="footer-bottom">
        <div className="container">
          <p>© 2026 CalviñoTabuada Propiedades. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
