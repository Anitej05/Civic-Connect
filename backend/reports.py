from fastapi import (
    APIRouter,
    Request,
    HTTPException,
    status,
    UploadFile,
    File,
    Form,
    Query,
    Body,
    Depends,
)
import os
import uuid
import shutil
from datetime import datetime
from typing import Optional, Any, Dict
from pydantic import Field
from bson.objectid import ObjectId
from fastapi_clerk_auth import ClerkConfig, ClerkHTTPBearer, HTTPAuthorizationCredentials
from ..database import crud


## Constants
ALLOWED_CATEGORIES = {"Sanitation", "Pothole", "Streetlight", "Water Leakage", "Other"}
ALLOWED_URGENCIES = {"Low", "Medium", "High"}
ALLOWED_DEPARTMENTS = {"Sanitation", "Public Works", "Electrical", "Water Board", "General"}
ALLOWED_STATUSES = {"Submitted", "In Progress", "Resolved"}
STATIC_UPLOAD_DIR = os.getenv("STATIC_UPLOAD_DIR", "static/uploads")
os.makedirs(STATIC_UPLOAD_DIR, exist_ok=True)

users_collection = crud.users_collection
reports_collection = crud.reports_collection

## helpers
def _get_authenticated_user_id(request: Request) -> str:
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthenticated")
    return user_id


def _is_admin_by_user_id(user_id: str) -> bool:
    user_doc = users_collection.find_one({"clerk_user_id": user_id})
    if not user_doc:
        return False
    return user_doc.get("role") == "admin"


def _ensure_admin(request: Request) -> None:
    uid = _get_authenticated_user_id(request)
    if not _is_admin_by_user_id(uid):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")


def _save_upload(file: UploadFile) -> str:
    ext = os.path.splitext(file.filename)[1] or ""
    fname = f"{int(datetime.utcnow().timestamp())}-{uuid.uuid4().hex}{ext}"
    dst_path = os.path.join(STATIC_UPLOAD_DIR, fname)
    with open(dst_path, "wb") as out_f:
        shutil.copyfileobj(file.file, out_f)
    # returned path is the mounted static route path (main.py mounts /static -> static)
    return f"/static/uploads/{fname}"


def _validate_geo_coords(lon: float, lat: float) -> None:
    if not (-180.0 <= lon <= 180.0 and -90.0 <= lat <= 90.0):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid latitude or longitude")


def _to_object_id(oid_str: str) -> Optional[ObjectId]:
    try:
        return ObjectId(oid_str)
    except Exception:
        return None
    
    
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
@router.post("/smart-create", status_code=status.HTTP_201_CREATED)
async def smart_create_report(
    request: Request,
    text: Optional[str] = Form(None),
    latitude: float = Form(...),
    longitude: float = Form(...),
    image: Optional[UploadFile] = File(None),
    image_url: Optional[str] = Form(None),
):
    """
    Stores a new report in database. Does NOT return the created document (only acknowledgement).
    AI classification uses a local conservative stub — replace with your AI integration as needed.
    """
    user_id = _get_authenticated_user_id(request)

    _validate_geo_coords(longitude, latitude)

    saved_image_url = None
    if image:
        try:
            saved_image_url = _save_upload(image)
        except Exception:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to save uploaded file")

    if image_url:
        saved_image_url = image_url

    # AI classifier stub - VERY simple conservative mapping
    def ai_stub(text_in: Optional[str]) -> Dict[str, str]:
        t = (text_in or "").lower()
        category = "Other"
        urgency = "Low"
        assigned_department = "General"
        if any(k in t for k in ("pothole", "hole", "sink")):
            category = "Pothole"; assigned_department = "Public Works"; urgency = "Medium"
        elif any(k in t for k in ("streetlight", "lamp", "light")):
            category = "Streetlight"; assigned_department = "Electrical"; urgency = "Medium"
        elif any(k in t for k in ("water", "leak", "sewer", "flood")):
            category = "Water Leakage"; assigned_department = "Water Board"; urgency = "High"
        elif any(k in t for k in ("garbage", "trash", "bin", "sanitation")):
            category = "Sanitation"; assigned_department = "Sanitation"; urgency = "Low"
        title = (text_in or "").strip()[:100] or "Citizen report"
        return {"title": title, "category": category, "urgency": urgency, "assigned_department": assigned_department}

    ai_out = ai_stub(text)

    # sanitize & enforce allowed values
    category = ai_out.get("category") if ai_out.get("category") in ALLOWED_CATEGORIES else "Other"
    urgency = ai_out.get("urgency") if ai_out.get("urgency") in ALLOWED_URGENCIES else "Low"
    assigned_department = (
        ai_out.get("assigned_department") if ai_out.get("assigned_department") in ALLOWED_DEPARTMENTS else "General"
    )
    title = (ai_out.get("title") or "Citizen report")[:100]
    original_text = (text or "")[:500]

    # build report dict for DB insertion consistent with crud.ReportInDB
    report_payload: Dict[str, Any] = {
        "user_id": user_id,
        "title": title,
        "description": original_text or title,
        "department": assigned_department,
        "status": "submitted",  # crud.ReportInDB default is 'submitted'
        "location": {"type": "Point", "coordinates": [longitude, latitude]},
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        # AI fields & media
        "category": category,
        "urgency": urgency,
        "assigned_department": assigned_department,
        "original_text": original_text,
        "image_url": saved_image_url,
        "upvotes": 0,
        "upvoted_by": [],
    }

    # create using crud wrapper; we do not return the created object
    try:
        # validate and create ReportInDB -> create_report expects ReportInDB
        report_obj = crud.ReportInDB.model_validate(report_payload)
        crud.create_report(report_obj)
    except Exception as e:
        # keep error minimal
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to persist report")

    return {"status": "success"}

@router.get("/nearby")
async def get_nearby_reports(
    request: Request,
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    max_distance_meters: int = Query(5000),
):
    """
    Query endpoint - returns nearby reports (GET should return data).
    """
    _get_authenticated_user_id(request)
    _validate_geo_coords(lng, lat)

    try:
        results = crud.get_reports_nearby(longitude=lng, latitude=lat, max_distance_meters=max_distance_meters)
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to query nearby reports")

    # return serialized list (GETs still return data)
    return {"status": "success", "data": [r.model_dump() for r in results]}


@router.get("/my-reports")
async def get_my_reports(request: Request):
    """
    Return reports of authenticated user.
    """
    user_id = _get_authenticated_user_id(request)
    try:
        reports = crud.get_reports_by_user_id(user_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch user reports")
    return {"status": "success", "data": [r.model_dump() for r in reports]}


@router.post("/report/{report_id}/upvote", status_code=status.HTTP_200_OK)
async def upvote_report(request: Request, report_id: str):
    """
    Increment upvote; prevent duplicates. Only acknowledgement returned.
    """
    user_id = _get_authenticated_user_id(request)
    oid = _to_object_id(report_id)
    if not oid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid report id")

    doc = reports_collection.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    # prevent duplicate upvote
    if user_id in doc.get("upvoted_by", []):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already upvoted")

    reports_collection.update_one(
        {"_id": oid}, {"$addToSet": {"upvoted_by": user_id}, "$inc": {"upvotes": 1}, "$set": {"updated_at": datetime.utcnow()}}
    )
    return {"status": "success"}



@router.put("/admin/report/{report_id}/status", status_code=status.HTTP_200_OK)
async def admin_update_report_status(request: Request, report_id: str, payload: Dict = Body(...)):
    """
    Admin-only: update status (+ optional notes, images). Persist only; return minimal ack.
    Expect JSON body e.g. {"status":"In Progress","notes":"...","progress_image_url":"..."}
    """
    _ensure_admin(request)

    new_status = payload.get("status")
    if not new_status or new_status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid status; allowed: {sorted(ALLOWED_STATUSES)}")

    oid = _to_object_id(report_id)
    if not oid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid report id")

    doc = reports_collection.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    update_fields = {"status": new_status, "updated_at": datetime.utcnow()}

    # optional fields to append
    notes = payload.get("notes")
    if notes:
        update_fields.setdefault("admin_notes", []).append({"note": notes, "by": getattr(request.state, "user_id", None), "at": datetime.utcnow()})

    progress_image_url = payload.get("progress_image_url")
    if progress_image_url:
        # append to progress_images array
        reports_collection.update_one({"_id": oid}, {"$push": {"progress_images": progress_image_url}})

    # perform status update
    reports_collection.update_one({"_id": oid}, {"$set": update_fields})

    return {"status": "success"}


# For the below two endpoints, ensure to add authentication for admin users only
@router.get("/admin/reports")
async def admin_get_reports(
    request: Request,
    department: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
):
    """
    Admin list with filters — returns data (GET).
    """
    _ensure_admin(request)

    # build mongo filter
    query = {}
    if department:
        query["assigned_department"] = department
    if category:
        query["category"] = category
    if status_filter:
        query["status"] = status_filter

    cursor = reports_collection.find(query).sort("created_at", -1).skip((page - 1) * page_size).limit(page_size)
    results = list(cursor)
    total = reports_collection.count_documents(query)
    # convert ObjectId to str for responses
    for r in results:
        r["id"] = str(r["_id"])
        r.pop("_id", None)

    return {"status": "success", "data": results, "meta": {"total": total, "page": page, "page_size": page_size}}
