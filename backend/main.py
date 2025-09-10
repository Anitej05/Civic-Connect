import os
from fastapi import FastAPI, Depends, HTTPException, Security, APIRouter
from fastapi.security import APIKeyHeader
from dotenv import load_dotenv
from jose import jwt, JWTError
import requests

from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from webhooks import router as webhooks_router
from reports import router as reports_router

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Civic Connect API")

# --- CORS Middleware (from your original file) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Admin and Clerk Configuration ---
ADMIN_IDS_STR = os.getenv("ADMIN_USER_IDS")
ADMIN_USER_IDS = ADMIN_IDS_STR.split(',') if ADMIN_IDS_STR else []
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL")

if not CLERK_JWKS_URL:
    raise Exception("FATAL ERROR: CLERK_JWKS_URL environment variable is not set.")

# --- Authentication and Authorization Dependencies ---

def get_jwks():
    """Fetches the JSON Web Key Set from Clerk for token validation."""
    if not isinstance(CLERK_JWKS_URL, str) or not CLERK_JWKS_URL:
        raise Exception("FATAL ERROR: CLERK_JWKS_URL environment variable is not set or is not a string.")
    try:
        response = requests.get(CLERK_JWKS_URL)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Could not fetch JWKS from Clerk: {e}")

jwks = get_jwks()
api_key_header = APIKeyHeader(name="Authorization", auto_error=False)

async def get_current_user_id(token: str = Security(api_key_header)):
    """Validates the JWT from the Authorization header and returns the user ID."""
    if token is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = token.replace("Bearer ", "")
    try:
        header = jwt.get_unverified_header(token)
        rsa_key = {}
        for key in jwks.get("keys", []):
            if key.get("kid") == header.get("kid"):
                rsa_key = {
                    "kty": key.get("kty"),
                    "kid": key.get("kid"),
                    "use": key.get("use"),
                    "n": key.get("n"),
                    "e": key.get("e")
                }
        
        if rsa_key:
            payload = jwt.decode(token, rsa_key, algorithms=["RS256"])
            return payload.get("sub")
        
        raise HTTPException(status_code=401, detail="Invalid token: Unable to find matching key")

    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Token validation error: {e}")

# --- NEW: User Role Router ---
user_router = APIRouter()

@user_router.get("/role", summary="Get current user's role")
async def get_user_role(user_id: str = Depends(get_current_user_id)):
    """Checks if the current user is an admin and returns their role."""
    if user_id in ADMIN_USER_IDS:
        return {"role": "admin"}
    return {"role": "user"}

app.include_router(user_router, prefix="/users", tags=["users"])


# --- API Routers (from your original file) ---
app.include_router(webhooks_router, prefix="/webhooks", tags=["webhooks"])
app.include_router(reports_router, prefix="/reports", tags=["reports"])
app.mount("/static", StaticFiles(directory="static"), name="static")


# --- Root Endpoint (from your original file) ---
@app.get("/")
async def root():
    return {"message": "The backend is running fine!"}