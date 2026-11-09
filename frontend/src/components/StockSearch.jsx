import { useEffect, useRef, useState } from 'react'

import searchIcon from '../assets/portfolio/search.svg'

const API = 'http://127.0.0.1:8000'

function CompanyLogo({ src, symbol }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#2b2d3b] text-xs font-bold text-white">
        {symbol.slice(0, 2)}
      </span>
    )
  }
  return (
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
      className="size-9 shrink-0 rounded-md bg-white object-cover"
    />
  )
}

function Change({ value }) {
  if (value == null) return <span className="text-sm font-semibold text-[#d2d2d2]">—</span>
  const color = value >= 0 ? 'text-[#5dff67]' : 'text-[#ff3535]'
  return (
    <span className={`text-sm font-semibold ${color}`}>
      {value >= 0 ? '+' : ''}
      {value.toFixed(2)}%
    </span>
  )
}

export default function StockSearch({
  onSelect,
  placeholder = 'Search for a stock ticker(e.g. AAPL, NVDA)',
  submitLabel,
  submitting = false,
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API}/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        })
        if (res.ok) {
          setResults(await res.json())
          setHighlight(-1)
        }
      } catch {
        // richiesta annullata o backend non raggiungibile
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, query ? 250 : 0)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query, open])

  useEffect(() => {
    const onClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const select = (symbol) => {
    setOpen(false)
    setQuery('')
    onSelect(symbol)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (highlight >= 0 && results[highlight]) select(results[highlight].symbol)
    else if (query.trim()) select(query)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setHighlight((h) => Math.min(h + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, -1))
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={wrapperRef} className={`relative w-full text-left ${submitLabel ? '' : 'max-w-[400px]'}`}>
      <form onSubmit={handleSubmit} className={submitLabel ? 'flex flex-col gap-3 sm:flex-row' : undefined}>
        <label className="flex h-[45px] w-full min-w-0 items-center gap-1.5 rounded-lg bg-[#21222d] px-4 ring-1 ring-transparent transition focus-within:ring-white/25">
          <img src={searchIcon} alt="" className="size-[14px] shrink-0" />
          <input
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls="stock-suggestions"
            autoComplete="off"
            placeholder={placeholder}
            aria-label="Search for a stock"
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-base font-medium text-[#d2d2d2] placeholder-[#d2d2d2]/70 outline-none"
          />
        </label>
        {submitLabel && (
          <button type="submit" disabled={submitting} className="shrink-0 rounded-lg bg-white px-6 py-3 font-semibold text-[#171821] disabled:opacity-50">
            {submitting ? 'Analyzing...' : submitLabel}
          </button>
        )}
      </form>

      {open && (
        <ul
          id="stock-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-[53px] z-20 max-h-[360px] overflow-y-auto rounded-lg bg-[#21222d] p-1.5 shadow-[0px_20px_30px_rgba(0,0,0,0.35)] ring-1 ring-white/10"
        >
          {results.length === 0 && (
            <li className="flex h-[55px] items-center px-3 text-sm font-medium text-[#d2d2d2]">
              {loading ? 'Searching…' : 'No results'}
            </li>
          )}
          {results.map((stock, i) => (
            <li key={stock.symbol} role="option" aria-selected={i === highlight}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(stock.symbol)}
                onMouseEnter={() => setHighlight(i)}
                className={`flex h-[55px] w-full items-center gap-3 rounded-md px-3 text-left transition-colors ${
                  i === highlight ? 'bg-[#2b2d3b]' : ''
                }`}
              >
                <CompanyLogo src={stock.logo} symbol={stock.symbol} />
                <span className="flex min-w-0 flex-1 flex-col justify-center">
                  <span className="text-sm font-semibold leading-tight text-white">{stock.symbol}</span>
                  <span className="truncate text-xs font-medium leading-tight text-[#d2d2d2]">{stock.name}</span>
                </span>
                <span className="w-[70px] shrink-0 text-right">
                  <Change value={stock.changePercent} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
