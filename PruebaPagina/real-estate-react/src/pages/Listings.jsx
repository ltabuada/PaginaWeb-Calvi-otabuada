import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PropiedadCard from '../components/PropiedadCard'
import Titulo from '../components/Titulo'
import { useListings } from '../context/ListingsContext'

export default function Listings() {
  const { listingsPublicos } = useListings()
  const [searchParams] = useSearchParams()
  const [filtroOperacion, setFiltroOperacion] = useState(() => searchParams.get('operacion') || '')
  const [filtroTipo, setFiltroTipo] = useState(() => searchParams.get('tipo') || '')
  const [filtroAmbientes, setFiltroAmbientes] = useState(() => searchParams.get('ambientes') || '')
  const [filtroPrecio, setFiltroPrecio] = useState('')
  const [filtroBuscar, setFiltroBuscar] = useState(() => searchParams.get('buscar') || '')
  const [listMode, setListMode] = useState(false)
  const [resultado, setResultado] = useState(listingsPublicos)

  // Los filtros se aplican al pulsar "Buscar" (o Enter), no en cada tecla; por
  // eso el efecto solo reacciona a que lleguen propiedades nuevas.
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

      <main id="contenido" tabIndex={-1}>
        <div className="page-header">
          <div className="page-header-content">
            <Titulo as="h1" lineas={[{ t: 'Nuestras Propiedades' }]} />
            <span className="linea-mascara" style={{ '--retraso': '.55s' }}>
              <p>Alquiler, venta e inversión — encontrá lo que buscás</p>
            </span>
          </div>
        </div>

        {/* FILTROS */}
        <form className="filtros-section" role="search" aria-label="Filtrar propiedades" onSubmit={e => { e.preventDefault(); filtrar() }}>
          <div className="filtros-wrapper">
            <div className="filtro-group">
              <label htmlFor="f-operacion">Operación</label>
              <select id="f-operacion" value={filtroOperacion} onChange={e => setFiltroOperacion(e.target.value)}>
                <option value="">Todas</option>
                <option value="alquiler">Alquiler</option>
                <option value="venta">Venta</option>
              </select>
            </div>
            <div className="filtro-group">
              <label htmlFor="f-tipo">Tipo</label>
              <select id="f-tipo" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
                <option value="">Todos</option>
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
            <div className="filtro-group">
              <label htmlFor="f-ambientes">Ambientes</label>
              <select id="f-ambientes" value={filtroAmbientes} onChange={e => setFiltroAmbientes(e.target.value)}>
                <option value="">Todos</option>
                <option value="1">1 ambiente</option>
                <option value="2">2 ambientes</option>
                <option value="3">3 ambientes</option>
                <option value="4">4+ ambientes</option>
              </select>
            </div>
            <div className="filtro-group">
              <label htmlFor="f-precio">Precio máx.</label>
              <select id="f-precio" value={filtroPrecio} onChange={e => setFiltroPrecio(e.target.value)}>
                <option value="">Sin límite</option>
                <option value="200000">$200.000</option>
                <option value="300000">$300.000</option>
                <option value="400000">$400.000</option>
                <option value="500000">$500.000</option>
              </select>
            </div>
            <div className="filtro-group">
              <label htmlFor="f-buscar">Buscar</label>
              <input id="f-buscar" type="search" name="buscar" autoComplete="off" placeholder="Barrio, ciudad…"
                value={filtroBuscar} onChange={e => setFiltroBuscar(e.target.value)} />
            </div>
            <button type="submit" className="btn-filtrar">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> Buscar
            </button>
          </div>
        </form>

        {/* GRID */}
        <div className="listings-section">
          <div className="listings-header">
            <p role="status" aria-live="polite">{resultado.length} propiedad{resultado.length !== 1 ? 'es' : ''} encontrada{resultado.length !== 1 ? 's' : ''}</p>
            <div className="view-toggle" role="group" aria-label="Vista">
              <button type="button" className={`view-btn${!listMode ? ' active' : ''}`} onClick={() => setListMode(false)} aria-label="Vista de grilla" aria-pressed={!listMode}>
                <i className="fa-solid fa-grip" aria-hidden="true" />
              </button>
              <button type="button" className={`view-btn${listMode ? ' active' : ''}`} onClick={() => setListMode(true)} aria-label="Vista de lista" aria-pressed={listMode}>
                <i className="fa-solid fa-list" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className={`propiedades-grid${listMode ? ' list-mode' : ''}`}>
            {resultado.length === 0 ? (
              <div className="no-results">
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
                <h3>Sin resultados</h3>
                <p>Probá con otros filtros de búsqueda.</p>
              </div>
            ) : (
              resultado.map((p, i) => <PropiedadCard key={p.id} propiedad={p} orden={i % 3} />)
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
