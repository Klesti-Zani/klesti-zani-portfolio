import MonteCarloChart from './MonteCarloChart'

export default function GarchMontecarlo({ data, ticker }) {
  return (
    <MonteCarloChart
      data={data}
      title={`GARCH Monte Carlo, 1 year (${ticker})`}
      description="Future price paths simulated with time-varying volatility from a GARCH model."
    />
  )
}
