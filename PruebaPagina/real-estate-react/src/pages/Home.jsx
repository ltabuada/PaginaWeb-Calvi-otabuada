import { useState, useEffect, useRef, Fragment } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PropiedadCard from '../components/PropiedadCard'
import { useListings } from '../context/ListingsContext'
import { useConsultas } from '../context/ConsultasContext'

const SLIDES = [
  '/fotoSlide.jpeg',
  '/Terraza Habana Terrada.jpeg',
  '/Habana 2602.jpeg',
]

const SERVICIOS = [
  {
    id: 'alquiler', icon: 'fa-key', tipo: 'alquiler', titulo: 'Alquiler',
    desc: 'Seleccioná dentro de nuestro catálogo. Te acompañamos desde la búsqueda hasta la firma del contrato.',
    items: ['Búsqueda personalizada', 'Gestión documental completa', 'Asesoramiento legal incluido'],
    linkTo: '/propiedades?operacion=alquiler', linkTexto: 'Ver propiedades en alquiler',
  },
  {
    id: 'venta', icon: 'fa-handshake', tipo: 'venta', titulo: 'Compra y Venta',
    desc: 'Te orientamos y asesoramos en cada paso del proceso de tu compra o venta de una propiedad.',
    items: ['Tasación del inmueble', 'Estrategia de publicación', 'Acompañamiento en escritura'],
    linkTo: '/propiedades?operacion=venta', linkTexto: 'Ver propiedades en venta',
  },
  {
    id: 'tasacion', icon: 'fa-calculator', tipo: 'tasacion', titulo: 'Tasación Gratuita',
    desc: '¿Querés saber cuánto vale tu propiedad hoy? Te realizamos una tasación profesional sin costo, con análisis de mercado actualizado.',
    items: ['Valuación de mercado', 'Análisis de zona y comparables', 'Informe detallado'],
    linkHref: '#contacto', linkTexto: 'Solicitar tasación gratuita',
  },
  {
    id: 'inversion', icon: 'fa-chart-line', tipo: 'inversion', titulo: 'Inversión Inmobiliaria',
    desc: 'Te asesoramos para invertir en ladrillos con criterio, identificando las mejores oportunidades para maximizar tu rentabilidad.',
    items: ['Análisis de rentabilidad', 'Selección de activos', 'Seguimiento post-inversión'],
    linkHref: '#contacto', linkTexto: 'Consultá nuestros asesores',
  },
]

const TESTIMONIOS = [
  {
    nombre: 'Graciela P.',
    iniciales: 'GP',
    texto: 'Trabajé con ellos para alquilar mi departamento en Villa Devoto y quedé muy satisfecha. Muy profesionales, responden rápido y se encargan de todo el papeleo. Los recomiendo sin dudar.',
    estrellas: 5,
    detalle: 'Propietaria · hace 2 meses',
    destacado: false,
  },
  {
    nombre: 'Martín S.',
    iniciales: 'MS',
    texto: 'Compré mi primer departamento con el asesoramiento de Calviño Tabuada. Sin su ayuda hubiera sido imposible navegar el proceso. Conocen el barrio de memoria y siempre me dieron la información justa.',
    estrellas: 5,
    detalle: 'Comprador · hace 4 meses',
    destacado: true,
  },
  {
    nombre: 'Valeria R.',
    iniciales: 'VR',
    texto: 'Los conozco desde hace años porque mi familia siempre trabajó con ellos. Vendimos una casa familiar y el trato fue impecable: transparentes, rápidos y muy humanos. Gracias totales.',
    estrellas: 5,
    detalle: 'Vendedora · hace 1 mes',
    destacado: false,
  },
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
  const statsRef = useRef(null)
  const countedRef = useRef(false)
  const [count35, setCount35] = useState(0)
  const [count120, setCount120] = useState(0)
  const [splashExit, setSplashExit] = useState(false)
  const [splashDone, setSplashDone] = useState(false)

  // Splash screen
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const t1 = setTimeout(() => setSplashExit(true), 2200)
    const t2 = setTimeout(() => { setSplashDone(true); document.body.style.overflow = '' }, 3200)
    return () => { clearTimeout(t1); clearTimeout(t2); document.body.style.overflow = '' }
  }, [])
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

  // Contadores animados hero stats
  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !countedRef.current) {
        countedRef.current = true
        let v35 = 0
        const t35 = setInterval(() => { v35++; setCount35(v35); if (v35 >= 35) clearInterval(t35) }, 45)
        let v120 = 0
        const t120 = setInterval(() => { v120 += 3; setCount120(Math.min(v120, 120)); if (v120 >= 120) clearInterval(t120) }, 22)
      }
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const handleBuscar = () => {
    const params = new URLSearchParams()
    if (buscar) params.set('buscar', buscar)
    if (tipo) params.set('operacion', tipo)
    if (ambientes) params.set('tipo', ambientes)
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

  const barrios = [...new Set(
    listingsPublicos.map(p => {
      const parts = p.ubicacion.split(',').map(s => s.trim())
      // Si el primer segmento tiene números (es una calle), tomar el siguiente
      return parts.find(part => !/\d/.test(part)) || parts[0]
    })
  )].sort()
  const destacadas = listingsPublicos.filter(p => p.destacada).slice(0, 3)

  return (
    <>
      {/* SPLASH */}
      {!splashDone && (
        <div className={`splash${splashExit ? ' splash--exit' : ''}`}>
          <div className="splash-inner">
            <img className="splash-logo" src="/LogoInicio.png" alt="Calviño Tabuada Propiedades" />
            <div className="splash-line" />
            <p className="splash-tagline">Alquilá · Comprá · Vendé</p>
          </div>
        </div>
      )}

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
              maxWidth: '620px',
              height: 'clamp(5rem, 11vw, 9rem)',
              objectFit: 'contain',
              objectPosition: 'left center',
              display: 'block',
              margin: '0 0 1.2rem',
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

          <div className="hero-stats" ref={statsRef}>
            <div className="hero-stat"><strong>+{count35} años</strong><span>De experiencia</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>+{count120}</strong><span>Obras comercializadas</span></div>
          </div>
        </div>
        <div className="hero-dots">
          {SLIDES.map((_, i) => (
            <button key={i} className={`dot-btn${slide === i ? ' active' : ''}`} onClick={() => goToSlide(i)} />
          ))}
        </div>
      </section>

      {/* SERVICIOS — editorial asimétrico */}
      <section className="servicios" id="servicios">
        <div className="servicios-editorial">
          <div className="servicios-visual fade-up">
            <div className="servicios-visual-img">
              <img src="/Ceretti3265.jpeg" alt="Edificio Ceretti - Calviño Tabuada Propiedades" />
            </div>
            <div className="servicios-visual-tag">
              <span className="brand-mark-lg" />
              <div>
                <strong>35+ años</strong>
                <span>construyendo confianza en Villa Devoto</span>
              </div>
            </div>
          </div>

          <div className="servicios-list">
            <div className="section-header fade-up">
              <div className="section-tag">Lo que hacemos</div>
              <h2>Servicios integrales<br /><span>para cada necesidad</span></h2>
            </div>
            {SERVICIOS.map((s, i) => (
              <div key={s.id} className="servicio-row fade-up">
                <span className="servicio-num">{String(i + 1).padStart(2, '0')}</span>
                <div className={`servicio-row-icon servicio-icon--${s.tipo}`}>
                  <i className={`fa-solid ${s.icon}`} />
                </div>
                <div className="servicio-row-body">
                  <h3>{s.titulo}</h3>
                  <p>{s.desc}</p>
                  <ul className="servicio-items">
                    {s.items.map(it => <li key={it}><i className="fa-solid fa-check" /> {it}</li>)}
                  </ul>
                  {s.linkTo
                    ? <Link to={s.linkTo} className="servicio-link">{s.linkTexto} <i className="fa-solid fa-arrow-right" /></Link>
                    : <a href={s.linkHref} className="servicio-link">{s.linkTexto} <i className="fa-solid fa-arrow-right" /></a>}
                </div>
              </div>
            ))}
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
              <div className="emprendimientos-visual-bg">
                <img src="/blueprint-edificio.webp" alt="Plano de emprendimiento en desarrollo" />
              </div>
              <div className="emp-cards-stack">
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
          {destacadas.length === 0 ? (
            <div className="destacadas-empty">
              <i className="fa-solid fa-house-circle-check" />
              <p>Estamos preparando nuestras próximas propiedades destacadas. Mientras tanto, explorá todo el catálogo disponible.</p>
            </div>
          ) : (
            <div className="destacadas-bento">
              <div className="bento-featured">
                <PropiedadCard propiedad={destacadas[0]} />
              </div>
              {destacadas.length > 1 && (
                <div className="bento-side">
                  {destacadas.slice(1, 3).map(p => <PropiedadCard key={p.id} propiedad={p} />)}
                </div>
              )}
            </div>
          )}
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

      {/* TESTIMONIOS */}
      <section className="testimonios" id="testimonios">
        <div className="container">
          <div className="section-header section-header--center fade-up">
            <div className="section-tag">Lo que dicen nuestros clientes</div>
            <h2>Reseñas de quienes<br /><span>ya confiaron en nosotros</span></h2>
            <div className="testimonios-rating-header">
              <span className="testimonios-score">4.9</span>
              <div className="testimonios-score-info">
                <div className="estrellas">★★★★★</div>
                <span className="testimonios-total">Basado en reseñas de Google Maps</span>
              </div>
            </div>
          </div>
          <div className="testimonios-grid">
            {TESTIMONIOS.map((t, i) => (
              <div key={i} className={`testimonio fade-up${t.destacado ? ' testimonio--destacado' : ''}`}>
                <div className="testimonio-top">
                  <div className="estrellas">{'★'.repeat(t.estrellas)}</div>
                  <i className="fa-solid fa-quote-right quote-icon" />
                </div>
                <p>"{t.texto}"</p>
                <div className="testimonio-autor">
                  <div className="avatar">{t.iniciales}</div>
                  <div>
                    <strong>{t.nombre}</strong>
                    <span>{t.detalle}</span>
                  </div>
                </div>
              </div>
            ))}
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
              <Fragment key={paso.num}>
                <div className="paso fade-up" style={{ '--stagger': `${-i * 26}px` }}>
                  <div className="paso-num">{paso.num}</div>
                  <div className="paso-icon"><i className={`fa-solid ${paso.icon}`} /></div>
                  <h3>{paso.title}</h3>
                  <p>{paso.desc}</p>
                </div>
                {i < arr.length - 1 && <div className="paso-arrow"><i className="fa-solid fa-arrow-right" /></div>}
              </Fragment>
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
              <div className="contacto-mapa">
                <iframe
                  src="https://maps.google.com/maps?q=Av.+Mosconi+2804,+Villa+Devoto,+Buenos+Aires,+Argentina&z=16&output=embed"
                  title="Ubicación Calviño Tabuada Propiedades"
                  loading="lazy"
                  allowFullScreen
                />
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

      {/* WHATSAPP FLOTANTE */}
      <a
        href="https://wa.me/5491145713005"
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
      >
        <i className="fa-brands fa-whatsapp" />
      </a>

      <Footer />
    </>
  )
}
