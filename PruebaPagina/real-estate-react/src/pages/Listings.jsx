import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PropiedadCard from '../components/PropiedadCard'
import { useListings } from '../context/ListingsContext'

export default function Listings() {
  const { listingsPublicos } = useListings()
  const [searchParams] = useSearchParams()
  const [filtroOperacion, setFiltroOperacion] = useState(searchParams.get('operacion') || '')
  const [filtroTipo, setFiltroTipo] = useState(searchParams.get('tipo') || '')
  const [filtroAmbientes, setFiltroAmbientes] = useState(searchParams.get('ambientes') || '')
  const [filtroPrecio, setFiltroPrecio] = useState('')
  const [filtroBuscar, setFiltroBuscar] = useState(searchParams.get('buscar') || '')
  const [listMode, setListMode] = useState(false)
  const [resultado, setResultado] = useState(listingsPublicos)

  useEffect(() => { filtrar() }, [listingsPublicos])

  const filtrar = () => {
    const buscarLow = filtroBuscar.toLowerCase()
    const res = listingsPublicos.filter(p => {
      if (filtroOperacion && p.operacion !== filtroOperacion) return false
      if (filtroTipo && p.tipo !== filtroTipo) return false
      if (filtroAmbientes) {
        const amb = parseInt(filtroAmbientes)
        if (amb === 4 && p.ambientes < 4) return false
        if (amb < 4 && p.ambientes !== amb) return false
      }
      if (filtroPrecio && p.precio > parseInt(filtroPrecio)) return false
      if (buscarLow && !p.ubicacion.toLowerCase().includes(buscarLow) && !p.titulo.toLowerCase().includes(buscarLow)) return false
      return true
    })
    setResultado(res)
  }

  return (
    <>
      <Navbar />

      <div className="page-header">
        <div className="page-header-content">
          <h1>Nuestras Propiedades</h1>
          <p>Alquiler, venta e inversión — encontrá lo que buscás</p>
        </div>
      </div>

      {/* FILTROS */}
      <div className="filtros-section">
        <div className="filtros-wrapper">
          <div className="filtro-group">
            <label>Operación</label>
            <select value={filtroOperacion} onChange={e => setFiltroOperacion(e.target.value)}>
              <option value="">Todas</option>
              <option value="alquiler">Alquiler</option>
              <option value="venta">Venta</option>
            </select>
          </div>
          <div className="filtro-group">
            <label>Tipo</label>
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
              <option value="">Todos</option>
              <option value="casa">Casa</option>
              <option value="departamento">Departamento</option>
              <option value="ph">PH</option>
            </select>
          </div>
          <div className="filtro-group">
            <label>Ambientes</label>
            <select value={filtroAmbientes} onChange={e => setFiltroAmbientes(e.target.value)}>
              <option value="">Todos</option>
              <option value="1">1 ambiente</option>
              <option value="2">2 ambientes</option>
              <option value="3">3 ambientes</option>
              <option value="4">4+ ambientes</option>
            </select>
          </div>
          <div className="filtro-group">
            <label>Precio máx.</label>
            <select value={filtroPrecio} onChange={e => setFiltroPrecio(e.target.value)}>
              <option value="">Sin límite</option>
              <option value="200000">$200.000</option>
              <option value="300000">$300.000</option>
              <option value="400000">$400.000</option>
              <option value="500000">$500.000</option>
            </select>
          </div>
          <div className="filtro-group">
            <label>Buscar</label>
            <input type="text" placeholder="Barrio, ciudad..."
              value={filtroBuscar} onChange={e => setFiltroBuscar(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && filtrar()} />
          </div>
          <button className="btn-filtrar" onClick={filtrar}>
            <i className="fa-solid fa-magnifying-glass" /> Buscar
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="listings-section">
        <div className="listings-header">
          <p>{resultado.length} propiedad{resultado.length !== 1 ? 'es' : ''} encontrada{resultado.length !== 1 ? 's' : ''}</p>
          <div className="view-toggle">
            <button className={`view-btn${!listMode ? ' active' : ''}`} onClick={() => setListMode(false)}>
              <i className="fa-solid fa-grip" />
            </button>
            <button className={`view-btn${listMode ? ' active' : ''}`} onClick={() => setListMode(true)}>
              <i className="fa-solid fa-list" />
            </button>
          </div>
        </div>

        <div className={`propiedades-grid${listMode ? ' list-mode' : ''}`}>
          {resultado.length === 0 ? (
            <div className="no-results">
              <i className="fa-solid fa-magnifying-glass" />
              <h3>Sin resultados</h3>
              <p>Probá con otros filtros de búsqueda.</p>
            </div>
          ) : (
            resultado.map(p => <PropiedadCard key={p.id} propiedad={p} />)
          )}
        </div>
      </div>

      <Footer />
    </>
  )
}
