import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

import logo from '../assets/portfolio/logo-white.png'
import tabMain from '../assets/portfolio/tab-main.svg'
import tabRisk from '../assets/portfolio/tab-risk.svg'
import tabBench from '../assets/portfolio/tab-bench.svg'
import tabMonte from '../assets/portfolio/tab-monte.svg'
import CandleChart from '../components/CandleCharts'
import DistributionChart from '../components/DistributionChart'
import VolatilityChart from '../components/VolatilityChart'
import DrawdownChart from '../components/DrawdownChart'
import SCLChart from '../components/SCLCharts'
import ClassicMontecarlo from '../components/ClassicMontecarlo'
import BootstrapMontecarlo from '../components/BootstrapMontecarlo'
import BlockBootstrapMontecarlo from '../components/BlockBootstrapMontecarlo'
import GarchMontecarlo from '../components/GarchMontecarlo'
import StockSearch from '../components/StockSearch'

const tabs = [
  { id: 'main', label: 'Main view', icon: tabMain, size: 18 },
  { id: 'risk', label: 'Risk Assessment', icon: tabRisk, size: 16 },
  { id: 'benchmark', label: 'Benchmark & Factor Analysis', icon: tabBench, size: 16 },
  { id: 'montecarlo', label: 'Montecarlo Simulations', icon: tabMonte, size: 16 },
]

function MetricCard({ label, value, color }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-[10px] bg-[#21222d] px-[14px] py-[10px]">
      <p className="text-[15px] font-semibold text-white">{label}</p>
      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  )
}

function InfoCard({ label, value, small }) {
  return (
    <div className="flex w-[220px] flex-col gap-[10px] rounded-[10px] bg-[#21222d] px-[14px] py-[10px] font-semibold">
      <p className={`${small ? 'text-[15px]' : 'text-xl'} text-white`}>{label}</p>
      <p className={`text-2xl ${small ? 'text-white' : 'text-[#ff6eee]'}`}>{value ?? '...'}</p>
    </div>
  )
}

const simTypes = [
  { id: 'classic', label: 'Classic Montecarlo', dataKey: 'chartData', Component: ClassicMontecarlo },
  { id: 'bootstrap', label: 'Bootstrap Montecarlo', dataKey: 'bootstrapChartData', Component: BootstrapMontecarlo },
  { id: 'block', label: 'Block Bootstrap Montecarlo', dataKey: 'blockBootstrapChartData', Component: BlockBootstrapMontecarlo },
  { id: 'garch', label: 'Garch Montecarlo', dataKey: 'garchChartData', Component: GarchMontecarlo },
]

function TestCard({ title, passed, pValue }) {
  return (
    <div
      title={`p-value: ${pValue.toExponential(2)}`}
      className="flex h-[80px] min-w-0 flex-1 flex-col justify-center gap-2.5 rounded-[10px] bg-[#21222d] px-[14px]"
    >
      <p className="truncate text-base font-bold leading-tight text-white xl:text-[19px]">{title}</p>
      <p className={`text-xl font-semibold leading-tight ${passed ? 'text-[#5dff67]' : 'text-[#ff3535]'}`}>
        {passed ? 'Successful' : 'Failed'}
      </p>
    </div>
  )
}

const signed = (v, digits = 2) => `${v > 0 ? '+' : ''}${v.toFixed(digits)}%`

export default function AssetDashboard() {
  const { ticker } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('main')
  const [simType, setSimType] = useState('classic')
  const navRef = useRef(null)
  const labelRefs = useRef({})
  const [underline, setUnderline] = useState(null)

  useLayoutEffect(() => {
    const measure = () => {
      const el = labelRefs.current[activeTab]
      if (!el) return
      setUnderline({ left: el.offsetLeft, top: el.offsetTop + el.offsetHeight + 2, width: el.offsetWidth })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [activeTab, loading, error])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/asset/${ticker}/benchmark`)
        if (!response.ok) {
          setError(`Ticker '${ticker}' non trovato o errore nel backend.`)
          return
        }
        setData(await response.json())
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [ticker])

  const goTo = (symbol) => {
    const clean = symbol.trim().toUpperCase()
    if (clean) navigate(`/asset/${clean}`)
  }

  const shell = 'min-h-screen bg-[#171821] font-["Inter",-apple-system,"Segoe_UI",sans-serif] text-white'

  if (loading) {
    return (
      <div className={`${shell} flex items-center justify-center`}>
        <p className="animate-pulse text-xl text-[#d2d2d2]">Caricamento dati e calcoli per {ticker}...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${shell} flex flex-col items-center justify-center gap-4`}>
        <p className="text-xl text-[#ff3535]">{error}</p>
        <Link to="/quantequity" className="text-[#d2d2d2] underline">Torna alla ricerca</Link>
      </div>
    )
  }

  const { summary } = data
  const activeSim = simTypes.find((s) => s.id === simType)
  const ActiveMonteCarlo = activeSim.Component
  const simData = summary[activeSim.dataKey]
  const lastPoint = simData && simData.length ? simData[simData.length - 1] : null
  const returnColor = (v) => (v >= 0 ? 'text-[#5dff67]' : 'text-[#ff3535]')
  const ratios = [
    { label: 'Sharpe', value: summary.sharpeRatio },
    { label: 'Sortino', value: summary.sortinoRatio },
    { label: 'Treynor', value: null },
    { label: 'Info Ratio', value: null },
    { label: 'M² Ratio', value: summary.m2ExtraReturn },
    { label: 'R² Ratio', value: null },
    { label: 'Calmar', value: summary.calmarRatio },
    { label: 'Omega', value: null },
  ]

  return (
    <div className={shell}>
      <div>
        <div className="grid grid-cols-[1fr_minmax(0,340px)_1fr] items-center gap-3 px-6 pt-3 sm:px-10 md:px-[50px]">
          <span aria-hidden="true" />
          <StockSearch onSelect={goTo} placeholder="Search for another stock" />
          <Link to="/" aria-label="Torna al portfolio" className="flex h-[45px] items-center justify-self-end">
                    <img src={logo} alt="" className="size-9 object-contain" />
          </Link>
        </div>

                <h1 className="px-6 pb-2 pt-8 text-center text-2xl font-extrabold sm:text-3xl md:px-[50px] lg:text-[40px] lg:leading-[56px]">
          {data.ticker} | Quantitative Risk &amp; Analytics
        </h1>

        <nav ref={navRef} aria-label="Sezioni analisi" className="relative flex flex-wrap items-center justify-center gap-x-[60px] gap-y-1 px-6 pb-2 pt-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              className="flex cursor-pointer items-center gap-[9px] p-[10px]"
            >
              <img src={tab.icon} alt="" style={{ width: tab.size, height: tab.size }} className="shrink-0" />
              <span ref={(el) => { labelRefs.current[tab.id] = el }} className="text-base font-medium text-white">
                {tab.label}
              </span>
            </button>
          ))}
          {underline && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 h-px bg-white transition-[transform,width] duration-500 ease-in-out"
              style={{ width: underline.width, transform: `translate(${underline.left}px, ${underline.top}px)` }}
            />
          )}
        </nav>
      </div>

      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-[25px] px-6 py-10 md:flex-row md:justify-center md:px-[50px]">
        {activeTab === 'main' ? (
          <>
            <div className="h-[550px] w-full min-w-0 md:flex-1">
              <CandleChart data={data.timeSeries} />
            </div>
            <div className="flex w-full flex-col gap-5 md:w-[220px] md:shrink-0">
              <MetricCard
                label="Last Year Return"
                value={signed(summary.lastYearReturn)}
                color={returnColor(summary.lastYearReturn)}
              />
              <MetricCard
                label="Average Annual Return"
                value={signed(summary.annualizedReturn)}
                color={returnColor(summary.annualizedReturn)}
              />
              <MetricCard
                label="Average Annual Volatility"
                value={`${summary.annualizedVolatility.toFixed(2)}%`}
                color="text-[#ff6eee]"
              />
              <MetricCard
                label="Max Drawdown"
                value={`${summary.maxDrawdown.toFixed(2)}%`}
                color="text-[#ff3535]"
              />
            </div>
          </>
        ) : activeTab === 'risk' ? (
          <div className="flex w-full flex-col gap-[40px] lg:flex-row lg:justify-center">
            <div className="flex w-full min-w-0 flex-col gap-5 lg:max-w-[650px] lg:flex-1">
              <div className="h-[550px] bg-[#21222d]">
                <DistributionChart data={summary.distributionData} ticker={data.ticker} />
              </div>
              <div className="flex flex-col gap-5 sm:flex-row sm:gap-[30px]">
                <TestCard
                  title="Shapiro-Wilk Test"
                  passed={summary.isShapiroNormal}
                  pValue={summary.shapiroPValue}
                />
                <TestCard
                  title="Kolmogorov–Smirnov Test"
                  passed={summary.isKsNormal}
                  pValue={summary.ksPValue}
                />
              </div>
            </div>
            <div className="flex w-full min-w-0 flex-col gap-5 lg:max-w-[650px] lg:flex-1">
              <div className="h-[315px] rounded-[10px] bg-[#21222d]">
                <VolatilityChart data={summary.volatilityData} ticker={data.ticker} />
              </div>
              <div className="h-[315px] rounded-[10px] bg-[#21222d]">
                <DrawdownChart data={summary.drawdownData} ticker={data.ticker} />
              </div>
            </div>
          </div>
        ) : activeTab === 'benchmark' ? (
          <div className="flex w-full flex-col gap-8">
            <div className="flex flex-wrap items-center justify-center gap-x-[60px] gap-y-4 xl:justify-between">
              {ratios.map((r) => (
                <div key={r.label} className="flex flex-col items-center gap-[9px]">
                  <p className="text-sm font-medium text-[#8a94a6]">{r.label}</p>
                  <p className={`text-xl font-bold ${r.value == null ? 'text-[#8a94a6]' : r.value >= 0 ? 'text-[#5dff67]' : 'text-[#ff3535]'}`}>
                    {r.value == null ? '—' : r.value.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex w-full flex-col gap-5 lg:flex-row">
              <div className="h-[580px] min-w-0 bg-[#21222d] lg:flex-1">
                <SCLChart
                  sclLine={summary.sclLine}
                  scatterPoints={summary.scatterPoints}
                  ticker={data.ticker}
                  market={summary.market}
                />
              </div>
              <div className="flex w-full flex-col gap-5 lg:w-[450px] lg:shrink-0">
                <div className="flex flex-col gap-[15px]">
                  <div className="flex items-baseline gap-[15px] rounded-[10px] bg-[#21222d] px-[14px] py-[11.5px] font-bold">
                    <p className="text-white">
                      <span className="text-[28px]">Beta:</span>{' '}
                      <span className="text-[32px] text-[#f2c8ed]">{summary.beta.toFixed(2)}</span>
                    </p>
                    <p className={`text-2xl ${summary.beta > 1 ? 'text-[#ff3535]' : 'text-[#5dff67]'}`}>
                      {summary.beta > 1 ? 'Aggressive' : 'Defensive'}
                    </p>
                  </div>
                  <div className="flex items-baseline gap-[10px] rounded-[10px] bg-[#21222d] px-[14px] py-[11.5px] font-bold">
                    <p className="text-white">
                      <span className="text-[28px]">Alpha:</span>{' '}
                      <span className="text-[32px] text-[#f2c8ed]">{100*summary.alpha.toFixed(4)}%</span>
                    </p>
                    <p className={`text-2xl ${100*summary.alpha >= 0 ? 'text-[#5dff67]' : 'text-[#ff3535]'}`}>
                      {100*summary.alpha >= 0 ? 'Undervalued' : 'Overvalued'}
                    </p>
                  </div>
                </div>
                <div className="flex min-h-[300px] flex-1 flex-col gap-[10px]">
                  <div className="flex flex-1 items-center justify-center bg-[#21222d] text-[#d2d2d2]">Coming soon...</div>
                  <div className="flex flex-1 items-center justify-center bg-[#21222d] text-[#d2d2d2]">Coming soon...</div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'montecarlo' ? (
          <div className="flex w-full flex-col items-center gap-5">
            <div className="flex w-full flex-col gap-[25px] lg:flex-row">
              <div className="h-[600px] min-w-0 bg-[#21222d] lg:flex-1">
                <ActiveMonteCarlo data={summary[activeSim.dataKey]} ticker={data.ticker} />
              </div>
              <div className="flex w-full flex-col gap-[25px] lg:w-[465px] lg:shrink-0">
                <div className="flex flex-wrap justify-center gap-5">
                  <InfoCard label="Number Simulations" value={summary.nSimulations} small />
                  <InfoCard label="Number days" value={summary.nDays} small />
                  <InfoCard label="Initial Price" value={summary.startingPrice.toFixed(2)} />
                  <div className="flex w-[220px] flex-col gap-[10px] rounded-[10px] bg-[#21222d] px-[14px] py-[10px] font-semibold">
                    <p className="text-xl text-white">Percentile Value</p>
                    {lastPoint ? (
                      <div className="flex flex-col text-base leading-snug">
                        {[['P90', 'p90', '#5dff67'], ['P50', 'p50', '#ffa500'], ['P10', 'p10', '#ff3535']].map(([lbl, key, color]) => (
                          <p key={key} style={{ color }}>
                            {lbl}: {lastPoint[key].toFixed(2)}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-2xl text-[#ff6eee]">...</p>
                    )}
                  </div>
                  <InfoCard label="CVaR Value" />
                  <InfoCard label="Confidence Level" />
                </div>
                <div className="flex min-h-[190px] flex-1 items-center justify-center bg-[#21222d] text-[#d2d2d2]">Coming soon...</div>
              </div>
            </div>
            <div className="relative grid w-full             max-w-[900px] grid-cols-4 rounded-[67px] bg-[#21222d] p-1.5 backdrop-blur-[2px]">
              <span
                aria-hidden="true"
                            className="absolute bottom-1.5 left-1.5 top-1.5 w-[calc((100%-12px)/4)] rounded-full bg-[#f7f7f7] transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(${simTypes.findIndex((s) => s.id === simType) * 100}%)` }}
              />
              {simTypes.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSimType(s.id)}
                  className={`relative cursor-pointer rounded-full px-2 py-3 text-center font-["Source_Sans_3","Source_Sans_Pro",sans-serif] text-xs leading-none transition-colors duration-500 sm:px-4 sm:text-base ${
                    simType === s.id ? 'text-[#212330]' : 'text-[#f7f7f7]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-[650px] w-full flex-1 items-center justify-center bg-[#21222d] text-[#d2d2d2]">
            Coming soon
          </div>
        )}
      </main>
      <footer className="px-6 pb-6 text-center text-xs text-[#d2d2d2]">
        TradingView Lightweight Charts™ &middot; Copyright (с) 2025 TradingView, Inc.{' '}
        <a href="https://www.tradingview.com/" target="_blank" rel="noreferrer" className="underline underline-offset-2">
          tradingview.com
        </a>
      </footer>
    </div>
  )
}
