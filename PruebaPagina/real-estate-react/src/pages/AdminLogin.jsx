import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Los proyectos nuevos de Firebase traen Email Enumeration Protection, así que
// en la práctica devuelven invalid-credential sin distinguir si el email existe.
// Que los tres casos digan lo mismo además es lo correcto: no confirmamos
// qué direcciones están registradas.
const traducirErrorAuth = (code) => ({
  'auth/invalid-email': 'El email no tiene un formato válido.',
  'auth/invalid-credential': 'Email o contraseña incorrectos.',
  'auth/user-not-found': 'Email o contraseña incorrectos.',
  'auth/wrong-password': 'Email o contraseña incorrectos.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada.',
  'auth/too-many-requests': 'Demasiados intentos fallidos. Esperá unos minutos.',
  'auth/network-request-failed': 'Sin conexión. Revisá tu internet.',
  'auth/operation-not-allowed': 'El ingreso con email y contraseña no está habilitado en Firebase.',
  // Aparece cuando Authentication todavía no fue activado en el proyecto.
  'auth/configuration-not-found': 'Falta activar Authentication en la consola de Firebase (Authentication → Sign-in method → Email/Password).',
  'auth/invalid-login-credentials': 'Email o contraseña incorrectos.',
}[code] || 'No pudimos iniciar sesión. Intentá de nuevo.')

export default function AdminLogin() {
  const { login, isAdmin, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Si ya hay sesión, no tiene sentido mostrar el formulario.
  useEffect(() => {
    if (!authLoading && isAdmin) navigate('/admin', { replace: true })
  }, [authLoading, isAdmin, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email.trim(), pass)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(traducirErrorAuth(err?.code))
      setPass('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-icon">
            <i className="fa-solid fa-shield-halved" />
          </div>
          <h1>Panel Administrativo</h1>
          <p>Ingresá tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-field">
            <label>Email</label>
            <div className="admin-input-wrapper">
              <i className="fa-solid fa-envelope" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="admin-field">
            <label>Contraseña</label>
            <div className="admin-input-wrapper">
              <i className="fa-solid fa-lock" />
              <input
                type="password"
                value={pass}
                onChange={e => setPass(e.target.value)}
                placeholder="Contraseña"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="admin-error">
              <i className="fa-solid fa-circle-exclamation" /> {error}
            </div>
          )}

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? (
              <><i className="fa-solid fa-spinner fa-spin" /> Verificando...</>
            ) : (
              <><i className="fa-solid fa-right-to-bracket" /> Ingresar</>
            )}
          </button>
        </form>

        <a href="/" className="admin-login-back">
          <i className="fa-solid fa-arrow-left" /> Volver al sitio
        </a>
      </div>
    </div>
  )
}
