from fastapi import APIRouter, HTTPException
import yfinance as yf
import numpy as np
import pandas as pd  
from scipy import stats 
from arch import arch_model
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlparse
import time

router = APIRouter()

POPULAR_TICKERS = ["AAPL", "NVDA"]
_quote_cache = {}
QUOTE_TTL = 300

def _quote_summary(symbol: str):
    cached = _quote_cache.get(symbol)
    if cached and time.time() - cached[0] < QUOTE_TTL:
        return cached[1]
    try:
        info = yf.Ticker(symbol).info
        website = info.get("website") or ""
        domain = urlparse(website).netloc.removeprefix("www.") if website else ""
        change = info.get("regularMarketChangePercent")
        result = {
            "symbol": symbol,
            "name": info.get("longName") or info.get("shortName") or symbol,
            "changePercent": float(change) if change is not None else None,
            "logo": f"https://www.google.com/s2/favicons?domain={domain}&sz=128" if domain else None,
        }
    except Exception:
        result = {"symbol": symbol, "name": symbol, "changePercent": None, "logo": None}
    _quote_cache[symbol] = (time.time(), result)
    return result

@router.get("/api/search")
def search_stocks(q: str = ""):
    q = q.strip()
    if q:
        try:
            quotes = yf.Search(q, max_results=8, news_count=0).quotes
        except Exception:
            quotes = []
        symbols = [x["symbol"] for x in quotes if x.get("quoteType") == "EQUITY" and x.get("symbol")][:6]
    else:
        symbols = POPULAR_TICKERS
    with ThreadPoolExecutor(max_workers=8) as pool:
        return list(pool.map(_quote_summary, symbols))

sector_benchmarks = {
    "Technology": "XLK",            
    "Financial Services": "XLF",    
    "Healthcare": "XLV",            
    "Consumer Cyclical": "XLY", 
    "Consumer Defensive": "XLP",
    "Energy": "XLE",            
    "Industrials": "XLI",       
    "Utilities": "XLU",         
    "Real Estate": "XLRE",      
    "Basic Materials": "XLB",   
    "Communication Services": "XLC"
}

@router.get("/api/asset/{ticker}/benchmark")
def get_asset_data(ticker: str, period: str = "5y"):
    ticker = ticker.upper()
    df = yf.download(ticker, period=period, progress=False)
    if df.empty:
        raise HTTPException(status_code=404, detail=f"Ticker '{ticker}' non trovato o privo di dati.")
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
    df['Log_Return'] = np.log(df['Close'] / df['Close'].shift(1))
    df = df.dropna()
    df['MA50'] = df['Close'].rolling(window=50, min_periods=1).mean()
    df['MA200'] = df['Close'].rolling(window=200, min_periods=1).mean()

    price_series = []
    for date, row in df.iterrows():  # cicla su ogni riga del dataframe
        price_series.append({
            "time": date.strftime("%Y-%m-%d"),
            "open": float(row['Open']),
            "high": float(row['High']),
            "low": float(row['Low']),
            "close": float(row['Close']),
            "volume": float(row['Volume']),
            "logReturn": float(row['Log_Return']),
            "MA50": float(row['MA50']),
            "MA200": float(row['MA200'])
        })
    mean_log_return = float(df['Log_Return'].mean())
    daily_return = float(df['Log_Return'].mean())
    annualized_return = float(daily_return * 252)
    base_price = df['Close'].iloc[-252] if len(df) >= 252 else df['Close'].iloc[0]
    last_year_return = float((df['Close'].iloc[-1] - base_price) / base_price)
    standard_deviation = float(df['Log_Return'].std())
    annualized_volatility = float(standard_deviation * np.sqrt(252))
    sw_stat, sw_pvalue = stats.shapiro(df['Log_Return'])
    counts, bin_edges = np.histogram(df['Log_Return'], bins=50, density=True)
    ks_stat, ks_pvalue = stats.kstest(df['Log_Return'], 'norm')
    graph_volatility_series = (df['Log_Return'].rolling(window=30).std() * np.sqrt(252)).dropna()
    graph_volatility = [
        {"date": str(date.date()), "VolatilityData": float(val)} #cosa ottengo
        for date, val in graph_volatility_series.items() #da dove prendo i dati
    ]

    distribution_data = []
    for i in range(len(counts)): #è un ciclo che itera su ogni colonna dell'istogramma dei log return
        bin_center = float((bin_edges[i] + bin_edges[i+1]) / 2)
        empirical_density = float(counts[i]) #valore della densità empirica in questa colonna
        theoretical_density = float(stats.norm.pdf(bin_center, loc=mean_log_return, scale=standard_deviation)) #valore teorico della gausssiana perfetta
        distribution_data.append({
            "binCenter": bin_center,
            "empiricalDensity": empirical_density,
            "theoreticalDensity": theoretical_density
        })

    risk_free_rate = 0.03
    sharpe_ratio = ((annualized_return - risk_free_rate) / annualized_volatility)
    log_returns = df['Log_Return'].values
    downside_volatility = np.minimum(log_returns,0).std() * np.sqrt(252) 
    sortino_ratio = ((annualized_return - risk_free_rate) / downside_volatility)

    stock = yf.Ticker(ticker)
    sector = None
    try:
        info = stock.info
        sector = info.get("sector")
    except Exception:
        sector = None

    benchmark = sector_benchmarks.get(sector, "SPY")
    if ticker == benchmark:
        benchmark = "SPY"
    df_market = yf.download(benchmark, period=period, progress=False)
    if df_market.empty:
        raise HTTPException(status_code=404, detail=f"Benchmark '{benchmark}' non trovato o privo di dati.")
    if isinstance(df_market.columns, pd.MultiIndex):
        df_market.columns = df_market.columns.get_level_values(0)
    df_market['Market_Log_Return'] = np.log(df_market['Close'] / df_market['Close'].shift(1)).dropna()
    aligned_returns = pd.DataFrame({
        'Stock': df['Log_Return'],
        'Market': df_market['Market_Log_Return']
    }).dropna()
    market_log_returns = aligned_returns['Market']
    market_volatility = market_log_returns.std() * np.sqrt(252)
    market_return = market_log_returns.mean() * 252
    m2_ratio = (sharpe_ratio * market_volatility) + risk_free_rate
    m2_extra_return = m2_ratio - market_return
    peak = df['Close'].cummax()
    drawdown = (df['Close'] - peak) / peak
    max_drawdown = drawdown.min()
    drawdown_data = []
    for date, val in drawdown.items():
        drawdown_data.append({
            
            "date": date.strftime('%Y-%m-%d'),
            "drawdown": float(val)
        })
    calmar_ratio = annualized_return / abs(max_drawdown)
    covariance = aligned_returns['Stock'].cov(market_log_returns)
    market_variance = market_log_returns.var()
    beta = covariance/market_variance
    alpha = aligned_returns['Stock'].mean() - (beta * market_log_returns.mean())
    positive_returns_scl = aligned_returns[
    (aligned_returns["Market"] > 0) &
    (aligned_returns["Stock"] > 0)
    ]
    scatter_points = [
    {"x": float(m), "y": float(s)}
    for s, m in zip(positive_returns_scl["Stock"], positive_returns_scl["Market"])
    ]
    max_market = float(positive_returns_scl['Market'].max())
    x_range_scl = np.linspace(0, max_market, 100)
    scl_line = [
        {"x": float(x), "scl": float(alpha + (beta * x))}
        for x in x_range_scl
    ]
    # Molto interessante: "Poiché i test statistici evidenziano
    # che l'ipotesi di normalità dei rendimenti può essere inadeguata,
    # la simulazione Monte Carlo utilizza un bootstrap della distribuzione empirica dei log-return,
    # evitando di imporre un'ipotesi parametrica di normalità."

    n_days = 252
    n_simulations = 1000
    starting_price = df['Close'].iloc[-1]

    mu = log_returns.mean()
    sigma = log_returns.std()
    daily_shocks = np.random.normal(0, 1, (n_days, n_simulations))
    drift = mu + (sigma * daily_shocks)
    simulated_log_returns = drift + (sigma * daily_shocks)
    price_paths = np.zeros((n_days + 1, n_simulations))
    price_paths[0] = starting_price
    price_paths[1:] = starting_price * np.exp(
        np.cumsum(simulated_log_returns, axis=0)
    ) #[1:] i due punti dopo l'uno serve per prendere tutti i valori a partire da 1, escludendo 0-
    percentile_10 = np.percentile(price_paths, 10, axis=1) 
    percentile_50 = np.percentile(price_paths, 50, axis=1)
    percentile_90 = np.percentile(price_paths, 90, axis=1)
    sample_indices = np.random.choice(n_simulations, size=100, replace=False)
    sample_paths = price_paths[:, sample_indices]
    classic_montecarlo_data = []

    for day in range(n_days + 1):

        point = {
            "day": day,
            "p10": float(percentile_10[day]),
            "p50": float(percentile_50[day]),
            "p90": float(percentile_90[day])
        }

        for i in range(len(sample_indices)):
            point[f"sim_{i}"] = float(sample_paths[day, i])

        classic_montecarlo_data.append(point)

    simulated_log_returns = np.random.choice(
    log_returns, size=(n_days, n_simulations), replace=True
    )
    price_paths = np.zeros((n_days + 1, n_simulations))
    price_paths[0] = starting_price
    price_paths[1:] = starting_price * np.exp(np.cumsum(simulated_log_returns, axis=0))
    bootstrap_percentile_10 = np.percentile(price_paths, 10, axis=1)
    bootstrap_percentile_50 = np.percentile(price_paths, 50, axis=1)
    bootstrap_percentile_90 = np.percentile(price_paths, 90, axis=1)
    sample_indices = np.random.choice(n_simulations, size=100, replace=False)
    sample_paths = price_paths[:, sample_indices]
    bootstrap_montecarlo_data = []
    for day in range(n_days + 1):
    
            point = {
                "day": day,
                "p10": float(bootstrap_percentile_10[day]),
                "p50": float(bootstrap_percentile_50[day]),
                "p90": float(bootstrap_percentile_90[day])
            }
    
            for i in range(len(sample_indices)):
                point[f"sim_{i}"] = float(sample_paths[day, i])
    
            bootstrap_montecarlo_data.append(point)

    def block_bootstrap(log_returns, n_days, n_simulations, block_size):
        simulated_log_returns = np.zeros(
        (n_days, n_simulations)
        )
        for simulation in range(n_simulations):
            simulation_returns = []
            while len(simulation_returns) < n_days:
                max_start = len(log_returns) - block_size
                start = np.random.randint(0, max_start + 1)
                block = log_returns[
                    start : start + block_size
                ]
                simulation_returns.extend(block)

            simulation_returns = simulation_returns[:n_days]
            simulated_log_returns[:, simulation] = simulation_returns

        return simulated_log_returns

    block_size = 5
    simulated_log_returns = block_bootstrap(
        log_returns,
        n_days,
        n_simulations,
        block_size
    )
    price_paths = np.zeros((n_days + 1, n_simulations))
    price_paths[0] = starting_price
    price_paths[1:] = starting_price * np.exp(np.cumsum(simulated_log_returns, axis=0))
    block_bootstrap_percentile_10 = np.percentile(price_paths, 10, axis=1)
    block_bootstrap_percentile_50 = np.percentile(price_paths, 50, axis=1)
    block_bootstrap_percentile_90 = np.percentile(price_paths, 90, axis=1)
    sample_indices = np.random.choice(n_simulations, size=100, replace=False)
    sample_paths = price_paths[:, sample_indices]
    block_bootstrap_montecarlo_data = []
    for day in range(n_days + 1):
    
            point = {
                "day": day,
                "p10": float(block_bootstrap_percentile_10[day]),
                "p50": float(block_bootstrap_percentile_50[day]),
                "p90": float(block_bootstrap_percentile_90[day])
            }
    
            for i in range(len(sample_indices)):
                point[f"sim_{i}"] = float(sample_paths[day, i])
    
            block_bootstrap_montecarlo_data.append(point)

    return_garch = log_returns * 100
    model = arch_model(
    return_garch,
    mean="Constant",
    vol="GARCH",
    p=1,
    q=1,
    dist="normal"
    )
    result = model.fit(disp="off")
    garch_omega = result.params["omega"]
    garch_alpha = result.params["alpha[1]"]
    garch_beta = result.params["beta[1]"]
    garch_mu = result.params["mu"]
    initial_variance = float(np.asarray(result.conditional_volatility)[-1]) ** 2
    initial_shock = float(np.asarray(result.resid)[-1])
    #initial_variance = result.conditional_volatility.iloc[-1] ** 2
    #initial_shock = float(result.resid.iloc[-1]) non funziona così
    #purtroppo, ma lo tengo per leggibilità
    simulated_log_returns = np.zeros((n_days, n_simulations))
    for simulation in range(n_simulations):
        previous_variance = initial_variance
        previous_shock = initial_shock
        for day in range(n_days):
            current_variance = (
                garch_omega + garch_alpha * previous_shock ** 2 + garch_beta * previous_variance
            )
            shock = np.random.normal(0, 1)
            current_return_pct = (
                garch_mu + np.sqrt(current_variance) * shock
            )
            current_return = current_return_pct / 100
            simulated_log_returns[day, simulation] = current_return
            previous_shock = current_return_pct - garch_mu
            previous_variance = current_variance
    
    price_paths = np.zeros((n_days + 1, n_simulations))
    price_paths[0] = starting_price
    price_paths[1:] = starting_price * np.exp(np.cumsum(simulated_log_returns, axis=0))
    garch_percentile_10 = np.percentile(price_paths, 10, axis=1)
    garch_percentile_50 = np.percentile(price_paths, 50, axis=1)
    garch_percentile_90 = np.percentile(price_paths, 90, axis=1)
    sample_indices = np.random.choice(n_simulations, size=100, replace=False)
    sample_paths = price_paths[:, sample_indices]
    garch_montecarlo_data = []
    for day in range(n_days + 1):
    
            point = {
                "day": day,
                "p10": float(garch_percentile_10[day]),
                "p50": float(garch_percentile_50[day]),
                "p90": float(garch_percentile_90[day])
            }
    
            for i in range(len(sample_indices)):
                point[f"sim_{i}"] = float(sample_paths[day, i])
    
            garch_montecarlo_data.append(point)

    return {
        "ticker": ticker,
        "summary": {
            "annualizedReturn": annualized_return*100,
            "annualizedVolatility": annualized_volatility*100,
            "shapiroPValue": float(sw_pvalue),
            "isShapiroNormal": bool(sw_pvalue > 0.05),
            "ksPValue": float(ks_pvalue),
            "isKsNormal": bool(ks_pvalue > 0.05),
            "lastYearReturn": last_year_return*100,
            "distributionData": distribution_data,
            "volatilityData": graph_volatility,
            "sharpeRatio": float(sharpe_ratio),
            "sortinoRatio": float(sortino_ratio),
            "m2ExtraReturn": float(m2_extra_return),
            "drawdownData": drawdown_data,
            "maxDrawdown": float(max_drawdown)*100,
            "calmarRatio": float(calmar_ratio),
            "alpha": float(alpha),
            "beta": float(beta),
            "scatterPoints": scatter_points,
            "sclLine": scl_line,
            "startingPrice": round(starting_price, 2),
            "nDays": n_days,
            "nSimulations": n_simulations,
            "chartData": classic_montecarlo_data,
            "market": benchmark,
            "bootstrapChartData": bootstrap_montecarlo_data,
            "blockBootstrapChartData": block_bootstrap_montecarlo_data,
            "garchChartData": garch_montecarlo_data,
        },
        "timeSeries": price_series
    }