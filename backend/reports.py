import os
from fastapi import APIRouter, Request, Header, HTTPException, Depends
from fastapi_clerk_auth import ClerkConfig, ClerkHTTPBearer, HTTPAuthorizationCredentials

CLERK_JWKS_URL = os.environ.get("CLERK_JWKS_URL")
if not CLERK_JWKS_URL:
    raise RuntimeError("CLERK_JWKS_URL environment variable is not set.")
clerk_config = ClerkConfig(jwks_url=CLERK_JWKS_URL)
clerk_auth_guard = ClerkHTTPBearer(clerk_config)

# Dependency to extract and verify the JWT token
async def authenticate(request: Request):
    credentials = await clerk_auth_guard(request)
    if credentials and credentials.decoded:
        user_id = credentials.decoded.get("sub")
        request.state.user_id = user_id
    else:
        raise HTTPException(status_code=401, detail="Unauthorised")

router = APIRouter(
    dependencies = [Depends(authenticate)]
)

### All the logic for report management will go here
@router.post("/smart-create")
async def smart_create_report():
    return {"message": "Report created successfully!"}

@router.get("/nearby")
async def get_nearby_reports():
    pass

@router.get("/my-reports")
async def get_my_reports():
    pass

# For the below two endpoints, ensure to add authentication for admin users only
@router.get("/admin/reports")
async def get_all_reports():
    pass

@router.get("/admin/reports/{report_id}")
async def update_report_status(report_id: str):
    pass