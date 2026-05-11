import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Listings from './pages/Listings'
import ListingDetail from './pages/ListingDetail'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/propiedades" element={<Listings />} />
        <Route path="/propiedad/:id" element={<ListingDetail />} />
      </Routes>
    </BrowserRouter>
  )
}
