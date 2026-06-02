import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PropiedadCard from '../components/PropiedadCard'
import { useListings } from '../context/ListingsContext'
import { useConsultas } from '../context/ConsultasContext'

const SLIDES = [
  'https://imgar.zonapropcdn.com/avisos/resize/1/00/58/97/12/19/1200x1200/2049202376.jpg?isFirstImage=true',
  '/fotoSlide.jpeg',
  '',
]

export default function Home() {
  const { listingsPublicos } = useListings()
  const { addConsulta } = useConsultas()
  const navigate = useNavigate()
  const [slide, setSlide] = useState(0)
  const [buscar, setBuscar] = useState('')
  const [tipo, setTipo] = useState('')
  const [ambientes, setAmbientes] = useState('')
  const [formSent, setFormSent] = useState(false)
  const intervalRef = useRef(null)

  // Slider automático
  useEffect(() => {
    intervalRef.current = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 5000)
    return () => clearInterval(intervalRef.current)
  }, [])

  const goToSlide = (n) => {
    clearInterval(intervalRef.current)
    setSlide(n)
    intervalRef.current = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 5000)
  }

  // Animaciones scroll
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.1 })
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handleBuscar = () => {
    const params = new URLSearchParams()
    if (buscar) params.set('buscar', buscar)
    if (tipo) params.set('operacion', tipo)       // tipo state ahora guarda operacion
    if (ambientes) params.set('tipo', ambientes)  // ambientes state ahora guarda tipo
    navigate(`/propiedades${params.toString() ? '?' + params.toString() : ''}`)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    await addConsulta({
      tipo: 'general',
      nombre: fd.get('nombre') || '',
      email: fd.get('email') || '',
      telefono: fd.get('telefono') || '',
      asunto: fd.get('asunto') || 'Consulta general',
      mensaje: fd.get('mensaje') || '',
    })
    setFormSent(true)
    setTimeout(() => { setFormSent(false); e.target.reset() }, 3000)
  }

  const barrios = [...new Set(listingsPublicos.map(p => p.ubicacion.split(',')[0].trim()))].sort()
  const destacadas = listingsPublicos.filter(p => p.destacada).slice(0, 3)

  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          {SLIDES.map((src, i) => (
            <div key={i} className={`hero-slide${slide === i ? ' active' : ''}`}
              style={{ backgroundImage: `url('${src}')` }} />
          ))}
        </div>
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-tag">
            <span className="dot" /> Alquiler · Venta · Inversión
          </div>

          <img
            src="/LogoInicio.png"
            alt="Calvi Propiedades"
            style={{
              width: '100%',
              maxWidth: '860px',
              height: 'clamp(7rem, 16.5vw, 14.3rem)',
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto 1.2rem',
            }}
          />

          <p>Alquilá, comprá, vendé o tasá tu propiedad con nuestro respaldo</p>

          <div className="hero-search">
            <div className="search-field">
              <i className="fa-solid fa-location-dot" />
              <select value={buscar} onChange={e => setBuscar(e.target.value)}>
                <option value="">Barrio</option>
                {barrios.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="search-divider" />
            <div className="search-field">
              <i className="fa-solid fa-tag" />
              <select value={tipo} onChange={e => setTipo(e.target.value)}>
                <option value="">Operación</option>
                <option value="alquiler">Alquiler</option>
                <option value="venta">Venta</option>
              </select>
            </div>
            <div className="search-divider" />
            <div className="search-field">
              <i className="fa-solid fa-home" />
              <select value={ambientes} onChange={e => setAmbientes(e.target.value)}>
                <option value="">Propiedad</option>
                <option value="departamento">Departamento</option>
                <option value="casa">Casa</option>
                <option value="ph">PH</option>
                <option value="terreno">Terreno</option>
                <option value="galpon">Galpón</option>
                <option value="local">Local</option>
                <option value="oficina">Oficina</option>
                <option value="otros">Otros</option>
              </select>
            </div>
            <button className="search-btn" onClick={handleBuscar}>
              <i className="fa-solid fa-magnifying-glass" /> Buscar
            </button>
          </div>

          <div className="hero-stats">
            <div className="hero-stat"><strong>+35 años</strong><span>De experiencia</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>+120</strong><span>Obras comercializadas</span></div>
          </div>
        </div>
        <div className="hero-dots">
          {SLIDES.map((_, i) => (
            <button key={i} className={`dot-btn${slide === i ? ' active' : ''}`} onClick={() => goToSlide(i)} />
          ))}
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="categorias">
        <div className="container">
          <div className="categorias-grid">
            <Link to="/propiedades?operacion=alquiler" className="categoria-card fade-up">
              <div className="cat-icon"><i className="fa-solid fa-key" /></div>
              <h3>Alquiler</h3>
              <span className="cat-link">Ver disponibles <i className="fa-solid fa-arrow-right" /></span>
            </Link>
            <Link to="/propiedades?operacion=venta" className="categoria-card fade-up">
              <div className="cat-icon"><i className="fa-solid fa-handshake" /></div>
              <h3>Venta</h3>
              <span className="cat-link">Ver en venta <i className="fa-solid fa-arrow-right" /></span>
            </Link>
            <a href="/#servicios" className="categoria-card fade-up">
              <div className="cat-icon"><i className="fa-solid fa-calculator" /></div>
              <h3>Tasación</h3>
              <span className="cat-link">Más información <i className="fa-solid fa-arrow-right" /></span>
            </a>
            <Link to="/propiedades" className="categoria-card fade-up">
              <div className="cat-icon"><i className="fa-solid fa-chart-line" /></div>
              <h3>Inversión</h3>
              <span className="cat-link">Consultanos <i className="fa-solid fa-arrow-right" /></span>
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="servicios" id="servicios">
        <div className="container">
          <div className="section-header section-header--center fade-up">
            <div className="section-tag">Lo que hacemos</div>
            <h2>Servicios integrales<br /><span>para cada necesidad</span></h2>
          </div>
          <div className="servicios-grid">
            <div className="servicio-card fade-up">
              <div className="servicio-icon servicio-icon--alquiler">
                <i className="fa-solid fa-key" />
              </div>
              <h3>Alquiler</h3>
              <p>Selecciona dentro de nuestro catalogo. Te acompañamos desde la búsqueda hasta la firma del contrato.</p>
              <ul className="servicio-items">
                <li><i className="fa-solid fa-check" /> Búsqueda personalizada</li>
                <li><i className="fa-solid fa-check" /> Gestión documental completa</li>
                <li><i className="fa-solid fa-check" /> Asesoramiento legal incluido</li>
              </ul>
              <Link to="/propiedades?operacion=alquiler" className="servicio-link">
                Ver propiedades en alquiler <i className="fa-solid fa-arrow-right" />
              </Link>
            </div>

            <div className="servicio-card fade-up">
              <div className="servicio-icon servicio-icon--venta">
                <i className="fa-solid fa-handshake" />
              </div>
              <h3>Compra y Venta</h3>
              <p>Te orientamos y asesoramos en cada paso del proceso de tu compra/venta de una propiedad.</p>
              <ul className="servicio-items">
                <li><i className="fa-solid fa-check" /> Tasación del inmueble</li>
                <li><i className="fa-solid fa-check" /> Estrategia de publicación</li>
                <li><i className="fa-solid fa-check" /> Acompañamiento en escritura</li>
              </ul>
              <Link to="/propiedades?operacion=venta" className="servicio-link">
                Ver propiedades en venta <i className="fa-solid fa-arrow-right" />
              </Link>
            </div>

            <div className="servicio-card fade-up">
              <div className="servicio-icon servicio-icon--tasacion">
                <i className="fa-solid fa-calculator" />
              </div>
              <h3>Tasación Gratuita</h3>
              <p>¿Querés saber cuánto vale tu propiedad hoy? Te realizamos una tasación profesional sin costo, con análisis del mercado actualizado.</p>
              <ul className="servicio-items">
                <li><i className="fa-solid fa-check" /> Valuación de mercado</li>
                <li><i className="fa-solid fa-check" /> Análisis de zona y comparables</li>
                <li><i className="fa-solid fa-check" /> Informe detallado</li>
              </ul>
              <a href="#contacto" className="servicio-link">
                Solicitar tasación gratuita <i className="fa-solid fa-arrow-right" />
              </a>
            </div>

            <div className="servicio-card fade-up">
              <div className="servicio-icon servicio-icon--inversion">
                <i className="fa-solid fa-chart-line" />
              </div>
              <h3>Inversión Inmobiliaria</h3>
              <p>Te asesoramos para invertir en ladrillos con criterio. Identificamos las mejores oportunidades del mercado para maximizar tu rentabilidad.</p>
              <ul className="servicio-items">
                <li><i className="fa-solid fa-check" /> Análisis de rentabilidad</li>
                <li><i className="fa-solid fa-check" /> Selección de activos</li>
                <li><i className="fa-solid fa-check" /> Seguimiento post-inversión</li>
              </ul>
              <a href="#contacto" className="servicio-link">
                Consultá nuestros asesores <i className="fa-solid fa-arrow-right" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* EMPRENDIMIENTOS */}
      <section className="emprendimientos-section" id="emprendimientos">
        <div className="container">
          <div className="emprendimientos-inner fade-up">
            <div className="emprendimientos-text">
              <div className="section-tag">Proyectos en desarrollo</div>
              <h2>Emprendimientos<br /><span>inmobiliarios</span></h2>
              <p>Invertí desde el pozo en proyectos seleccionados. Te acompañamos en cada etapa: desde la elección de la unidad hasta la escrituración. Accedé a las mejores condiciones de pago y financiamiento directo con el desarrollador.</p>
              <ul className="emprendimientos-beneficios">
                <li><i className="fa-solid fa-circle-check" /> Precio de lanzamiento</li>
                <li><i className="fa-solid fa-circle-check" /> Financiación directa</li>
                <li><i className="fa-solid fa-circle-check" /> Alta rentabilidad proyectada</li>
                <li><i className="fa-solid fa-circle-check" /> Acompañamiento integral</li>
              </ul>
              <Link to="/emprendimientos" className="btn-primary">
                Ver emprendimientos vigentes <i className="fa-solid fa-arrow-right" />
              </Link>
            </div>
            <div className="emprendimientos-visual">
              <div className="emp-card fade-up">
                <div className="emp-card-icon"><i className="fa-solid fa-building-columns" /></div>
                <strong>Inversión desde el pozo</strong>
                <span>Las mejores unidades al precio más bajo</span>
              </div>
              <div className="emp-card fade-up">
                <div className="emp-card-icon"><i className="fa-solid fa-file-contract" /></div>
                <strong>Gestión completa</strong>
                <span>Nos encargamos de toda la documentación</span>
              </div>
              <div className="emp-card fade-up">
                <div className="emp-card-icon"><i className="fa-solid fa-chart-line" /></div>
                <strong>Rentabilidad garantizada</strong>
                <span>Proyectos con alta demanda de alquiler</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DESTACADAS */}
      <section className="destacadas" id="destacadas">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="section-tag">Propiedades destacadas</div>
              <h2>Las mejores opciones<br /><span>del momento</span></h2>
            </div>
            <Link to="/propiedades" className="ver-todas-link">
              Ver todas <i className="fa-solid fa-arrow-right" />
            </Link>
          </div>
          <div className="propiedades-grid">
            {destacadas.map(p => <PropiedadCard key={p.id} propiedad={p} />)}
          </div>
          <div className="text-center" style={{ marginTop: '3rem' }}>
            <Link to="/propiedades" className="btn-primary">
              Explorar todas las propiedades <i className="fa-solid fa-arrow-right" />
            </Link>
          </div>
        </div>
      </section>

      {/* NOSOTROS */}
      <section className="nosotros" id="nosotros">
        <div className="container">
          <div className="nosotros-grid">
            <div className="nosotros-imgs">
              <div className="img-grande-wrapper">
                <img className="img-grande" src="/Frente.jpeg" alt="Frente" />
              </div>
              <img className="img-chica" src="/LogoCircular.jpeg" alt="Logo Circular" />
              <div className="nosotros-badge">
                <strong>35+</strong>
                <span>Años de<br />experiencia</span>
              </div>
            </div>
            <div className="nosotros-content">
              <div className="section-tag">¿Quiénes somos?</div>
              <h2>Una inmobiliaria que<br /><span>trabaja para vos</span></h2>
              <div className="nosotros-items">
                {['Propiedades verificadas', 'Atención personalizada', 'Trámites rápidos y seguros', 'Asesoramiento legal incluido'].map(item => (
                  <div key={item} className="nosotros-item">
                    <i className="fa-solid fa-circle-check" /><span>{item}</span>
                  </div>
                ))}
              </div>
              <a href="#contacto" className="btn-primary">Hablar con un asesor</a>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="como-funciona">
        <div className="container">
          <div className="section-header section-header--center">
            <div className="section-tag">Proceso simple</div>
            <h2>¿Cómo trabajamos<br /><span>con vos?</span></h2>
          </div>
          <div className="pasos-grid">
            {[
              { num: '01', icon: 'fa-comments', title: 'Primera consulta', desc: 'Nos contás qué buscás o qué necesitás: alquilar, comprar, vender o tasar.' },
              { num: '02', icon: 'fa-magnifying-glass', title: 'Análisis y búsqueda', desc: 'Analizamos el mercado y te presentamos las opciones más convenientes para tu caso.' },
              { num: '03', icon: 'fa-calendar-check', title: 'Visitas y negociación', desc: 'Coordinamos visitas y te acompañamos en cada etapa de la negociación.' },
              { num: '04', icon: 'fa-file-signature', title: 'Cierre seguro', desc: 'Gestionamos toda la documentación para que tu operación sea rápida y sin inconvenientes.' },
            ].map((paso, i, arr) => (
              <>
                <div key={paso.num} className="paso fade-up">
                  <div className="paso-num">{paso.num}</div>
                  <div className="paso-icon"><i className={`fa-solid ${paso.icon}`} /></div>
                  <h3>{paso.title}</h3>
                  <p>{paso.desc}</p>
                </div>
                {i < arr.length - 1 && <div key={`arrow-${i}`} className="paso-arrow"><i className="fa-solid fa-arrow-right" /></div>}
              </>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner">
        <div className="cta-bg" />
        <div className="container cta-content">
          <div className="cta-text">
            <h2>¿Querés vender o alquilar<br />tu propiedad?</h2>
            <p>Sumá tu inmueble a nuestra cartera. Te hacemos una tasación gratuita y nos encargamos de todo.</p>
          </div>
          <div className="cta-actions">
            <a href="#contacto" className="btn-primary">Quiero tasar mi propiedad</a>
            <a href="/#servicios" className="btn-outline-white">Ver nuestros servicios</a>
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section className="contacto" id="contacto">
        <div className="container">
          <div className="section-header section-header--center">
            <div className="section-tag">Contacto</div>
            <h2>¿Tenés alguna consulta?<br /><span>Escribinos</span></h2>
          </div>
          <div className="contacto-wrapper">
            <div className="contacto-info">
              <h3>Estamos para ayudarte</h3>
              <p>Contactanos por cualquiera de estos medios y te responderemos a la brevedad.</p>
              <div className="info-items">
                {[
                  { icon: 'fa-location-dot', label: 'Dirección', val: 'Av. Mosconi 2804, Buenos Aires' },
                  { icon: 'fa-phone', label: 'Teléfono', val: '+54 11 4571-3005' },
                  { icon: 'fa-envelope', label: 'Email', val: 'calvinotabuada@hotmail.com' },
                  { icon: 'fa-brands fa-whatsapp', label: 'WhatsApp', val: '+54 9 11 4571-3005', brand: true },
                ].map(item => (
                  <div key={item.label} className="info-item">
                    <div className="info-icon"><i className={`fa-${item.brand ? 'brands' : 'solid'} ${item.icon}`} /></div>
                    <div><strong>{item.label}</strong><span>{item.val}</span></div>
                  </div>
                ))}
              </div>
              <div className="social-row">
                <a href="https://www.instagram.com/calvinotabuada/" className="social-btn"><i className="fa-brands fa-instagram" /></a>
                <a href="https://www.facebook.com/inmobiliaria2804" className="social-btn"><i className="fa-brands fa-facebook-f" /></a>
                <a href="https://wa.me/5491145713005" className="social-btn"><i className="fa-brands fa-whatsapp" /></a>
              </div>
            </div>

            <form className="contacto-form" onSubmit={handleFormSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre completo</label>
                  <input name="nombre" type="text" placeholder="Tu nombre" required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input name="email" type="email" placeholder="ejemplo@email.com" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono</label>
                  <input name="telefono" type="tel" placeholder="+54 11 ...." />
                </div>
                <div className="form-group">
                  <label>Asunto</label>
                  <select name="asunto">
                    <option>Consulta general</option>
                    <option>Quiero alquilar</option>
                    <option>Quiero comprar</option>
                    <option>Quiero vender</option>
                    <option>Solicitar tasación gratuita</option>
                    <option>Consulta de inversión</option>
                    <option>Otro</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Mensaje</label>
                <textarea name="mensaje" rows="5" placeholder="Escribi tu consulta acá..." required />
              </div>
              <button type="submit" className="btn-primary btn-full"
                style={formSent ? { background: 'linear-gradient(135deg,#22c55e,#16a34a)' } : {}}>
                {formSent
                  ? <><i className="fa-solid fa-check" /> ¡Mensaje enviado!</>
                  : <><i className="fa-solid fa-paper-plane" /> Enviar mensaje</>}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
