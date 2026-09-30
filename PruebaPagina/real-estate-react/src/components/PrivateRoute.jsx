import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute({ children }) {
  const { isAdmin, loading } = useAuth()

  // Sin esta espera, onAuthStateChanged todavía no resolvió en el primer render
  // y el admin logueado sale pateado al login cada vez que refresca /admin.
  if (loading) {
    return (
      <div className="auth-loading">
        <i className="fa-solid fa-spinner fa-spin" /> Verificando sesión...
      </div>
    )
  }

  return isAdmin ? children : <Navigate to="/admin/login" replace />
}
