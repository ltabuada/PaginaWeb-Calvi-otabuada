import { Link } from 'react-router-dom'
import { imgCard } from '../lib/media'

// Se crea una vez: construir un Intl.NumberFormat en cada render es de los
// objetos más caros de la API y acá se repite por tarjeta.
const formatoPrecio = new Intl.NumberFormat('es-AR')

export default function PropiedadCard({ propiedad, orden = 0 }) {
  const { id, tipo, operacion, titulo, ubicacion, precio, dormitorios, banos, superficie, ambientes, imagenes, disponible } = propiedad
  const precioFmt = formatoPrecio.format(precio)
  const destino = `/propiedad/${id}`

  return (
    <article
      className="propiedad-card"
      data-reveal="lista"
      data-spot
      style={{ '--orden': orden }}
    >
      <div className="card-img-wrapper">
        <img src={imgCard(imagenes?.[0])} alt={titulo} loading="lazy" decoding="async" onError={e => e.currentTarget.classList.add('no-img')} />
        <span className={`card-badge ${disponible ? 'disponible' : 'alquilado'}`}>
          {disponible ? 'Disponible' : 'No disponible'}
        </span>
        {operacion && (
          <span className={`card-badge-op card-badge-op--${operacion}`}>
            {operacion === 'alquiler' ? 'Alquiler' : 'Venta'}
          </span>
        )}
      </div>
      <div className="card-body">
        <div className="card-tipo">{tipo}</div>
        <h3><Link to={destino} className="card-enlace" viewTransition>{titulo}</Link></h3>
        <div className="card-ubicacion">
          <i className="fa-solid fa-location-dot" aria-hidden="true" /> {ubicacion}
        </div>
        <div className="card-features">
          <div className="feature"><i className="fa-solid fa-bed" aria-hidden="true" /> {dormitorios} dorm.</div>
          <div className="feature"><i className="fa-solid fa-bath" aria-hidden="true" /> {banos} baño{banos > 1 ? 's' : ''}</div>
          <div className="feature"><i className="fa-solid fa-maximize" aria-hidden="true" /> {superficie}m²</div>
          <div className="feature"><i className="fa-solid fa-layer-group" aria-hidden="true" /> {ambientes} amb.</div>
        </div>
        <div className="card-footer">
          <div className="card-precio">
            ${precioFmt}
            {operacion === 'alquiler' && <span> /mes</span>}
          </div>
          <Link to={destino} className="card-btn" viewTransition aria-label={`Ver más sobre ${titulo}`}>
            Ver más <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}
