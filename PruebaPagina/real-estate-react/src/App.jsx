import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ListingsProvider } from './context/ListingsContext'
import { EmprendimientosProvider } from './context/EmprendimientosContext'
import Home from './pages/Home'
import Listings from './pages/Listings'
import ListingDetail from './pages/ListingDetail'
import AdminLogin from './pages/AdminLogin'
import AdminPanel from './pages/AdminPanel'
import Emprendimientos from './pages/Emprendimientos'
import PrivateRoute from './components/PrivateRoute'

export default function App() {
  return (
    <AuthProvider>
      <ListingsProvider>
        <EmprendimientosProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/propiedades" element={<Listings />} />
            <Route path="/propiedad/:id" element={<ListingDetail />} />
            <Route path="/emprendimientos" element={<Emprendimientos />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <PrivateRoute>
                <AdminPanel />
              </PrivateRoute>
            } />
          </Routes>
        </BrowserRouter>
        </EmprendimientosProvider>
      </ListingsProvider>
    </AuthProvider>
  )
}
