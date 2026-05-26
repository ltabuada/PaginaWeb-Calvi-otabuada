import { createContext, useContext, useState, useEffect } from 'react'
import { db } from '../firebase'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore'

const ListingsContext = createContext(null)

export function ListingsProvider({ children }) {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'propiedades'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ ...d.data(), _docId: d.id }))
      data.sort((a, b) => a.id - b.id)
      setListings(data)
      setLoading(false)
    })
    return unsub
  }, [])

  const addPropiedad = async (propiedad) => {
    const nextId = listings.length > 0 ? Math.max(...listings.map(p => p.id)) + 1 : 1
    await addDoc(collection(db, 'propiedades'), { ...propiedad, id: nextId })
  }

  const updatePropiedad = async (id, datos) => {
    const prop = listings.find(p => p.id === id)
    if (!prop) return
    await updateDoc(doc(db, 'propiedades', prop._docId), datos)
  }

  const deletePropiedad = async (id) => {
    const prop = listings.find(p => p.id === id)
    if (!prop) return
    await deleteDoc(doc(db, 'propiedades', prop._docId))
  }

  const toggleDisponible = async (id) => {
    const prop = listings.find(p => p.id === id)
    if (!prop) return
    await updateDoc(doc(db, 'propiedades', prop._docId), { disponible: !prop.disponible })
  }

  const toggleDestacada = async (id) => {
    const prop = listings.find(p => p.id === id)
    if (!prop) return
    await updateDoc(doc(db, 'propiedades', prop._docId), { destacada: !prop.destacada })
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
      loading,
    }}>
      {children}
    </ListingsContext.Provider>
  )
}

export function useListings() {
  return useContext(ListingsContext)
}
