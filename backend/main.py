from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from quantequity.QuantEquityRouter import router as quantequity_router
from second_project.router import router as second_project_router

app = FastAPI(title="Quant Finance API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"status": "API Quant Finance Attiva"}


app.include_router(quantequity_router)
app.include_router(second_project_router, prefix="/api/second-project", tags=["Second project"])
