import { createContext, useContext, useState, useEffect } from 'react'
import { db } from '../firebase'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { useAuth } from './AuthContext'

const ConsultasContext = createContext(null)

export function ConsultasProvider({ children }) {
  const [consultas, setConsultas] = useState([])
  const { isAdmin } = useAuth()

  useEffect(() => {
    // Solo escuchar cuando el admin está logueado
    if (!isAdmin) {
      setConsultas([])
      return
    }

    const unsub = onSnapshot(
      collection(db, 'consultas'),
      (snapshot) => {
        const data = snapshot.docs.map(d => ({ ...d.data(), _docId: d.id }))
        data.sort((a, b) => {
          const fa = a.fecha?.toDate?.() ?? new Date(0)
          const fb = b.fecha?.toDate?.() ?? new Date(0)
          return fb - fa
        })
        setConsultas(data)
      },
      (error) => {
        console.error('ConsultasContext error:', error.code)
      }
    )
    return unsub
  }, [isAdmin])

  const addConsulta = async (data) => {
    await addDoc(collection(db, 'consultas'), {
      ...data,
      fecha: serverTimestamp(),
      leida: false,
      respondida: false,
    })
  }

  const marcarLeida = async (docId, valorActual) => {
    await updateDoc(doc(db, 'consultas', docId), { leida: !valorActual })
  }

  const marcarRespondida = async (docId, valorActual) => {
    await updateDoc(doc(db, 'consultas', docId), { respondida: !valorActual, leida: true })
  }

  const deleteConsulta = async (docId) => {
    await deleteDoc(doc(db, 'consultas', docId))
  }

  const sinLeer = consultas.filter(c => !c.leida).length

  return (
    <ConsultasContext.Provider value={{ consultas, addConsulta, marcarLeida, marcarRespondida, deleteConsulta, sinLeer }}>
      {children}
    </ConsultasContext.Provider>
  )
}

export const useConsultas = () => useContext(ConsultasContext)
