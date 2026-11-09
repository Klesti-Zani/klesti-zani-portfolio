import {
  ComposedChart,
  Scatter,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

const pct = (val) => `${(val * 100).toFixed(1)}%`

export default function SCLChart({ sclLine, scatterPoints, ticker, market }) {
  if (!sclLine || sclLine.length === 0) return null

  return (
    <div className="flex h-full w-full flex-col p-4">
      <h3 className="text-base font-semibold text-white">
        Security Characteristic Line: {ticker} vs {market}
      </h3>
      <p className="mb-3 text-xs text-[#d2d2d2]/70">
        Daily stock log returns against daily benchmark log returns (positive days only).
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart margin={{ top: 5, right: 10, bottom: 15, left: 0 }}>
            <CartesianGrid stroke="#2b2d3b" strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              type="number"
              stroke="#d2d2d2"
              tick={{ fontSize: 11 }}
              tickFormatter={pct}
              domain={[0, 'dataMax']}
              label={{ value: `${market} return`, position: 'insideBottom', offset: -10, fill: '#d2d2d2', fontSize: 12 }}
            />
            <YAxis
              dataKey="y"
              type="number"
              stroke="#d2d2d2"
              tick={{ fontSize: 11 }}
              tickFormatter={pct}
              domain={[0, 'dataMax']}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#171821', border: '1px solid #2b2d3b', color: '#fff' }}
              formatter={(value, name) => [pct(value), name]}
            />
            <Scatter name={ticker} data={scatterPoints} fill="#5dff67" fillOpacity={0.5} />
            <Line
              type="monotone"
              data={sclLine}
              dataKey="scl"
              stroke="#ff6eee"
              strokeWidth={2}
              dot={false}
              name="SCL"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
