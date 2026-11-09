import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import StockSearch from '../components/StockSearch'

const API = 'http://127.0.0.1:8000'
const percent = (value) => `${(value * 100).toFixed(2)}%`
const amount = (value) => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function Section({ title, children }) {
  return (
    <section className="rounded-xl bg-[#21222d] p-6">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {children}
    </section>
  )
}

export default function VarCVarSimulator() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const request = useRef(null)

  useEffect(() => () => request.current?.abort(), [])

  async function analyzeTicker(ticker) {
    const symbol = ticker.trim().toUpperCase()
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const response = await fetch(`${API}/api/second-project/api/asset/${encodeURIComponent(symbol)}/`, {
        signal: controller.signal,
      })
      if (!response.ok) {
        const body = await response.json()
        throw new Error(body.detail || `Request failed (${response.status}).`)
      }
      const data = await response.json()
      if (!controller.signal.aborted) setResult(data)
    } catch (err) {
      if (!controller.signal.aborted) setError(err.message)
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#171821] font-['Inter',-apple-system,'Segoe_UI',sans-serif] text-white">
      <main className="mx-auto flex max-w-[1100px] flex-col gap-8 px-6 py-10 sm:py-16">
        <Link to="/" className="self-start text-sm text-[#d2d2d2] underline underline-offset-4">
          Back to portfolio
        </Link>
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-extrabold sm:text-4xl">VaR &amp; CVaR Simulator</h1>
          <p className="text-[#d2d2d2]">Explore historical, parametric and Monte Carlo risk analysis for a stock.</p>
        </header>
        <div>
          <StockSearch
            onSelect={analyzeTicker}
            placeholder="Enter a ticker (e.g. AAPL)"
            submitLabel="Analyze"
            submitting={loading}
          />
        </div>
        {error && <p role="alert" className="text-[#ff6b6b]">{error}</p>}
        <div className="grid gap-5 md:grid-cols-3">
          <Section title="Historical VaR &amp; CVaR">
            {loading ? (
              <p role="status" className="mt-4 text-[#d2d2d2]">Loading historical data...</p>
            ) : result ? (
              <div className="mt-4 flex flex-col gap-3 text-sm text-[#d2d2d2]">
                <p className="font-semibold text-white">{result.ticker}</p>
                <p>Confidence level: 95%</p>
                <p>Initial investment: {amount(result.initialInvestment)}</p>
                <p>VaR (log return): <span className="font-semibold text-white">{percent(result.var)}</span></p>
                <p>CVaR (log return): <span className="font-semibold text-white">{percent(result.cvar)}</span></p>
                <p>VaR amount: <span className="font-semibold text-white">{amount(result.varAmount)}</span></p>
                <p>CVaR amount: <span className="font-semibold text-white">{amount(result.cvarAmount)}</span></p>
                <p className="text-xs">Daily log returns over the available historical period (up to 5 years). Amounts use the backend's linear approximation.</p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#d2d2d2]">Enter a ticker to calculate historical risk.</p>
            )}
          </Section>
          <Section title="Parametric VaR &amp; CVaR">
            <p className="mt-4 text-sm text-[#d2d2d2]">Coming soon...</p>
          </Section>
          <Section title="Monte Carlo Simulation">
            <p className="mt-4 text-sm text-[#d2d2d2]">Coming soon...</p>
          </Section>
        </div>
      </main>
    </div>
  )
}