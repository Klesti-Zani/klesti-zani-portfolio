import MonteCarloChart from './MonteCarloChart'

export default function BootstrapMontecarlo({ data, ticker }) {
  return (
    <MonteCarloChart
      data={data}
      title={`Bootstrap Monte Carlo, 1 year (${ticker})`}
      description="Future price paths simulated by resampling historical daily returns with replacement."
    />
  )
}
