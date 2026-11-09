# Backend del portfolio

Il backend usa un unico server FastAPI e un ambiente virtuale condiviso.

- `main.py` crea l'applicazione, configura CORS e registra i router.
- `quantequity/QuantEquityRouter.py` contiene le API esistenti di QuantEquity.
- `second_project/router.py` è lo spazio per le API del secondo progetto.

Da PowerShell, nella cartella `backend`:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

Le API esistenti rimangono disponibili agli stessi indirizzi:
`/api/search` e `/api/asset/{ticker}/benchmark`. La documentazione
interattiva è su `http://127.0.0.1:8000/docs`.

## Iniziare il secondo progetto

Aggiungi le tue rotte in `second_project/router.py`, usando `router`.
Per esempio, una rotta definita con `@router.get("/example")` sarà
raggiungibile su `/api/second-project/example`. Il prefisso è registrato
in `main.py`: non ripeterlo nei decoratori del router.

La rotta `/api/second-project/api/asset/{ticker}/` calcola VaR e CVaR
historical sui rendimenti logaritmici giornalieri, con confidenza del 95%
e investimento iniziale di 100.000. Puoi aggiungere altri moduli Python
nella cartella `second_project` per separare calcoli e logica dalle rotte.
Entrambi i progetti
condividono le dipendenze installate in `venv` e il server: avvialo una
sola volta per usare entrambi.
