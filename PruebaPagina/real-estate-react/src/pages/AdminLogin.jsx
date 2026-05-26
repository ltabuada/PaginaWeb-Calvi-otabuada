import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(() => {
      const ok = login(user.trim(), pass)
      if (ok) {
        navigate('/admin')
      } else {
        setError('Usuario o contraseña incorrectos.')
        setPass('')
      }
      setLoading(false)
    }, 400)
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
            <label>Usuario</label>
            <div className="admin-input-wrapper">
              <i className="fa-solid fa-user" />
              <input
                type="text"
                value={user}
                onChange={e => setUser(e.target.value)}
                placeholder="Usuario"
                autoComplete="username"
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
