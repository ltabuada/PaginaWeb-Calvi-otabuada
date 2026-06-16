import { useNavigate } from 'react-router-dom'

export default function PropiedadCard({ propiedad }) {
  const navigate = useNavigate()
  const { id, tipo, operacion, titulo, ubicacion, precio, dormitorios, banos, superficie, ambientes, imagenes, disponible } = propiedad
  const precioFmt = new Intl.NumberFormat('es-AR').format(precio)

  return (
    <div className="propiedad-card" onClick={() => navigate(`/propiedad/${id}`)}>
      <div className="card-img-wrapper">
        <img src={imagenes?.[0]} alt={titulo} loading="lazy" onError={e => e.currentTarget.classList.add('no-img')} />
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
        <h3>{titulo}</h3>
        <div className="card-ubicacion">
          <i className="fa-solid fa-location-dot" /> {ubicacion}
        </div>
        <div className="card-features">
          <div className="feature"><i className="fa-solid fa-bed" /> {dormitorios} dorm.</div>
          <div className="feature"><i className="fa-solid fa-bath" /> {banos} baño{banos > 1 ? 's' : ''}</div>
          <div className="feature"><i className="fa-solid fa-maximize" /> {superficie}m²</div>
          <div className="feature"><i className="fa-solid fa-layer-group" /> {ambientes} amb.</div>
        </div>
        <div className="card-footer">
          <div className="card-precio">
            ${precioFmt}
            {operacion === 'alquiler' && <span> /mes</span>}
          </div>
          <button className="card-btn" onClick={e => { e.stopPropagation(); navigate(`/propiedad/${id}`) }}>
            Ver más <i className="fa-solid fa-arrow-right" />
          </button>
        </div>
      </div>
    </div>
  )
}
