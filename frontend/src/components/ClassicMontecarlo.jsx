import MonteCarloChart from './MonteCarloChart'

export default function ClassicMontecarlo({ data, ticker }) {
  return (
    <MonteCarloChart
      data={data}
      title={`Classic Monte Carlo, 1 year (${ticker})`}
      description="Future price paths simulated with constant drift and volatility from normally distributed shocks."
    />
  )
}
