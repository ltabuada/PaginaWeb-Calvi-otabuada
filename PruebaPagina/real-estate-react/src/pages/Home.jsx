import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PropiedadCard from '../components/PropiedadCard'
import listings from '../data/listings.json'

const SLIDES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1800',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1800',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1800',
]

export default function Home() {
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
    if (tipo) params.set('tipo', tipo)
    if (ambientes) params.set('ambientes', ambientes)
    navigate(`/propiedades${params.toString() ? '?' + params.toString() : ''}`)
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    setFormSent(true)
    setTimeout(() => { setFormSent(false); e.target.reset() }, 3000)
  }

  const destacadas = listings.filter(p => p.destacada).slice(0, 3)

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
            <span className="dot" /> Propiedades en alquiler
          </div>
          <h1>Tu próximo hogar<br /><span className="highlight">te está esperando</span></h1>
          <p>Encontrá la propiedad ideal con la mejor atención personalizada.<br />Casas, departamentos y PH en las mejores zonas.</p>

          <div className="hero-search">
            <div className="search-field">
              <i className="fa-solid fa-location-dot" />
              <input type="text" placeholder="Barrio o ciudad..."
                value={buscar} onChange={e => setBuscar(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleBuscar()} />
            </div>
            <div className="search-divider" />
            <div className="search-field">
              <i className="fa-solid fa-home" />
              <select value={tipo} onChange={e => setTipo(e.target.value)}>
                <option value="">Tipo de propiedad</option>
                <option value="departamento">Departamento</option>
                <option value="casa">Casa</option>
                <option value="ph">PH</option>
              </select>
            </div>
            <div className="search-divider" />
            <div className="search-field">
              <i className="fa-solid fa-layer-group" />
              <select value={ambientes} onChange={e => setAmbientes(e.target.value)}>
                <option value="">Ambientes</option>
                <option value="1">1 ambiente</option>
                <option value="2">2 ambientes</option>
                <option value="3">3 ambientes</option>
                <option value="4">4+</option>
              </select>
            </div>
            <button className="search-btn" onClick={handleBuscar}>
              <i className="fa-solid fa-magnifying-glass" /> Buscar
            </button>
          </div>

          <div className="hero-stats">
            <div className="hero-stat"><strong>+200</strong><span>Propiedades</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>+1.500</strong><span>Clientes satisfechos</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>10 años</strong><span>De experiencia</span></div>
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
            {[
              { icon: 'fa-building', label: 'Departamentos', tipo: 'departamento' },
              { icon: 'fa-house', label: 'Casas', tipo: 'casa' },
              { icon: 'fa-building-columns', label: 'PH', tipo: 'ph' },
            ].map(c => (
              <Link key={c.tipo} to={`/propiedades?tipo=${c.tipo}`} className="categoria-card fade-up">
                <div className="cat-icon"><i className={`fa-solid ${c.icon}`} /></div>
                <h3>{c.label}</h3>
                <span className="cat-link">Ver disponibles <i className="fa-solid fa-arrow-right" /></span>
              </Link>
            ))}
            <Link to="/propiedades" className="categoria-card categoria-card--accent fade-up">
              <div className="cat-icon"><i className="fa-solid fa-star" /></div>
              <h3>Destacadas</h3>
              <span className="cat-link">Ver todas <i className="fa-solid fa-arrow-right" /></span>
            </Link>
          </div>
        </div>
      </section>

      {/* DESTACADAS */}
      <section className="destacadas" id="destacadas">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="section-tag">Propiedades destacadas</div>
              <h2>Las mejores opciones<br /><span>para alquilar hoy</span></h2>
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
              <img className="img-grande" src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=700" alt="Equipo" />
              <img className="img-chica" src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400" alt="Propiedad" />
              <div className="nosotros-badge">
                <strong>10+</strong>
                <span>Años de<br />experiencia</span>
              </div>
            </div>
            <div className="nosotros-content">
              <div className="section-tag">¿Quiénes somos?</div>
              <h2>Una inmobiliaria que<br /><span>trabaja para vos</span></h2>
              <p>Somos un equipo de profesionales apasionados por el mercado inmobiliario argentino. Nuestra misión es conectar a las personas con el hogar ideal, brindando un servicio transparente, ágil y personalizado.</p>
              <p>Con más de 10 años de experiencia y cientos de familias que ya encontraron su lugar, sabemos que cada búsqueda es única.</p>
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
            <h2>¿Cómo alquilar con nosotros?</h2>
          </div>
          <div className="pasos-grid">
            {[
              { num: '01', icon: 'fa-magnifying-glass', title: 'Buscá tu propiedad', desc: 'Explorá nuestro catálogo y filtrá por zona, tipo, precio y más.' },
              { num: '02', icon: 'fa-calendar-check', title: 'Coordiná una visita', desc: 'Contactanos y te organizamos una visita en el horario que mejor te quede.' },
              { num: '03', icon: 'fa-file-signature', title: 'Firmá el contrato', desc: 'Nuestro equipo legal te acompaña en cada paso del proceso de alquiler.' },
              { num: '04', icon: 'fa-key', title: '¡Recibí las llaves!', desc: 'Mudarte es más fácil cuando tenés el equipo correcto de tu lado.' },
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

      {/* TESTIMONIOS */}
      <section className="testimonios">
        <div className="container">
          <div className="section-header section-header--center">
            <div className="section-tag">Testimonios</div>
            <h2 style={{ color: 'white' }}>Lo que dicen nuestros clientes</h2>
          </div>
          <div className="testimonios-grid">
            {[
              { ini: 'ML', nombre: 'María López', zona: 'Palermo, Buenos Aires', texto: '"Encontré mi departamento en menos de una semana. La atención fue increíble y todo el proceso muy transparente. Súper recomendable."', dest: false },
              { ini: 'CR', nombre: 'Carlos Rodríguez', zona: 'Belgrano, Buenos Aires', texto: '"El proceso fue rapidísimo. Nos asesoraron en todo momento y en 10 días ya estábamos firmando el contrato. Excelente equipo profesional."', dest: true },
              { ini: 'SG', nombre: 'Sofía García', zona: 'Caballito, Buenos Aires', texto: '"La mejor inmobiliaria con la que trabajé. Siempre disponibles, muy honestos y con un trato muy humano. Ya recomendé a varios amigos."', dest: false },
            ].map(t => (
              <div key={t.nombre} className={`testimonio fade-up${t.dest ? ' testimonio--destacado' : ''}`}>
                <div className="testimonio-top">
                  <div className="estrellas">★★★★★</div>
                  <i className="fa-solid fa-quote-right quote-icon" />
                </div>
                <p>{t.texto}</p>
                <div className="testimonio-autor">
                  <div className="avatar">{t.ini}</div>
                  <div><strong>{t.nombre}</strong><span>{t.zona}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner">
        <div className="cta-bg" />
        <div className="container cta-content">
          <div className="cta-text">
            <h2>¿Tenés una propiedad<br />para alquilar?</h2>
            <p>Sumá tu propiedad a nuestro catálogo y llegá a miles de personas que buscan alquilar hoy.</p>
          </div>
          <div className="cta-actions">
            <a href="#contacto" className="btn-primary">Publicar mi propiedad</a>
            <Link to="/propiedades" className="btn-outline-white">Ver propiedades</Link>
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
                  { icon: 'fa-location-dot', label: 'Dirección', val: 'Av. Corrientes 1234, Buenos Aires' },
                  { icon: 'fa-phone', label: 'Teléfono', val: '+54 11 1234-5678' },
                  { icon: 'fa-envelope', label: 'Email', val: 'contacto@inmobiliaria.com' },
                  { icon: 'fa-brands fa-whatsapp', label: 'WhatsApp', val: '+54 9 11 1234-5678', brand: true },
                ].map(item => (
                  <div key={item.label} className="info-item">
                    <div className="info-icon"><i className={`fa-${item.brand ? 'brands' : 'solid'} ${item.icon}`} /></div>
                    <div><strong>{item.label}</strong><span>{item.val}</span></div>
                  </div>
                ))}
              </div>
              <div className="social-row">
                <a href="#" className="social-btn"><i className="fa-brands fa-instagram" /></a>
                <a href="#" className="social-btn"><i className="fa-brands fa-facebook-f" /></a>
                <a href="#" className="social-btn"><i className="fa-brands fa-whatsapp" /></a>
              </div>
            </div>

            <form className="contacto-form" onSubmit={handleFormSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre completo</label>
                  <input type="text" placeholder="Juan García" required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" placeholder="juan@email.com" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono</label>
                  <input type="tel" placeholder="+54 11 ...." />
                </div>
                <div className="form-group">
                  <label>Asunto</label>
                  <select>
                    <option>Consulta general</option>
                    <option>Quiero alquilar</option>
                    <option>Publicar propiedad</option>
                    <option>Otro</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Mensaje</label>
                <textarea rows="5" placeholder="Escribí tu consulta acá..." required />
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
