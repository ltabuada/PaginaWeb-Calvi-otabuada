import { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../firebase'
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Arranca en true: hasta que Firebase no responda no sabemos si hay sesión.
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  // Propaga el error para que AdminLogin pueda traducir el código.
  const login = (email, pass) => signInWithEmailAndPassword(auth, email, pass)

  const logout = () => signOut(auth)

  return (
    <AuthContext.Provider value={{ user, isAdmin: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
