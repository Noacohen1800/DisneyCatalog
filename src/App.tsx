import { Navigate, Route, Routes } from 'react-router-dom'
import NavBar from './components/NavBar'
import CatalogPage from './pages/CatalogPage'
import FavoritesPage from './pages/FavoritesPage'
import './App.css'

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/characters" replace />} />
        <Route path="/characters" element={<CatalogPage />} />
        {/* Same page, with the card of the character in the URL expanded */}
        <Route path="/characters/:id" element={<CatalogPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        {/* Same page, with the card of the favorite in the URL expanded */}
        <Route path="/favorites/:id" element={<FavoritesPage />} />
        <Route path="*" element={<Navigate to="/characters" replace />} />
      </Routes>
    </>
  )
}

export default App
