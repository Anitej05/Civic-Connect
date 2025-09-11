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
import os,json,re
from dotenv import load_dotenv
load_dotenv()
import uuid
import shutil
from datetime import datetime
from typing import Optional, Any, Dict
from pydantic import Field
from bson.objectid import ObjectId
from fastapi_clerk_auth import ClerkConfig, ClerkHTTPBearer, HTTPAuthorizationCredentials
import crud
import httpx

## Constants
ALLOWED_CATEGORIES = {"Sanitation", "Pothole", "Streetlight", "Water Leakage", "Other"}
ALLOWED_URGENCIES = {"Low", "Medium", "High"}
ALLOWED_DEPARTMENTS = {"Sanitation", "Public Works", "Electrical", "Water Board", "General"}
ALLOWED_STATUSES = {"Submitted", "In Progress", "Resolved"}
STATIC_UPLOAD_DIR = os.getenv("STATIC_UPLOAD_DIR", "static/uploads")
os.makedirs(STATIC_UPLOAD_DIR, exist_ok=True)
HF_API_TOKEN = os.getenv("HF_API_TOKEN")
LLM_MODEL = os.getenv("LLM_MODEL", "meta-llama/llama-4-scout-17b-16e-instruct")
IMAGE_CAPTION_MODEL = os.getenv("IMAGE_CAPTION_MODEL", "Salesforce/blip-image-captioning-large")
HF_BASE = "https://api-inference.huggingface.co/models"
HTTP_TIMEOUT = 60


users_collection = crud.users_collection
reports_collection = crud.reports_collection

###  helpers
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
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1] or ""
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

async def _hf_text(model: str, prompt: str, max_tokens: int = 512) -> str:
    if not HF_API_TOKEN:
        raise RuntimeError("HF_API_TOKEN not set")
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as c:
        r = await c.post(f"{HF_BASE}/{model}", headers={"Authorization": f"Bearer {HF_API_TOKEN}"}, json={
            "inputs": prompt, "parameters": {"max_new_tokens": max_tokens, "temperature": 0.0}, "options": {"use_cache": False}
        })
    r.raise_for_status()
    res = r.json()
    if isinstance(res, list) and res:
        return res[0].get("generated_text") or res[0].get("text") or str(res)
    if isinstance(res, dict):
        return res.get("generated_text") or res.get("text") or str(res)
    return str(res)

async def _hf_image_caption(model: str, image_bytes: bytes) -> Optional[str]:
    if not HF_API_TOKEN:
        raise RuntimeError("HF_API_TOKEN not set")
    files = {"inputs": ("image.jpg", image_bytes, "image/jpeg")}
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as c:
        r = await c.post(f"{HF_BASE}/{model}", headers={"Authorization": f"Bearer {HF_API_TOKEN}"}, files=files)
    r.raise_for_status()
    res = r.json()
    if isinstance(res, list) and res:
        return res[0].get("generated_text") or res[0].get("caption") or str(res)
    if isinstance(res, dict):
        return res.get("generated_text") or res.get("caption") or str(res)
    return None

def _parse_json(text: str) -> Optional[Dict[str, Any]]:
    try:
        return json.loads(text)
    except Exception:
        m = re.search(r'(\{.*\})', text, flags=re.DOTALL)
        if not m: return None
        cand = m.group(1)
        # try to find balanced JSON
        depth = 0
        for i,ch in enumerate(cand):
            if ch == '{': depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    try: return json.loads(cand[:i+1])
                    except Exception: break
        try:
            return json.loads(cand.replace("'", '"'))
        except Exception:
            return None
async def _reconcile_to_json(user_text: str, image_caption: Optional[str]) -> Dict[str, str]:
    combined = f"User text:\n{user_text or '<none>'}\n\n"
    if image_caption: combined += f"Image caption:\n{image_caption}\n\n"
    combined += (
        "Produce JSON only with keys: title (<=100 chars), category, urgency (Low|Medium|High), "
        "assigned_department, description (<=500 chars). Prefer image for visual facts, text for claims. "
    )
    resp = await _hf_text(LLM_MODEL, combined, max_tokens=512)
    parsed = _parse_json(resp) or {}
    # minimal normalization & defaults
    return {
        "title": (parsed.get("title") or parsed.get("summary") or (user_text or image_caption or "Citizen report"))[:100],
        "category": parsed.get("category") or "Other",
        "urgency": parsed.get("urgency") or "Low",
        "assigned_department": parsed.get("assigned_department") or parsed.get("department") or "General",
        "description": (parsed.get("description") or parsed.get("text") or user_text or image_caption or "")[:500],
    }
def _conservative_stub(text: str) -> Dict[str, str]:
    t = (text or "").lower()
    cat, dep, urg = "Other", "General", "Low"
    if any(k in t for k in ("pothole","hole","sink")):
        cat, dep, urg = "Pothole", "Public Works", "Medium"
    elif any(k in t for k in ("streetlight","lamp","light")):
        cat, dep, urg = "Streetlight", "Electrical", "Medium"
    elif any(k in t for k in ("water","leak","sewer","flood")):
        cat, dep, urg = "Water Leakage", "Water Board", "High"
    elif any(k in t for k in ("garbage","trash","bin","sanitation")):
        cat, dep, urg = "Sanitation", "Sanitation", "Low"
    title = (text or "")[:100] or "Citizen report"
    return {"title": title, "category": cat, "urgency": urg, "assigned_department": dep, "description": (text or "")[:500]}

### end of helpers 
    
router = APIRouter()

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
    user_id = _get_authenticated_user_id(request)
    _validate_geo_coords(longitude, latitude)

    saved_image_url = None
    image_caption = None
    user_text = (text or "").strip()

    if image:
        try:
            saved_image_url = _save_upload(image)
            image_bytes = await image.read()
            try:
                image_caption = await _hf_image_caption(IMAGE_CAPTION_MODEL, image_bytes)
            except Exception:
                image_caption = None
        except Exception:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to save uploaded file")

    if image_url:
        saved_image_url = image_url

    # combine sources: if both present, both are passed to the LLM for reconciliation
    llm_input_text = user_text or image_caption or (f"Image at URL: {saved_image_url}" if saved_image_url else "")
    try:
        ai_out = await _reconcile_to_json(user_text, image_caption)
    except Exception:
        ai_out = _conservative_stub(" ".join(filter(None, [user_text, image_caption])))

    # enforce allowed values
    category = ai_out.get("category") if ai_out.get("category") in ALLOWED_CATEGORIES else "Other"
    urgency = ai_out.get("urgency") if ai_out.get("urgency") in ALLOWED_URGENCIES else "Low"
    assigned_department = ai_out.get("assigned_department") if ai_out.get("assigned_department") in ALLOWED_DEPARTMENTS else "General"
    title = (ai_out.get("title") or "Citizen report")[:100]
    original_text_field = (ai_out.get("description") or user_text or image_caption or "")[:500] or None

    payload: Dict[str, Any] = {
        "user_id": str(user_id),
        "title": title,
        "category": category,
        "urgency": urgency,
        "assigned_department": assigned_department,
        "original_text": original_text_field,
        "image_url": saved_image_url or None,
        "location": {"type": "Point", "coordinates": [longitude, latitude]},
        "status": "Submitted",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    try:
        try:
            report_obj = crud.ReportInDB.model_validate(payload)
            crud.create_report(report_obj)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to validate report data: {str(e)}")
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to persist report")

    return {"status": "success"}

@router.get("/nearby")
async def get_nearby_reports(
    request: Request,
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    max_distance_meters: int = Query(5000),
):
    _get_authenticated_user_id(request)
    _validate_geo_coords(lng, lat)
    try:
        results = crud.get_reports_nearby(longitude=lng, latitude=lat, max_distance_meters=max_distance_meters)
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to query nearby reports")
    return {"status": "success", "data": [r.model_dump() for r in results]}


@router.get("/my-reports")
async def get_my_reports(request: Request):
    user_id = _get_authenticated_user_id(request)
    try:
        reports = crud.get_reports_by_user_id(user_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch user reports")
    return {"status": "success", "data": [r.model_dump() for r in reports]}

# Fix: Added the missing /reports endpoint for the general user feed
@router.get("/reports")
async def get_reports(request: Request):
    """
    Returns a general list of all reports for any authenticated user.
    """
    _get_authenticated_user_id(request)
    try:
        # This is a simplified approach. In a real app, you'd likely want pagination here.
        cursor = reports_collection.find({}).sort("created_at", -1).limit(100)
        results = list(cursor)
        for r in results:
            r["id"] = str(r["_id"])
            r.pop("_id", None)
        return {"status": "success", "data": results}
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch reports")


@router.put("/admin/report/{report_id}/status", status_code=status.HTTP_200_OK)
async def admin_update_report_status(request: Request, report_id: str, payload: Dict = Body(...)):
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
    notes = payload.get("notes")
    if notes:
        update_fields.setdefault("admin_notes", []).append({"note": notes, "by": getattr(request.state, "user_id", None), "at": datetime.utcnow()})
    progress_image_url = payload.get("progress_image_url")
    if progress_image_url:
        reports_collection.update_one({"_id": oid}, {"$push": {"progress_images": progress_image_url}})
    reports_collection.update_one({"_id": oid}, {"$set": update_fields})
    return {"status": "success"}

@router.get("/admin/reports")
async def admin_get_reports(
    request: Request,
    department: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
):
    _ensure_admin(request)
    query = {}
    if department: query["assigned_department"] = department
    if category: query["category"] = category
    if status_filter: query["status"] = status_filter
    cursor = reports_collection.find(query).sort("created_at", -1).skip((page - 1) * page_size).limit(page_size)
    results = list(cursor)
    total = reports_collection.count_documents(query)
    for r in results:
        r["id"] = str(r["_id"])
        r.pop("_id", None)
    return {"status": "success", "data": results, "meta": {"total": total, "page": page, "page_size": page_size}}