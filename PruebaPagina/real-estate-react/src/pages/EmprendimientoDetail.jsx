import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MapView from '../components/MapView'
import VideoPlayer from '../components/VideoPlayer'
import Titulo from '../components/Titulo'
import { useEmprendimientos } from '../context/EmprendimientosContext'
import { useConsultas } from '../context/ConsultasContext'
import { imgCard, imgFull } from '../lib/media'
import { waLink } from '../lib/contacto'

const formatoNumero = new Intl.NumberFormat('es-AR')

const ESTADO_LABEL = { en_pozo: 'En pozo', en_construccion: 'En construcción', a_estrenar: 'A estrenar' }
const ESTADO_COLOR = { en_pozo: 'emp-badge--pozo', en_construccion: 'emp-badge--construccion', a_estrenar: 'emp-badge--estrenar' }

export default function EmprendimientoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { emprendimientos, loading } = useEmprendimientos()
  const { addConsulta } = useConsultas()

  const emp = emprendimientos.find(e => e.id === parseInt(id))

  const [modalOpen, setModalOpen] = useState(false)
  const [imgActual, setImgActual] = useState(0)
  const [formSent, setFormSent] = useState(false)

  const fotos = emp?.imagenes?.filter(Boolean) ?? []

  // Los datos llegan por onSnapshot: mientras carga no existe todavía, y recién
  // cuando terminó de cargar y sigue sin aparecer se trata como inexistente.
  useEffect(() => {
    if (!loading && !emp) navigate('/emprendimientos', { replace: true })
  }, [loading, emp, navigate])

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [id])

  const prevImg = useCallback(() => {
    setImgActual(i => (i - 1 + fotos.length) % fotos.length)
  }, [fotos.length])

  const nextImg = useCallback(() => {
    setImgActual(i => (i + 1) % fotos.length)
  }, [fotos.length])

  useEffect(() => {
    if (!modalOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setModalOpen(false)
      if (e.key === 'ArrowLeft') prevImg()
      if (e.key === 'ArrowRight') nextImg()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [modalOpen, prevImg, nextImg])

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    // Reutiliza los campos propiedadId/propiedadTitulo a propósito: las reglas
    // de Firestore validan la consulta contra una lista cerrada de claves, y
    // `tipo` ya distingue de qué vino.
    await addConsulta({
      tipo: 'emprendimiento',
      nombre: fd.get('nombre') || '',
      email: fd.get('email') || '',
      telefono: fd.get('telefono') || '',
      mensaje: fd.get('mensaje') || '',
      propiedadId: emp.id,
      propiedadTitulo: emp.titulo,
    })
    setFormSent(true)
    e.target.reset()
    setTimeout(() => setFormSent(false), 3000)
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main id="contenido" tabIndex={-1}>
          <div className="detail-cargando"><p>Cargando emprendimiento…</p></div>
        </main>
        <Footer />
      </>
    )
  }
  if (!emp) return null

  const datos = [
    emp.precioDesde > 0 && { icon: 'fa-tag', val: `USD ${formatoNumero.format(emp.precioDesde)}`, label: 'Desde' },
    emp.superficieDesde > 0 && { icon: 'fa-maximize', val: `${emp.superficieDesde} m²`, label: 'Superficie desde' },
    emp.entrega && { icon: 'fa-calendar-check', val: emp.entrega, label: 'Entrega' },
    emp.tipo && { icon: 'fa-building', val: emp.tipo, label: 'Tipo' },
  ].filter(Boolean)

  return (
    <>
      <Navbar />

      <main id="contenido" tabIndex={-1}>
        <nav className="breadcrumb" aria-label="Ruta">
          <Link to="/">Inicio</Link>
          <i aria-hidden="true" className="fa-solid fa-chevron-right" />
          <Link to="/emprendimientos">Emprendimientos</Link>
          <i aria-hidden="true" className="fa-solid fa-chevron-right" />
          <span aria-current="page">{emp.titulo}</span>
        </nav>

        <section className="detail-section">
          <div className="detail-header">
            <div className="detail-header-top">
              <span className={`emp-badge ${ESTADO_COLOR[emp.estado] || ''}`}>
                {ESTADO_LABEL[emp.estado] || emp.estado}
              </span>
            </div>
            <Titulo as="h1" className="detail-titulo" lineas={[{ t: emp.titulo }]} />
            {emp.ubicacion && (
              <div className="detail-ubicacion">
                <i aria-hidden="true" className="fa-solid fa-location-dot" /> {emp.ubicacion}
              </div>
            )}
          </div>

          {/* GALERÍA */}
          {fotos.length > 0 ? (
            <div className="galeria-principal">
              {fotos.slice(0, 4).map((img, i) => {
                const restantes = fotos.length - 4
                const esUltimaConMas = i === 3 && restantes > 0
                return (
                  <div
                    key={img}
                    className="galeria-img"
                    data-reveal="lista"
                    style={{ '--orden': i }}
                    role="button"
                    tabIndex={0}
                    aria-label={esUltimaConMas
                      ? `Ver las ${fotos.length} fotos de ${emp.titulo}`
                      : `Ampliar foto ${i + 1} de ${emp.titulo}`}
                    onClick={() => { setImgActual(i); setModalOpen(true) }}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setImgActual(i); setModalOpen(true) } }}
                  >
                    <img
                      src={imgCard(img)}
                      alt={`${emp.titulo} - foto ${i + 1}`}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      onError={e => e.currentTarget.classList.add('no-img')}
                    />
                    {/* Con más de cuatro fotos, la última dice cuántas faltan en
                        vez de fingir que la galería termina ahí. */}
                    {esUltimaConMas
                      ? <div className="galeria-mas"><strong>+{restantes}</strong><span>fotos</span></div>
                      : <div className="overlay"><i aria-hidden="true" className="fa-solid fa-expand" /></div>}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="galeria-sin-fotos">
              <i aria-hidden="true" className="fa-solid fa-image" /> Todavía no hay fotos de este emprendimiento
            </div>
          )}

          <div className="detail-main">
            <div className="detail-info">
              {datos.length > 0 && (
                <div className="detail-features">
                  {datos.map(d => (
                    <div key={d.label} className="detail-feature">
                      <i aria-hidden="true" className={`fa-solid ${d.icon}`} />
                      <strong>{d.val}</strong>
                      <span>{d.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {emp.descripcion && (
                <div className="detail-desc">
                  <h3>Sobre el proyecto</h3>
                  <p>{emp.descripcion}</p>
                </div>
              )}
            </div>

            <div className="detail-sidebar">
              <div className="contacto-card">
                <h3>¿Te interesa este emprendimiento?</h3>
                <p>Dejanos tu consulta y te pasamos la información completa: unidades disponibles, plan de pago y financiación.</p>
                {emp.precioDesde > 0 && (
                  <div className="precio-sidebar">
                    <span className="precio-sidebar-desde">Desde</span>
                    <strong>USD {formatoNumero.format(emp.precioDesde)}</strong>
                  </div>
                )}
                <form className="form-contacto" onSubmit={handleFormSubmit}>
                  <input name="nombre" type="text" autoComplete="name" aria-label="Tu nombre" placeholder="Tu nombre…" required />
                  <input name="email" type="email" autoComplete="email" spellCheck={false} aria-label="Tu email" placeholder="Tu email…" required />
                  <input name="telefono" type="tel" inputMode="tel" autoComplete="tel" aria-label="Tu teléfono" placeholder="Tu teléfono…" />
                  <textarea name="mensaje" rows="3" aria-label="Tu mensaje" defaultValue={`Hola, me interesa el emprendimiento "${emp.titulo}". ¿Podrían pasarme más información?`} />
                  <button type="submit" className={`btn-primary${formSent ? ' btn--enviado' : ''}`} data-magnetic>
                    {formSent
                      ? <><i aria-hidden="true" className="fa-solid fa-check" /> ¡Consulta enviada!</>
                      : <><i aria-hidden="true" className="fa-solid fa-paper-plane" /> Enviar consulta</>}
                  </button>
                  <a
                    href={waLink('general', `Hola, me interesa el emprendimiento: ${emp.titulo}`)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-whatsapp"
                  >
                    <i aria-hidden="true" className="fa-brands fa-whatsapp" /> Consultar por WhatsApp
                  </a>
                </form>
              </div>
            </div>
          </div>

          {emp.videos?.length > 0 && (
            <div className="detail-videos-section">
              <h3 className="detail-map-title">
                <i aria-hidden="true" className="fa-solid fa-video" /> Videos
              </h3>
              <div className="detail-videos-grid">
                {emp.videos.map((url, i) => (
                  <VideoPlayer key={url} url={url} title={`${emp.titulo} — video ${i + 1}`} />
                ))}
              </div>
            </div>
          )}

          {emp.ubicacion && (
            <div className="detail-map-section">
              <h3 className="detail-map-title">
                <i aria-hidden="true" className="fa-solid fa-location-dot" /> Ubicación
              </h3>
              <p className="detail-map-address">{emp.ubicacion}</p>
              <MapView address={emp.ubicacion} height="380px" />
            </div>
          )}
        </section>
      </main>

      {modalOpen && fotos.length > 0 && (
        <div className="modal-galeria open" role="dialog" aria-modal="true" aria-label={`Fotos de ${emp.titulo}`}>
          <div className="modal-overlay" onClick={() => setModalOpen(false)} />
          <div className="modal-content">
            <button type="button" className="modal-close" onClick={() => setModalOpen(false)} aria-label="Cerrar">
              <i aria-hidden="true" className="fa-solid fa-xmark" />
            </button>
            <img src={imgFull(fotos[imgActual])} alt={`${emp.titulo} - foto ${imgActual + 1} de ${fotos.length}`} />
            {fotos.length > 1 && (
              <>
                <button type="button" className="modal-prev" onClick={prevImg} aria-label="Foto anterior">
                  <i aria-hidden="true" className="fa-solid fa-chevron-left" />
                </button>
                <button type="button" className="modal-next" onClick={nextImg} aria-label="Foto siguiente">
                  <i aria-hidden="true" className="fa-solid fa-chevron-right" />
                </button>
                <div className="modal-contador">{imgActual + 1} / {fotos.length}</div>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
