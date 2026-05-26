import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// Credenciales del admin — cambialas a lo que quieras
const ADMIN_USER = 'admin'
const ADMIN_PASS = 'calvi2024'

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem('admin_logged') === 'true'
  })

  const login = (user, pass) => {
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      sessionStorage.setItem('admin_logged', 'true')
      setIsAdmin(true)
      return true
    }
    return false
  }

  const logout = () => {
    sessionStorage.removeItem('admin_logged')
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
