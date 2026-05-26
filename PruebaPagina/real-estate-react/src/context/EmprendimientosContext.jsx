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

const EmprendimientosContext = createContext(null)

export function EmprendimientosProvider({ children }) {
  const [emprendimientos, setEmprendimientos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'emprendimientos'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ ...d.data(), _docId: d.id }))
      data.sort((a, b) => a.id - b.id)
      setEmprendimientos(data)
      setLoading(false)
    })
    return unsub
  }, [])

  const addEmprendimiento = async (emp) => {
    const nextId = emprendimientos.length > 0 ? Math.max(...emprendimientos.map(e => e.id)) + 1 : 1
    await addDoc(collection(db, 'emprendimientos'), { ...emp, id: nextId })
  }

  const updateEmprendimiento = async (id, datos) => {
    const emp = emprendimientos.find(e => e.id === id)
    if (!emp) return
    await updateDoc(doc(db, 'emprendimientos', emp._docId), datos)
  }

  const deleteEmprendimiento = async (id) => {
    const emp = emprendimientos.find(e => e.id === id)
    if (!emp) return
    await deleteDoc(doc(db, 'emprendimientos', emp._docId))
  }

  const toggleActivo = async (id) => {
    const emp = emprendimientos.find(e => e.id === id)
    if (!emp) return
    await updateDoc(doc(db, 'emprendimientos', emp._docId), { activo: !emp.activo })
  }

  const emprendimientosActivos = emprendimientos.filter(e => e.activo)

  return (
    <EmprendimientosContext.Provider value={{
      emprendimientos,
      emprendimientosActivos,
      addEmprendimiento,
      updateEmprendimiento,
      deleteEmprendimiento,
      toggleActivo,
      loading,
    }}>
      {children}
    </EmprendimientosContext.Provider>
  )
}

export function useEmprendimientos() {
  return useContext(EmprendimientosContext)
}
