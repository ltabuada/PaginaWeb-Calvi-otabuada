import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useEmprendimientos } from '../context/EmprendimientosContext'

const ESTADO_LABEL = { en_pozo: 'En pozo', en_construccion: 'En construcción', a_estrenar: 'A estrenar' }
const ESTADO_COLOR = { en_pozo: 'emp-badge--pozo', en_construccion: 'emp-badge--construccion', a_estrenar: 'emp-badge--estrenar' }

export default function Emprendimientos() {
  const { emprendimientosActivos, loading } = useEmprendimientos()

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.1 })
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [emprendimientosActivos])

  return (
    <>
      <Navbar />

      <div className="page-header">
        <div className="page-header-content">
          <h1>Emprendimientos</h1>
          <p>Proyectos inmobiliarios en desarrollo — invertí desde el pozo</p>
        </div>
      </div>

      {/* QUÉ ES UN EMPRENDIMIENTO */}
      <section className="emp-info-section">
        <div className="container">
          <div className="emp-info-grid fade-up">
            <div className="emp-info-text">
              <div className="section-tag">¿Qué es un emprendimiento?</div>
              <h2>Invertí en proyectos<br /><span>en construcción</span></h2>
              <p>Un emprendimiento inmobiliario es un proyecto de construcción en desarrollo donde podés adquirir una unidad desde el pozo —es decir, antes de que esté terminada— a un precio significativamente menor al del mercado final.</p>
              <p style={{ marginTop: '1rem' }}>Es una de las formas más rentables de inversión inmobiliaria: comprás barato, el valor sube a medida que avanza la obra, y al momento de la entrega ya tenés una plusvalía importante.</p>
            </div>
            <div className="emp-info-cards">
              {[
                { icon: 'fa-arrow-trend-up', title: 'Mayor rentabilidad', desc: 'El precio en pozo puede ser hasta un 30% menor al valor de entrega.' },
                { icon: 'fa-calendar-days', title: 'Cuotas accesibles', desc: 'Financiación directa con el desarrollador durante toda la obra.' },
                { icon: 'fa-shield-halved', title: 'Inversión segura', desc: 'Proyectos seleccionados con desarrolladores de trayectoria comprobada.' },
                { icon: 'fa-key', title: 'Llave en mano', desc: 'Te acompañamos desde la firma hasta la escritura y entrega.' },
              ].map(item => (
                <div key={item.title} className="emp-info-card fade-up">
                  <div className="emp-info-icon"><i className={`fa-solid ${item.icon}`} /></div>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EMPRENDIMIENTOS VIGENTES */}
      <section className="emp-vigentes-section">
        <div className="container">
          <div className="section-header section-header--center fade-up">
            <div className="section-tag">Disponibles ahora</div>
            <h2>Emprendimientos<br /><span>vigentes</span></h2>
          </div>

          {loading ? (
            <div className="emp-empty fade-up"><p>Cargando...</p></div>
          ) : emprendimientosActivos.length === 0 ? (
            <div className="emp-empty fade-up">
              <div className="emp-empty-icon"><i className="fa-solid fa-building-circle-arrow-right" /></div>
              <h3>Próximamente nuevos proyectos</h3>
              <p>Estamos incorporando nuevos emprendimientos a nuestra cartera. Dejanos tu consulta y te avisamos en cuanto estén disponibles.</p>
              <a href="/#contacto" className="btn-primary">
                <i className="fa-solid fa-bell" /> Quiero que me avisen
              </a>
            </div>
          ) : (
            <div className="emp-cards-grid">
              {emprendimientosActivos.map(e => (
                <div key={e.id} className="emp-listing-card fade-up">
                  <div className="emp-listing-img">
                    <img src={e.imagenes[0]} alt={e.titulo} />
                    <span className={`emp-badge ${ESTADO_COLOR[e.estado]}`}>{ESTADO_LABEL[e.estado]}</span>
                  </div>
                  <div className="emp-listing-body">
                    <h3>{e.titulo}</h3>
                    <p className="emp-listing-ubicacion"><i className="fa-solid fa-location-dot" /> {e.ubicacion}</p>
                    <p className="emp-listing-desc">{e.descripcion}</p>
                    <div className="emp-listing-stats">
                      {e.precioDesde > 0 && (
                        <div className="emp-stat"><i className="fa-solid fa-tag" /><span>Desde USD {new Intl.NumberFormat('es-AR').format(e.precioDesde)}</span></div>
                      )}
                      {e.superficieDesde > 0 && (
                        <div className="emp-stat"><i className="fa-solid fa-ruler-combined" /><span>Desde {e.superficieDesde} m²</span></div>
                      )}
                      {e.entrega && (
                        <div className="emp-stat"><i className="fa-solid fa-calendar-check" /><span>Entrega: {e.entrega}</span></div>
                      )}
                    </div>
                    <a href="/#contacto" className="btn-primary btn-full">
                      Consultar <i className="fa-solid fa-arrow-right" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner">
        <div className="cta-bg" />
        <div className="container cta-content">
          <div className="cta-text">
            <h2>¿Tenés un proyecto<br />para desarrollar?</h2>
            <p>Si sos desarrollador o tenés un terreno, contactanos y lo comercializamos juntos.</p>
          </div>
          <div className="cta-actions">
            <a href="/#contacto" className="btn-primary">Contactarnos</a>
            <Link to="/" className="btn-outline-white">Volver al inicio</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
