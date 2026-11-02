import { Navigate, Route, Routes } from 'react-router-dom'
import CatalogPage from './pages/CatalogPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/characters" replace />} />
      <Route path="/characters" element={<CatalogPage />} />
      {/* Same page, plus the details pop-up for the character in the URL */}
      <Route path="/characters/:id" element={<CatalogPage />} />
      <Route path="*" element={<Navigate to="/characters" replace />} />
    </Routes>
  )
}

export default App
