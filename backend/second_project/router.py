from fastapi import APIRouter, HTTPException
import yfinance as yf
import numpy as np
import pandas as pd
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
@router.get("/api/asset/{ticker}/")
def get_asset_data(ticker: str, period: str = "5y"):
  ticker = ticker.upper()
  df = yf.download(ticker, period=period, progress=False)
  if df.empty:
      raise HTTPException(status_code=404, detail=f"Ticker '{ticker}' non trovato o privo di dati.")
  if isinstance(df.columns, pd.MultiIndex):
      df.columns = df.columns.get_level_values(0)
  df['Log_Return'] = np.log(df['Close'] / df['Close'].shift(1))
  df = df.dropna()
  if df.empty or not np.isfinite(df['Log_Return']).all():
      raise HTTPException(status_code=422, detail=f"Dati insufficienti o non validi per '{ticker}'.")
  mean_return = df['Log_Return'].mean()
  def historicalVar(df, alpha=0.05):
      return df['Log_Return'].quantile(alpha)
  def historicalCVar(df, alpha=0.05):
      var = historicalVar(df, alpha)
      return df[df['Log_Return'] <= var]['Log_Return'].mean()
  var=historicalVar(df)
  cvar=historicalCVar(df)
  initial_investment = 100000
  var_amount = -initial_investment * var
  cvar_amount = -initial_investment * cvar


  return {
      "ticker": ticker,
      "meanReturn": mean_return,
      "var": var,
      "cvar": cvar,
      "initialInvestment": initial_investment,
      "varAmount": var_amount,
      "cvarAmount": cvar_amount,
  }