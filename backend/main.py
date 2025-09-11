import os
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

# It's important to load environment variables before other modules are imported
load_dotenv()

from .database import connection
from .routers import auth, reports, admin, users
from .routers import smart_create

# Create all database tables on startup
# In a production environment, you would likely use Alembic for migrations
connection.Base.metadata.create_all(bind=connection.engine)

app = FastAPI(
    title="Civic Connect API",
    description="The backend API for the Civic Connect application.",
    version="1.0.0"
)

# --- Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # WARNING: In production, restrict this to your frontend's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Static Files ---
# Ensure the directory for image uploads exists
os.makedirs("backend/static/images", exist_ok=True)
app.mount("/static", StaticFiles(directory="backend/static"), name="static")


# --- API Routers ---
# All routes are prefixed with /api to match the contract and simplify frontend proxying
api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router)
api_router.include_router(reports.router)
api_router.include_router(admin.router)
api_router.include_router(users.router)
api_router.include_router(smart_create.router)


app.include_router(api_router)

# --- Root Endpoint ---
@app.get("/")
async def root():
    return {"message": "Welcome to the Civic Connect API. Visit /docs for documentation."}
