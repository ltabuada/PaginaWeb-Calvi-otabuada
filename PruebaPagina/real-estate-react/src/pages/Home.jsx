import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PropiedadCard from '../components/PropiedadCard'
import Titulo from '../components/Titulo'
import Cinta from '../components/Cinta'
import { useListings } from '../context/ListingsContext'
import { useConsultas } from '../context/ConsultasContext'
import WhatsAppFloat from '../components/WhatsAppFloat'
import { waLink, WHATSAPP } from '../lib/contacto'
import { useCuenta, useEnPantalla } from '../lib/motion'

const SLIDES = [
  '/fotoSlide.jpeg',
  '/Terraza Habana Terrada.jpeg',
  '/Habana 2602.jpeg',
]

const SERVICIOS = [
  {
    id: 'alquiler', icon: 'fa-key', tipo: 'alquiler', titulo: 'Alquiler',
    desc: 'Seleccioná dentro de nuestra cartera de propiedades. Te acompañamos desde la búsqueda hasta la firma del contrato.',
    items: ['Búsqueda personalizada', 'Gestión documental completa', 'Asesoramiento legal incluido'],
    linkTo: '/propiedades?operacion=alquiler', linkTexto: 'Ver propiedades en alquiler',
  },
  {
    id: 'venta', icon: 'fa-handshake', tipo: 'venta', titulo: 'Compra - Venta',
    desc: 'Te orientamos y asesoramos en cada paso del proceso de tu compra o venta de una propiedad.',
    items: ['Tasación del inmueble', 'Estrategia de publicación', 'Asesoramiento durante la escritura'],
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
    desc: 'Asesoramiento para invertir en ladrillos con criterio, identificando las mejores oportunidades para maximizar tu rentabilidad.',
    items: ['Análisis de rentabilidad', 'Selección de proyectos', 'Seguimiento post-inversión'],
    linkHref: '#contacto', linkTexto: 'Consultá nuestros asesores',
  },
]

const PASOS = [
  { num: '01', icon: 'fa-comments', title: 'Primera consulta', desc: 'Nos contás qué buscás o qué necesitás: alquilar, comprar, vender o tasar.' },
  { num: '02', icon: 'fa-magnifying-glass', title: 'Análisis y búsqueda', desc: 'Analizamos el mercado y te presentamos las opciones más convenientes para tu caso.' },
  { num: '03', icon: 'fa-calendar-check', title: 'Visitas y negociación', desc: 'Coordinamos visitas y te acompañamos en cada etapa de la negociación.' },
  { num: '04', icon: 'fa-file-signature', title: 'Cierre seguro', desc: 'Gestionamos toda la documentación para que tu operación sea rápida y sin inconvenientes.' },
]

const TESTIMONIOS = [
  {
    nombre: 'Graciela P.',
    iniciales: 'GP',
    texto: 'Trabajé con ellos para alquilar mi departamento y quedé muy satisfecha. Muy profesionales, responden rápido y se encargan de todo el papeleo. Los recomiendo sin dudar.',
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

const CINTA_PRINCIPAL = ['Alquiler', 'Venta', 'Tasación', 'Inversión', 'Emprendimientos']
const CINTA_CRUZADA = ['Conocemos la zona', 'Más de 35 años', 'Atención personalizada', 'Asesoramiento legal']

export default function Home() {
  const { listingsPublicos } = useListings()
  const { addConsulta } = useConsultas()
  const navigate = useNavigate()
  const [slide, setSlide] = useState(0)
  const [previo, setPrevio] = useState(null)
  const [buscar, setBuscar] = useState('')
  const [tipo, setTipo] = useState('')
  const [ambientes, setAmbientes] = useState('')
  const [formSent, setFormSent] = useState(false)
  const intervalRef = useRef(null)
  const slideRef = useRef(0)
  const [splashExit, setSplashExit] = useState(false)
  const [splashDone, setSplashDone] = useState(false)

  // Los contadores esperan a que la apertura haya soltado la pantalla: si
  // arrancaran detrás de la cortina, el visitante vería números ya terminados.
  const [statsRef, statsVisibles] = useEnPantalla(0.5)
  const count35 = useCuenta(35, statsVisibles && splashDone)
  const count120 = useCuenta(120, statsVisibles && splashDone, { duracion: 2300 })
  const [scoreRef, scoreVisible] = useEnPantalla(0.6)
  const score = useCuenta(4.9, scoreVisible, { decimales: 1, duracion: 1600 })

  const location = useLocation()

  // El navegador restaura solo la posición de scroll al recargar. En una home
  // con splash eso desorienta: mirás la intro y aparecés a mitad de página sin
  // haber hecho nada. Salvo que se venga con un destino explícito, el inicio
  // abre por arriba.
  useEffect(() => {
    const hayDestino = location.state?.scrollTo || location.hash
    if (hayDestino) return
    const previoRestauracion = 'scrollRestoration' in history ? history.scrollRestoration : null
    if (previoRestauracion !== null) history.scrollRestoration = 'manual'
    window.scrollTo({ top: 0, behavior: 'instant' })
    return () => { if (previoRestauracion !== null) history.scrollRestoration = previoRestauracion }
    // Solo al montar: después de eso, el scroll es del visitante.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Al llegar desde otra página con "Consultar", el salto se hace recién cuando
  // el splash soltó el scroll. Va instantáneo a propósito: la página tiene
  // scroll-behavior:smooth global, y un recorrido suave de ~6000px se cancela
  // solo cuando las animaciones de entrada le cambian el alto por debajo.
  // Además es lo que se espera de un "Consultar": aparecer ya en el formulario.
  useEffect(() => {
    const destino = location.state?.scrollTo || (location.hash ? location.hash.slice(1) : null)
    if (!destino || !splashDone) return
    const t = setTimeout(() => {
      const el = document.getElementById(destino)
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 70  // deja aire bajo el navbar
        window.scrollTo({ top: y, behavior: 'instant' })
      }
      // El destino se consume una sola vez. React Router guarda el state en la
      // entrada del historial, así que sin esto un F5 —o volver a esa entrada—
      // repetiría el salto y el inicio dejaría de abrir por arriba.
      navigate('/', { replace: true, state: null })
    }, 60)
    return () => clearTimeout(t)
  }, [location.key, location.state, location.hash, splashDone, navigate])

  // Splash screen
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const t1 = setTimeout(() => setSplashExit(true), 900)
    const t2 = setTimeout(() => { setSplashDone(true); document.body.style.overflow = '' }, 1600)
    return () => { clearTimeout(t1); clearTimeout(t2); document.body.style.overflow = '' }
  }, [])

  // Cambio de foto del hero. `previo` conserva la anterior debajo mientras la
  // nueva entra con el corte diagonal: sin eso, durante el barrido se vería el
  // fondo vacío.
  const cambiarSlide = (n) => {
    setPrevio(slideRef.current)
    slideRef.current = n
    setSlide(n)
  }
  const programarCambio = () => {
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => cambiarSlide((slideRef.current + 1) % SLIDES.length), 6000)
  }
  useEffect(() => {
    programarCambio()
    return () => clearInterval(intervalRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goToSlide = (n) => {
    if (n === slideRef.current) return
    cambiarSlide(n)
    programarCambio()
  }

  const handleBuscar = () => {
    const params = new URLSearchParams()
    if (buscar) params.set('buscar', buscar)
    if (tipo) params.set('operacion', tipo)
    if (ambientes) params.set('tipo', ambientes)
    navigate(`/propiedades${params.toString() ? '?' + params.toString() : ''}`, { viewTransition: true })
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
      {/* APERTURA — los dos cuadrados del isologo abren la página */}
      {!splashDone && (
        <div className={`apertura${splashExit ? ' apertura--sale' : ''}`} aria-hidden="true">
          <div className="apertura-marca">
            <span className="apertura-cuadro apertura-cuadro--uno" />
            <span className="apertura-cuadro apertura-cuadro--dos" />
            <span className="apertura-cuadro apertura-cuadro--costura" />
          </div>
        </div>
      )}

      <Navbar />

      <main id="contenido" tabIndex={-1}>
        {/* HERO */}
        <section className="hero" aria-label="Inicio">
          <h1 className="sr-only">Calviño Tabuada Propiedades: alquiler, venta, tasación e inversión inmobiliaria en Buenos Aires</h1>
          <div className="hero-bg" aria-hidden="true">
            {SLIDES.map((src, i) => (
              <div key={src} className={`hero-slide${slide === i ? ' activo' : ''}${previo === i ? ' previo' : ''}`}
                style={{ backgroundImage: `url('${src}')` }} />
            ))}
          </div>
          <div className="hero-overlay" aria-hidden="true" />
          <div className="hero-content">
            <span className="linea-mascara" style={{ '--retraso': '.95s' }}>
              <img
                className="hero-logo"
                src="/LogoInicio.png"
                alt=""
                width="772"
                height="323"
              />
            </span>

            <span className="linea-mascara" style={{ '--retraso': '1.08s' }}>
              <p>Alquilá, comprá, vendé o tasá tu propiedad con nuestro respaldo</p>
            </span>

            <form className="hero-search" role="search" aria-label="Buscar propiedades" onSubmit={e => { e.preventDefault(); handleBuscar() }}>
              <div className="search-field">
                <i className="fa-solid fa-location-dot" aria-hidden="true" />
                <select value={buscar} onChange={e => setBuscar(e.target.value)} aria-label="Barrio" name="barrio">
                  <option value="">Barrio</option>
                  {barrios.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="search-divider" />
              <div className="search-field">
                <i className="fa-solid fa-tag" aria-hidden="true" />
                <select value={tipo} onChange={e => setTipo(e.target.value)} aria-label="Operación" name="operacion">
                  <option value="">Operación</option>
                  <option value="alquiler">Alquiler</option>
                  <option value="venta">Venta</option>
                </select>
              </div>
              <div className="search-divider" />
              <div className="search-field">
                <i className="fa-solid fa-home" aria-hidden="true" />
                <select value={ambientes} onChange={e => setAmbientes(e.target.value)} aria-label="Tipo de propiedad" name="tipo">
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
              <button type="submit" className="search-btn" data-magnetic>
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> Buscar
              </button>
            </form>

            <div className="hero-stats" ref={statsRef}>
              <div className="hero-stat"><strong>+{count35} años</strong><span>De experiencia</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><strong>+{count120}</strong><span>Obras comercializadas</span></div>
            </div>
          </div>
          <div className="hero-dots">
            {SLIDES.map((src, i) => (
              <button
                key={src}
                type="button"
                className={`dot-btn${slide === i ? ' active' : ''}`}
                onClick={() => goToSlide(i)}
                aria-label={`Ver foto ${i + 1} de ${SLIDES.length}`}
                aria-current={slide === i}
              />
            ))}
          </div>
        </section>

        {/* SERVICIOS — editorial asimétrico */}
        <section className="servicios" id="servicios">
          <div className="servicios-editorial">
            <div className="servicios-visual">
              <div className="servicios-visual-img" data-reveal="imagen">
                <div className="rev"><div className="par">
                  <img src="/Ceretti3265.jpeg" alt="Edificio Ceretti - Calviño Tabuada Propiedades" width="800" height="1200" loading="lazy" decoding="async" />
                </div></div>
              </div>
              <div className="servicios-visual-tag" data-reveal="cartel">
                <span className="brand-mark-lg" aria-hidden="true" />
                <div>
                  <strong>35+ años</strong>
                  <span>construyendo confianza, operación a operación</span>
                </div>
              </div>
            </div>

            <div className="servicios-list">
              <div className="section-header">
                <Titulo lineas={[{ t: 'Servicios integrales' }, { t: 'para cada necesidad', em: true }]} />
              </div>
              {SERVICIOS.map((s, i) => (
                <div key={s.id} className="servicio-row" data-reveal="linea" data-spot style={{ '--orden': i }}>
                  <div className={`servicio-row-icon servicio-icon--${s.tipo}`}>
                    <i className={`fa-solid ${s.icon}`} aria-hidden="true" />
                  </div>
                  <div className="servicio-row-body">
                    <h3>{s.titulo}</h3>
                    <p>{s.desc}</p>
                    <ul className="servicio-items">
                      {s.items.map(it => <li key={it}><i className="fa-solid fa-check" aria-hidden="true" /> {it}</li>)}
                    </ul>
                    {s.linkTo
                      ? <Link to={s.linkTo} className="servicio-link" viewTransition>{s.linkTexto} <i className="fa-solid fa-arrow-right" aria-hidden="true" /></Link>
                      : <a href={s.linkHref} className="servicio-link">{s.linkTexto} <i className="fa-solid fa-arrow-right" aria-hidden="true" /></a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EMPRENDIMIENTOS */}
        <section className="emprendimientos-section" id="emprendimientos">
          <div className="container">
            <div className="emprendimientos-inner">
              <div className="emprendimientos-text">
                <Titulo lineas={[{ t: 'Emprendimientos' }, { t: 'inmobiliarios', em: true }]} />
                <p>Invertí desde el pozo en proyectos seleccionados. Te acompañamos en cada etapa. Accedé a las mejores condiciones de pago y financiamiento directo con el desarrollador.</p>
                <ul className="emprendimientos-beneficios">
                  <li><i className="fa-solid fa-circle-check" aria-hidden="true" /> Precio de lanzamiento</li>
                  <li><i className="fa-solid fa-circle-check" aria-hidden="true" /> Financiación directa</li>
                  <li><i className="fa-solid fa-circle-check" aria-hidden="true" /> Alta rentabilidad proyectada</li>
                  <li><i className="fa-solid fa-circle-check" aria-hidden="true" /> Acompañamiento integral</li>
                </ul>
                <Link to="/emprendimientos" className="btn-primary" data-magnetic viewTransition>
                  Ver emprendimientos vigentes <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </Link>
              </div>
              <div className="emprendimientos-visual" data-reveal="escaneo">
                <div className="emprendimientos-visual-bg">
                  <div className="par">
                    <img src="/blueprint-edificio.webp" alt="Plano de emprendimiento en desarrollo" width="900" height="1200" loading="lazy" decoding="async" />
                  </div>
                </div>
                <div className="emp-cards-stack">
                  <div className="emp-card" data-reveal="lista" data-spot style={{ '--orden': 0 }}>
                    <div className="emp-card-icon"><i className="fa-solid fa-building-columns" aria-hidden="true" /></div>
                    <strong>Inversión desde el pozo</strong>
                    <span>Las mejores unidades al precio más bajo</span>
                  </div>
                  <div className="emp-card" data-reveal="lista" data-spot style={{ '--orden': 1 }}>
                    <div className="emp-card-icon"><i className="fa-solid fa-file-contract" aria-hidden="true" /></div>
                    <strong>Gestión completa</strong>
                    <span>Nos encargamos de toda la documentación</span>
                  </div>
                  <div className="emp-card" data-reveal="lista" data-spot style={{ '--orden': 2 }}>
                    <div className="emp-card-icon"><i className="fa-solid fa-chart-line" aria-hidden="true" /></div>
                    <strong>Rentabilidad garantizada</strong>
                    <span>Proyectos con alta demanda</span>
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
                <Titulo lineas={[{ t: 'Las mejores opciones' }, { t: 'del momento', em: true }]} />
              </div>
              <Link to="/propiedades" className="ver-todas-link" viewTransition>
                Ver todas <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </Link>
            </div>
            {destacadas.length === 0 ? (
              <div className="destacadas-empty">
                <i className="fa-solid fa-house-circle-check" aria-hidden="true" />
                <p>Estamos preparando nuestras próximas propiedades destacadas. Mientras tanto, explorá toda la cartera disponible.</p>
              </div>
            ) : (
              <div className="destacadas-bento">
                <div className="bento-featured">
                  <PropiedadCard propiedad={destacadas[0]} orden={0} />
                </div>
                {destacadas.length > 1 && (
                  <div className="bento-side">
                    {destacadas.slice(1, 3).map((p, i) => <PropiedadCard key={p.id} propiedad={p} orden={i + 1} />)}
                  </div>
                )}
              </div>
            )}
            <div className="text-center" style={{ marginTop: '3rem' }}>
              <Link to="/propiedades" className="btn-primary" data-magnetic viewTransition>
                Explorar todas las propiedades
              </Link>
            </div>
          </div>
        </section>

        {/* CINTAS — dos bandas que se cruzan, en sentidos opuestos */}
        <div className="cintas" aria-hidden="true">
          <Cinta palabras={CINTA_PRINCIPAL} />
          <Cinta palabras={CINTA_CRUZADA} inversa contorno />
        </div>

        {/* NOSOTROS */}
        <section className="nosotros" id="nosotros">
          <div className="container">
            <div className="nosotros-grid">
              <div className="nosotros-imgs">
                <div className="img-grande-wrapper" data-reveal="imagen">
                  <div className="rev"><div className="par">
                    <img className="img-grande" src="/Frente.jpeg" alt="Frente de la inmobiliaria Calviño Tabuada" width="1271" height="998" loading="lazy" decoding="async" />
                  </div></div>
                </div>
                <div className="anillo-wrap">
                  <div className="anillo" aria-hidden="true">
                    <svg viewBox="0 0 200 200" focusable="false">
                      <defs><path id="anillo-trazo" d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" /></defs>
                      <text><textPath href="#anillo-trazo" textLength="496" lengthAdjust="spacing">Más de 35 años de experiencia · Calviño Tabuada · Propiedades ·</textPath></text>
                    </svg>
                  </div>
                  <img className="img-chica" src="/LogoCircular.jpeg" alt="Logo de Calviño Tabuada Propiedades" width="200" height="200" loading="lazy" decoding="async" />
                </div>
                <div className="nosotros-badge" data-reveal="cartel">
                  <strong>35+</strong>
                  <span>Años de<br />experiencia</span>
                </div>
              </div>
              <div className="nosotros-content">
                <Titulo lineas={[{ t: 'Una inmobiliaria que' }, { t: 'trabaja para vos', em: true }]} />
                <div className="nosotros-items">
                  {['Propiedades verificadas', 'Atención personalizada', 'Trámites rápidos y seguros', 'Asesoramiento legal incluido'].map(item => (
                    <div key={item} className="nosotros-item">
                      <i className="fa-solid fa-circle-check" aria-hidden="true" /><span>{item}</span>
                    </div>
                  ))}
                </div>
                <a href="#contacto" className="btn-primary" data-magnetic>Hablar con un asesor</a>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIOS */}
        <section className="testimonios" id="testimonios">
          <div className="container">
            <div className="section-header section-header--center">
              <Titulo lineas={[{ t: 'Reseñas de quienes' }, { t: 'ya confiaron en nosotros', em: true }]} />
              <div className="testimonios-rating-header" ref={scoreRef}>
                <span className="testimonios-score">{score}</span>
                <div className="testimonios-score-info">
                  <div className="estrellas" aria-label="5 estrellas">★★★★★</div>
                  <span className="testimonios-total">Basado en reseñas de Google Maps</span>
                </div>
              </div>
            </div>
            <div className="testimonios-grid">
              {TESTIMONIOS.map((t, i) => (
                <div key={t.nombre} className={`testimonio${t.destacado ? ' testimonio--destacado' : ''}`} data-reveal="lista" data-spot style={{ '--orden': i }}>
                  <div className="testimonio-top">
                    <div className="estrellas" aria-label={`${t.estrellas} estrellas`}>{'★'.repeat(t.estrellas)}</div>
                    <i className="fa-solid fa-quote-right quote-icon" aria-hidden="true" />
                  </div>
                  <p>“{t.texto}”</p>
                  <div className="testimonio-autor">
                    <div className="avatar" aria-hidden="true">{t.iniciales}</div>
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
              <Titulo lineas={[{ t: '¿Cómo trabajamos' }, { t: 'con vos?', em: true }]} />
            </div>
            <div className="pasos-grid" data-reveal="pasos">
              <span className="pasos-linea" aria-hidden="true" />
              {PASOS.map((paso, i) => (
                <div key={paso.num} className="paso" data-spot style={{ '--stagger': `${-i * 26}px`, '--orden': i }}>
                  <div className="paso-num">{paso.num}</div>
                  <div className="paso-icon"><i className={`fa-solid ${paso.icon}`} aria-hidden="true" /></div>
                  <h3>{paso.title}</h3>
                  <p>{paso.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="cta-banner">
          <div className="cta-bg" aria-hidden="true" />
          <div className="container cta-content">
            <div className="cta-text">
              <Titulo lineas={[{ t: '¿Querés vender o alquilar' }, { t: 'tu propiedad?' }]} />
              <p>Sumá tu inmueble a nuestra cartera. Te hacemos una tasación gratuita y nos encargamos de todo.</p>
            </div>
            <div className="cta-actions">
              <a href="#contacto" className="btn-primary" data-magnetic>Quiero tasar mi propiedad</a>
              <a href="/#servicios" className="btn-outline-white">Ver nuestros servicios</a>
            </div>
          </div>
        </section>

        {/* CONTACTO */}
        <section className="contacto" id="contacto">
          <div className="container">
            <div className="section-header section-header--center">
              <Titulo lineas={[{ t: '¿Tenés alguna consulta?' }, { t: 'Escribinos', em: true }]} />
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
                    { icon: 'fa-brands fa-whatsapp', label: 'WhatsApp', val: WHATSAPP.general.label, brand: true },
                  ].map(item => (
                    <div key={item.label} className="info-item">
                      <div className="info-icon"><i className={`fa-${item.brand ? 'brands' : 'solid'} ${item.icon}`} aria-hidden="true" /></div>
                      <div><strong>{item.label}</strong><span>{item.val}</span></div>
                    </div>
                  ))}
                </div>
                <div className="social-row">
                  <a href="https://www.instagram.com/calvinotabuada/" className="social-btn" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-instagram" aria-hidden="true" /></a>
                  <a href="https://www.facebook.com/inmobiliaria2804" className="social-btn" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-facebook-f" aria-hidden="true" /></a>
                  <a href={waLink('general')} className="social-btn" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-whatsapp" aria-hidden="true" /></a>
                </div>
                <div className="contacto-mapa">
                  <iframe
                    src="https://maps.google.com/maps?q=Av.+Mosconi+2804,+Villa+Devoto,+Buenos+Aires,+Argentina&z=16&output=embed"
                    title="Ubicación Calviño Tabuada Propiedades"
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              </div>

              <form className="contacto-form" onSubmit={handleFormSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="c-nombre">Nombre completo</label>
                    <input id="c-nombre" name="nombre" type="text" autoComplete="name" placeholder="Tu nombre…" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="c-email">Email</label>
                    <input id="c-email" name="email" type="email" autoComplete="email" spellCheck={false} placeholder="ejemplo@email.com" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="c-telefono">Teléfono</label>
                    <input id="c-telefono" name="telefono" type="tel" inputMode="tel" autoComplete="tel" placeholder="+54 11 1234-5678" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="c-asunto">Asunto</label>
                    <select id="c-asunto" name="asunto">
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
                  <label htmlFor="c-mensaje">Mensaje</label>
                  <textarea id="c-mensaje" name="mensaje" rows="5" placeholder="Escribí tu consulta acá…" required />
                </div>
                <button type="submit" className={`btn-primary btn-full${formSent ? ' btn--enviado' : ''}`} data-magnetic>
                  {formSent
                    ? <><i className="fa-solid fa-check" aria-hidden="true" /> ¡Mensaje enviado!</>
                    : <><i className="fa-solid fa-paper-plane" aria-hidden="true" /> Enviar mensaje</>}
                </button>
                <p className="sr-only" role="status" aria-live="polite">{formSent ? 'Mensaje enviado' : ''}</p>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* WHATSAPP FLOTANTE */}
      <WhatsAppFloat />

      <Footer />
    </>
  )
}
