import MonteCarloChart from './MonteCarloChart'

export default function BlockBootstrapMontecarlo({ data, ticker }) {
  return (
    <MonteCarloChart
      data={data}
      title={`Block Bootstrap Monte Carlo, 1 year (${ticker})`}
      description="Future price paths simulated by resampling blocks of consecutive historical returns."
    />
  )
}
