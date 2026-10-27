import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ListingsProvider } from './context/ListingsContext'
import { EmprendimientosProvider } from './context/EmprendimientosContext'
import { ConsultasProvider } from './context/ConsultasContext'
import Home from './pages/Home'
import PrivateRoute from './components/PrivateRoute'
import Movimiento from './components/Movimiento'

// Las páginas secundarias (el panel admin pesa ~1300 líneas y el detalle trae
// el mapa de Leaflet) se bajan recién cuando se visitan, para que la home, que
// es por donde entra casi todo el mundo, cargue lo mínimo.
const Listings = lazy(() => import('./pages/Listings'))
const ListingDetail = lazy(() => import('./pages/ListingDetail'))
const Emprendimientos = lazy(() => import('./pages/Emprendimientos'))
const EmprendimientoDetail = lazy(() => import('./pages/EmprendimientoDetail'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminPanel = lazy(() => import('./pages/AdminPanel'))

export default function App() {
  return (
    <AuthProvider>
      <ListingsProvider>
        <EmprendimientosProvider>
          <ConsultasProvider>
            <BrowserRouter>
              <a href="#contenido" className="salto">Saltar al contenido</a>
              <Movimiento />
              <Suspense fallback={<div className="cargando" role="status" aria-label="Cargando…" />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/propiedades" element={<Listings />} />
                  <Route path="/propiedad/:id" element={<ListingDetail />} />
                  <Route path="/emprendimientos" element={<Emprendimientos />} />
                  <Route path="/emprendimiento/:id" element={<EmprendimientoDetail />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={
                    <PrivateRoute>
                      <AdminPanel />
                    </PrivateRoute>
                  } />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ConsultasProvider>
        </EmprendimientosProvider>
      </ListingsProvider>
    </AuthProvider>
  )
}
