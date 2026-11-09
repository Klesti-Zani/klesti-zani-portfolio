import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

const PERCENTILE_COLORS = { p10: '#ff3535', p50: '#ffa500', p90: '#5dff67' }

export default function MonteCarloChart({ data, title, description }) {
  if (!data || data.length === 0) {
    return <div className="flex h-full items-center justify-center text-[#d2d2d2]">No Monte Carlo data available.</div>
  }

  const simKeys = Object.keys(data[0]).filter((k) => k.startsWith('sim_'))

  return (
    <div className="flex h-full w-full flex-col p-4">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mb-3 text-xs text-[#d2d2d2]/70">{description}</p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 15, left: 0 }}>
            <CartesianGrid stroke="#2b2d3b" strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              stroke="#d2d2d2"
              tick={{ fontSize: 11 }}
              interval={20}
              label={{ value: 'Days', position: 'insideBottom', offset: -10, fill: '#d2d2d2', fontSize: 12 }}
            />
            <YAxis stroke="#d2d2d2" tick={{ fontSize: 11 }} domain={['auto', 'auto']} tickFormatter={(v) => v.toFixed(0)} />
            <Tooltip
              contentStyle={{ backgroundColor: '#171821', border: '1px solid #2b2d3b', color: '#fff' }}
              labelFormatter={(label) => `Day ${label}`}
              formatter={(value, name) => [Number(value).toFixed(2), name.toUpperCase()]}
              itemSorter={() => 0}
            />
            {simKeys.map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke="#8f8cf0"
                strokeWidth={1}
                strokeOpacity={0.18}
                dot={false}
                tooltipType="none"
                isAnimationActive={false}
              />
            ))}
            {Object.entries(PERCENTILE_COLORS).map(([key, color]) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
