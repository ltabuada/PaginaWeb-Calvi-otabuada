import { createContext, useContext, useState } from 'react'
import initialListings from '../data/listings.json'

const STORAGE_KEY = 'propiedades_data'

const ListingsContext = createContext(null)

function loadListings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* noop */ }
  return initialListings
}

function saveListings(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function ListingsProvider({ children }) {
  const [listings, setListings] = useState(loadListings)

  const updateListings = (next) => {
    setListings(next)
    saveListings(next)
  }

  const addPropiedad = (propiedad) => {
    const nextId = listings.length > 0 ? Math.max(...listings.map(p => p.id)) + 1 : 1
    const nueva = { ...propiedad, id: nextId }
    updateListings([...listings, nueva])
  }

  const updatePropiedad = (id, datos) => {
    updateListings(listings.map(p => p.id === id ? { ...p, ...datos } : p))
  }

  const deletePropiedad = (id) => {
    updateListings(listings.filter(p => p.id !== id))
  }

  const toggleDisponible = (id) => {
    updateListings(listings.map(p => p.id === id ? { ...p, disponible: !p.disponible } : p))
  }

  const toggleDestacada = (id) => {
    updateListings(listings.map(p => p.id === id ? { ...p, destacada: !p.destacada } : p))
  }

  // Solo las disponibles para usuarios normales
  const listingsPublicos = listings.filter(p => p.disponible)

  return (
    <ListingsContext.Provider value={{
      listings,          // todas (para admin)
      listingsPublicos,  // solo disponibles (para usuarios)
      addPropiedad,
      updatePropiedad,
      deletePropiedad,
      toggleDisponible,
      toggleDestacada,
    }}>
      {children}
    </ListingsContext.Provider>
  )
}

export function useListings() {
  return useContext(ListingsContext)
}
