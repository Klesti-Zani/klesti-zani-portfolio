import { Navigate, Route, Routes } from 'react-router-dom'
import AssetDashboard from './pages/AssetDashboard'
import Portfolio from './pages/Portfolio'
import QuantEquity from './pages/QuantEquity'
import VarCVarSimulator from './pages/Var-CVar-Simulator'

export default function App() {
  return (
    // Il componente Routes racchiude tutte le possibili strade/pagine del sito
    <Routes>
      <Route path="/" element={<Portfolio />} />
      <Route path="/quantequity" element={<QuantEquity />} />
      <Route path="/asset/:ticker" element={<AssetDashboard />} />
      <Route path="/var-cvar-simulator" element={<VarCVarSimulator />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}