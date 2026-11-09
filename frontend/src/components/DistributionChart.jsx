import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

export default function DistributionChart({ data, ticker }) {
  if (!data || data.length === 0) return null

  return (
    <div className="flex h-full w-full flex-col p-4">
      <h3 className="text-base font-semibold text-white">Returns Distribution vs Normal ({ticker})</h3>
      <p className="mb-3 text-xs text-[#d2d2d2]/70">Empirical log-return density against the theoretical Gaussian curve.</p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#2b2d3b" strokeDasharray="3 3" />
            <XAxis
              dataKey="binCenter"
              stroke="#d2d2d2"
              tick={{ fontSize: 11 }}
              tickFormatter={(val) => `${(val * 100).toFixed(1)}%`}
            />
            <YAxis stroke="#d2d2d2" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#171821', border: '1px solid #2b2d3b', color: '#fff' }}
              formatter={(value, name) => [
                Number(value).toFixed(2),
                name === 'empiricalDensity' ? 'Actual returns' : 'Theoretical normal',
              ]}
              labelFormatter={(label) => `Log return: ${(label * 100).toFixed(2)}%`}
            />
            <Bar dataKey="empiricalDensity" fill="#5dff67" opacity={0.6} name="empiricalDensity" />
            <Line
              type="monotone"
              dataKey="theoreticalDensity"
              stroke="#ff6eee"
              strokeWidth={2}
              dot={false}
              name="theoreticalDensity"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
