import { Link, useNavigate } from 'react-router-dom'

import logo from '../assets/portfolio/logo-white.png'
import StockSearch from '../components/StockSearch'

export default function QuantEquity() {
  const navigate = useNavigate()

  const goTo = (symbol) => {
    const clean = symbol.trim().toUpperCase()
    if (clean) navigate(`/asset/${clean}`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#171821] font-['Inter',-apple-system,'Segoe_UI',sans-serif] text-white">
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <Link
          to="/"
          aria-label="Torna al portfolio"
          className="mb-2 size-16 sm:size-20"
        >
          <img src={logo} alt="" className="size-full object-contain" />
        </Link>
        <h1 className="text-4xl font-extrabold sm:text-[50px] sm:leading-[1.2]">
          Quantitative Risk &amp; Analytics
        </h1>
        <p className="text-lg font-medium text-[#d2d2d2]">
          Search for a stock ticker to start the analysis.
        </p>
        <div className="mt-4 flex w-full justify-center">
          <StockSearch onSelect={goTo} />
        </div>
      </main>
    </div>
  )
}
