import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix leaflet default marker icons when bundled with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function RecenterMap({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.setView(coords, 15)
  }, [coords, map])
  return null
}

export default function MapView({ address, height = '300px' }) {
  const [coords, setCoords] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [queried, setQueried] = useState('')

  useEffect(() => {
    if (!address || address.trim().length < 5) {
      setCoords(null)
      setNotFound(false)
      return
    }

    // Debounce: wait 800ms after last change
    const timer = setTimeout(() => {
      if (address === queried) return
      setLoading(true)
      setNotFound(false)
      const controller = new AbortController()

      fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=ar`,
        { signal: controller.signal, headers: { 'Accept-Language': 'es' } }
      )
        .then(r => r.json())
        .then(data => {
          if (data.length > 0) {
            setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)])
            setNotFound(false)
          } else {
            setCoords(null)
            setNotFound(true)
          }
          setQueried(address)
          setLoading(false)
        })
        .catch(err => {
          if (err.name !== 'AbortError') setLoading(false)
        })

      return () => controller.abort()
    }, 800)

    return () => clearTimeout(timer)
  }, [address, queried])

  if (!address || address.trim().length < 5) return null

  return (
    <div className="map-wrapper">
      {loading && (
        <div className="map-loading">
          <i className="fa-solid fa-spinner fa-spin" /> Buscando ubicación...
        </div>
      )}
      {notFound && !loading && (
        <div className="map-not-found">
          <i className="fa-solid fa-triangle-exclamation" /> No se encontró la dirección en el mapa.
        </div>
      )}
      {coords && !loading && (
        <MapContainer
          center={coords}
          zoom={15}
          style={{ height, width: '100%', borderRadius: '12px' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={coords}>
            <Popup>{address}</Popup>
          </Marker>
          <RecenterMap coords={coords} />
        </MapContainer>
      )}
    </div>
  )
}
