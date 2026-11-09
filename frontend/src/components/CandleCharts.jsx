import { useEffect, useRef } from 'react'
import { createChart, ColorType, CandlestickSeries, HistogramSeries } from 'lightweight-charts'

const UP = '#5dff67'
const DOWN = '#ff3535'

export default function CandleChart({ data }) {
  const chartContainerRef = useRef(null)

  useEffect(() => {
    const container = chartContainerRef.current
    if (!data || data.length === 0 || !container) return undefined
    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: '#21222d' },
        textColor: '#d2d2d2',
        fontFamily: "Inter, 'Segoe UI', sans-serif",
      },
      width: container.clientWidth,
      height: container.clientHeight,
      grid: {
        vertLines: { color: '#2b2d3b' },
        horzLines: { color: '#2b2d3b' },
      },
      rightPriceScale: { borderColor: '#2b2d3b' },
      timeScale: {
        borderColor: '#2b2d3b',
        timeVisible: true,
      },
    })
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: UP,
      downColor: DOWN,
      borderVisible: false,
      wickUpColor: UP,
      wickDownColor: DOWN,
    })
    candlestickSeries.setData(
      data.map((item) => ({
        time: item.time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      })),
    )
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#3b82f6',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    })
    volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })
    volumeSeries.setData(
      data.map((item) => ({
        time: item.time,
        value: item.volume,
        color: item.close >= item.open ? 'rgba(93, 255, 103, 0.35)' : 'rgba(255, 53, 53, 0.35)',
      })),
    )
    chart.timeScale().fitContent()

    const observer = new ResizeObserver(() => {
      chart.applyOptions({ width: container.clientWidth, height: container.clientHeight })
      chart.timeScale().fitContent()
    })
    observer.observe(container)
    return () => {
      observer.disconnect()
      chart.remove()
    }
  }, [data])

  return (
    <div className="relative h-full w-full bg-[#21222d]">
      {!data || data.length === 0 ? (
        <p className="p-4 text-[#d2d2d2]">Nessun dato disponibile per il ticker selezionato.</p>
      ) : null}
      <div ref={chartContainerRef} className="absolute inset-0" />
    </div>
  )
}
