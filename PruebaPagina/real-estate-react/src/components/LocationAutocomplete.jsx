import { useState, useEffect, useRef } from 'react'

export default function LocationAutocomplete({ value, onChange, placeholder, required }) {
  const [inputVal, setInputVal] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef(null)
  const abortRef = useRef(null)

  // Sync when value changes externally (ej: al editar una propiedad existente)
  useEffect(() => {
    setInputVal(value || '')
  }, [value])

  // Cerrar dropdown al hacer clic afuera
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Buscar sugerencias con debounce
  useEffect(() => {
    if (!inputVal || inputVal.trim().length < 3) {
      setSuggestions([])
      setOpen(false)
      return
    }

    const timer = setTimeout(() => {
      if (abortRef.current) abortRef.current.abort()
      abortRef.current = new AbortController()
      setLoading(true)

      fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(inputVal)}&format=json&limit=6&addressdetails=1&countrycodes=ar`,
        { signal: abortRef.current.signal, headers: { 'Accept-Language': 'es' } }
      )
        .then(r => r.json())
        .then(data => {
          setSuggestions(data)
          setOpen(data.length > 0)
          setLoading(false)
        })
        .catch(err => {
          if (err.name !== 'AbortError') setLoading(false)
        })
    }, 400)

    return () => clearTimeout(timer)
  }, [inputVal])

  const handleInputChange = (e) => {
    setInputVal(e.target.value)
    onChange(e.target.value)
  }

  const handleSelect = (s) => {
    // Construir un string corto y limpio con los datos de la dirección
    const addr = s.address || {}
    const parts = [
      addr.road && addr.house_number ? `${addr.road} ${addr.house_number}` : addr.road,
      addr.suburb || addr.neighbourhood || addr.quarter,
      addr.city || addr.town || addr.village || addr.municipality,
      addr.state,
    ].filter(Boolean)

    const formatted = parts.length >= 2 ? parts.join(', ') : s.display_name.split(',').slice(0, 3).join(',').trim()

    setInputVal(formatted)
    onChange(formatted)
    setSuggestions([])
    setOpen(false)
  }

  // Separar el display_name en parte principal y contexto
  const splitDisplay = (s) => {
    const addr = s.address || {}
    const main = addr.road
      ? `${addr.road}${addr.house_number ? ' ' + addr.house_number : ''}`
      : s.display_name.split(',')[0]
    const context = [
      addr.suburb || addr.neighbourhood || addr.quarter,
      addr.city || addr.town || addr.village || addr.municipality,
      addr.state,
    ].filter(Boolean).join(', ')
    return { main, context }
  }

  return (
    <div className="location-autocomplete" ref={containerRef}>
      <div className="location-input-wrap">
        <input
          type="text"
          value={inputVal}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
        />
        {loading && <i className="fa-solid fa-spinner fa-spin location-spinner" />}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="location-suggestions">
          {suggestions.map((s, i) => {
            const { main, context } = splitDisplay(s)
            return (
              <li key={i} className="location-suggestion-item" onMouseDown={() => handleSelect(s)}>
                <div className="suggestion-icon"><i className="fa-solid fa-location-dot" /></div>
                <div className="suggestion-text">
                  <span className="suggestion-main">{main}</span>
                  {context && <span className="suggestion-context">{context}</span>}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
