import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

export default function VolatilityChart({ data, ticker }) {
  if (!data || data.length === 0) return null

  return (
    <div className="flex h-full w-full flex-col p-4">
      <h3 className="text-base font-semibold text-white">Monthly Volatility ({ticker})</h3>
      <div className="mt-2 min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#2b2d3b" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#d2d2d2" tick={{ fontSize: 11 }} minTickGap={40} />
            <YAxis
              stroke="#d2d2d2"
              tick={{ fontSize: 11 }}
              tickFormatter={(val) => `${(val * 100).toFixed(1)}%`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#171821', border: '1px solid #2b2d3b', color: '#fff' }}
              labelFormatter={(label) => `Date: ${label}`}
              formatter={(val) => [`${(val * 100).toFixed(2)}%`, 'Volatility']}
            />
            <Line type="monotone" dataKey="VolatilityData" stroke="#ff6eee" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
