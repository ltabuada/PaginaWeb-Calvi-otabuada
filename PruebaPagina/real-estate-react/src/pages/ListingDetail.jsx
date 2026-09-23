import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MapView from '../components/MapView'
import VideoPlayer from '../components/VideoPlayer'
import { useListings } from '../context/ListingsContext'
import { useConsultas } from '../context/ConsultasContext'

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { listings } = useListings()
  const propiedad = listings.find(p => p.id === parseInt(id))

  const [modalOpen, setModalOpen] = useState(false)
  const [imgActual, setImgActual] = useState(0)
  const [formSent, setFormSent] = useState(false)
  const { addConsulta } = useConsultas()

  useEffect(() => {
    if (!propiedad) navigate('/propiedades')
    else document.title = `${propiedad.titulo} | Inmobiliaria`
    return () => { document.title = 'Inmobiliaria' }
  }, [propiedad, navigate])

  const prevImg = useCallback(() => {
    setImgActual(i => (i - 1 + propiedad.imagenes.length) % propiedad.imagenes.length)
  }, [propiedad])

  const nextImg = useCallback(() => {
    setImgActual(i => (i + 1) % propiedad.imagenes.length)
  }, [propiedad])

  useEffect(() => {
    const onKey = (e) => {
      if (!modalOpen) return
      if (e.key === 'Escape') setModalOpen(false)
      if (e.key === 'ArrowLeft') prevImg()
      if (e.key === 'ArrowRight') nextImg()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalOpen, prevImg, nextImg])

  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modalOpen])

  if (!propiedad) return null

  const precio = new Intl.NumberFormat('es-AR').format(propiedad.precio)

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    await addConsulta({
      tipo: 'propiedad',
      nombre: fd.get('nombre') || '',
      email: fd.get('email') || '',
      telefono: fd.get('telefono') || '',
      mensaje: fd.get('mensaje') || '',
      propiedadId: propiedad.id,
      propiedadTitulo: propiedad.titulo,
    })
    setFormSent(true)
    e.target.reset()
    setTimeout(() => setFormSent(false), 3000)
  }

  return (
    <>
      <Navbar />

      <div className="breadcrumb">
        <Link to="/">Inicio</Link>
        <i className="fa-solid fa-chevron-right" />
        <Link to="/propiedades">Propiedades</Link>
        <i className="fa-solid fa-chevron-right" />
        <span>{propiedad.titulo}</span>
      </div>

      <section className="detail-section">
        {/* HEADER */}
        <div className="detail-header">
          <div className="detail-tipo">{propiedad.tipo}</div>
          <h1 className="detail-titulo">{propiedad.titulo}</h1>
          <div className="detail-ubicacion">
            <i className="fa-solid fa-location-dot" /> {propiedad.ubicacion}
          </div>
        </div>

        {/* GALERÍA */}
        {propiedad.imagenes?.length > 0 ? (
        <div className="galeria-principal">
          {propiedad.imagenes.slice(0, 4).map((img, i) => (
            <div key={i} className="galeria-img" onClick={() => { setImgActual(i); setModalOpen(true) }}>
              <img src={img} alt={`${propiedad.titulo} - foto ${i + 1}`} onError={e => e.currentTarget.classList.add('no-img')} />
              <div className="overlay"><i className="fa-solid fa-expand" /></div>
            </div>
          ))}
        </div>
        ) : (
          <div className="galeria-sin-fotos"><i className="fa-solid fa-image" /> Sin fotos disponibles</div>
        )}

        {/* CONTENIDO */}
        <div className="detail-main">
          <div className="detail-info">
            <div className="detail-precio-row">
              <div className="detail-precio">${precio}</div>
              {propiedad.operacion === 'alquiler' && <div className="detail-precio-mes">/mes</div>}
            </div>
            {propiedad.expensas > 0
              ? <p style={{ color: 'var(--text-light)', fontSize: '.85rem', marginTop: '.3rem' }}>
                  + ${new Intl.NumberFormat('es-AR').format(propiedad.expensas)} expensas
                </p>
              : <p style={{ color: '#22c55e', fontSize: '.85rem', marginTop: '.3rem', fontWeight: 700 }}>Sin expensas</p>
            }

            <div className="detail-features" style={{ marginTop: '1.5rem' }}>
              {[
                { icon: 'fa-layer-group', val: propiedad.ambientes, label: 'Ambientes' },
                { icon: 'fa-bed', val: propiedad.dormitorios, label: 'Dormitorios' },
                { icon: 'fa-bath', val: propiedad.banos, label: 'Baños' },
                { icon: 'fa-maximize', val: `${propiedad.superficie}m²`, label: 'Superficie' },
              ].map(f => (
                <div key={f.label} className="detail-feature">
                  <i className={`fa-solid ${f.icon}`} />
                  <strong>{f.val}</strong>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>

            <div className="detail-desc">
              <h3>Descripción</h3>
              <p>{propiedad.descripcion}</p>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="detail-sidebar">
            <div className="contacto-card">
              <h3>¿Te interesa esta propiedad?</h3>
              <p>Contactanos y te responderemos a la brevedad.</p>
              <div className="precio-sidebar">
                <strong>${precio}</strong>{propiedad.operacion === 'alquiler' && <span>/mes</span>}
              </div>
              <form className="form-contacto" onSubmit={handleFormSubmit}>
                <input name="nombre" type="text" placeholder="Tu nombre" required />
                <input name="email" type="email" placeholder="Tu email" required />
                <input name="telefono" type="tel" placeholder="Tu teléfono" />
                <textarea name="mensaje" rows="3" defaultValue={`Hola, me interesa la propiedad "${propiedad.titulo}". ¿Podrían contactarme?`} />
                <button type="submit" className="btn-primary"
                  style={formSent ? { background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: 'white' } : {}}>
                  {formSent
                    ? <><i className="fa-solid fa-check" /> ¡Consulta enviada!</>
                    : <><i className="fa-solid fa-paper-plane" /> Enviar consulta</>}
                </button>
                <a href={`https://wa.me/5491112345678?text=Hola,%20me%20interesa%20la%20propiedad:%20${encodeURIComponent(propiedad.titulo)}`}
                  target="_blank" rel="noreferrer" className="btn-whatsapp">
                  <i className="fa-brands fa-whatsapp" /> Consultar por WhatsApp
                </a>
              </form>
            </div>
          </div>
        </div>

        {/* VIDEOS */}
        {propiedad.videos && propiedad.videos.length > 0 && (
          <div className="detail-videos-section">
            <h3 className="detail-map-title">
              <i className="fa-solid fa-video" /> Videos
            </h3>
            <div className="detail-videos-grid">
              {propiedad.videos.map((url, i) => (
                <VideoPlayer key={i} url={url} className="detail-video" />
              ))}
            </div>
          </div>
        )}

        {/* MAPA */}
        <div className="detail-map-section">
          <h3 className="detail-map-title">
            <i className="fa-solid fa-location-dot" /> Ubicación
          </h3>
          <p className="detail-map-address">{propiedad.ubicacion}</p>
          <MapView address={propiedad.ubicacion} height="380px" />
        </div>
      </section>

      {/* MODAL */}
      {modalOpen && (
        <div className="modal-galeria open">
          <div className="modal-overlay" onClick={() => setModalOpen(false)} />
          <div className="modal-content">
            <button className="modal-close" onClick={() => setModalOpen(false)}>
              <i className="fa-solid fa-xmark" />
            </button>
            <img src={propiedad.imagenes[imgActual]} alt={propiedad.titulo} />
            <button className="modal-prev" onClick={prevImg}><i className="fa-solid fa-chevron-left" /></button>
            <button className="modal-next" onClick={nextImg}><i className="fa-solid fa-chevron-right" /></button>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
