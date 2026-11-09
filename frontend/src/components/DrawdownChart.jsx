import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

export default function DrawdownChart({ data, ticker }) {
  if (!data || data.length === 0) return null

  return (
    <div className="flex h-full w-full flex-col p-4">
      <h3 className="text-base font-semibold text-white">Drawdown ({ticker})</h3>
      <div className="mt-2 min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff3535" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#ff3535" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#2b2d3b" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#d2d2d2" tick={{ fontSize: 11 }} minTickGap={40} />
            <YAxis
              stroke="#d2d2d2"
              tick={{ fontSize: 11 }}
              tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
              domain={['auto', 0]}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#171821', border: '1px solid #2b2d3b', color: '#fff' }}
              labelFormatter={(label) => `Date: ${label}`}
              formatter={(val) => [`${(val * 100).toFixed(2)}%`, 'Drawdown']}
            />
            <Area type="monotone" dataKey="drawdown" stroke="#ff3535" strokeWidth={2} fill="url(#drawdownGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
