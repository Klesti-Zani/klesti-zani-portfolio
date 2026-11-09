# ZaniApex Portfolio

Portfolio personale con due progetti di analisi finanziaria:

- **QuantEquity**: grafico dei prezzi, metriche di rischio, benchmark e
  simulazioni Monte Carlo.
- **VaR & CVaR Simulator**: calcolo historical di VaR e CVaR. Le sezioni
  parametric e Monte Carlo sono ancora in sviluppo.

Il frontend usa React e Vite; il backend usa FastAPI, pandas, NumPy, SciPy,
arch e yfinance.

## Avvio in locale

Sono state usate le versioni Python 3.14 e Node.js 24. Apri due terminali
nella radice del progetto. Su Windows PowerShell, nel primo:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

Nel secondo:

```powershell
cd frontend
npm ci
npm run dev
```

Apri l'indirizzo mostrato da Vite, normalmente
`http://localhost:5173`. La documentazione API è disponibile su
`http://127.0.0.1:8000/docs`. Per la struttura del backend consulta
il [README del backend](backend/README.md).

## Dati e limitazioni

I dati di mercato provengono da Yahoo Finance tramite yfinance. Il progetto
yfinance è destinato alla ricerca e alla formazione e indica che l'API
Yahoo Finance è per uso personale: consulta i
[termini e le informazioni di yfinance](https://github.com/ranaroussi/yfinance)
prima di usare o mostrare i dati pubblicamente. Disponibilità, precisione
e aggiornamento dei dati non sono garantiti.

Il progetto è una dimostrazione educativa, non una consulenza finanziaria.
Le analisi e le simulazioni non sono previsioni garantite.

Il frontend attualmente chiama `127.0.0.1:8000`: è configurato per l'uso
locale, non per un sito pubblico. Prima di un eventuale deploy occorrono
un backend accessibile via HTTPS, una configurazione dell'URL API e CORS
appropriata, oltre a una fonte di dati che autorizzi l'uso previsto.

## Attribuzioni

TradingView Lightweight Charts™
Copyright (с) 2025 TradingView, Inc. https://www.tradingview.com/

Lightweight Charts è distribuito con licenza Apache 2.0. Per la nota e i
termini completi vedi [NOTICE](https://github.com/tradingview/lightweight-charts/blob/master/NOTICE)
e [LICENSE](https://github.com/tradingview/lightweight-charts/blob/master/LICENSE).
