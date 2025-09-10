from fastapi import FastAPI
from dotenv import load_dotenv
load_dotenv()
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from webhooks import router as webhooks_router
from reports import router as reports_router

app = FastAPI(title="Civic Connect API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(webhooks_router, prefix="/webhooks", tags=["webhooks"])
app.include_router(reports_router, prefix="/reports", tags=["reports"])
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    return {"message": "The backend is running fine!"}