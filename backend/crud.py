from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal
from datetime import datetime, timezone
from bson.objectid import ObjectId
from pymongo import MongoClient, GEOSPHERE
import os
from dotenv import load_dotenv
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = "civic_connect"
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users_collection = db.users
reports_collection = db.reports

class UserInDB(BaseModel):
    clerk_user_id: str
    email: str
    role: Literal['admin', 'citizen'] = 'citizen'
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {ObjectId: str}

class GeoJSON(BaseModel):
    type: str = "Point"
    coordinates: List[float]

class ReportInDB(BaseModel):
    id: Optional[ObjectId] = Field(None, alias="_id")
    user_id: str
    title: str
    category: str
    urgency: str
    assigned_department: str
    original_text: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    voice_note_url: Optional[str] = None
    location: GeoJSON
    status: str = "Submitted"
    upvotes: int = 0
    admin_notes: list = Field(default_factory=list)
    progress_images: list = Field(default_factory=list)
    resolved_image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {ObjectId: str}
        arbitrary_types_allowed = True

# CRUD functions (add/expand as needed)
def create_user(clerk_user_id: str, email: str, role: str = 'citizen') -> Optional[UserInDB]:
    if users_collection.find_one({"clerk_user_id": clerk_user_id}):
        return None
    user_data = {
        "clerk_user_id": clerk_user_id,
        "email": email,
        "role": role,
        "created_at": datetime.now(timezone.utc)
    }
    result = users_collection.insert_one(user_data)
    created_user = users_collection.find_one({"_id": result.inserted_id})
    return UserInDB.model_validate(created_user) if created_user else None

def get_user_by_clerk_id(clerk_user_id: str) -> Optional[UserInDB]:
    user_data = users_collection.find_one({"clerk_user_id": clerk_user_id})
    return UserInDB.model_validate(user_data) if user_data else None

def create_report(report_data: ReportInDB) -> ReportInDB:
    report_dict = report_data.model_dump(by_alias=True, exclude={"id"})
    result = reports_collection.insert_one(report_dict)
    new_report = reports_collection.find_one({"_id": result.inserted_id})
    return ReportInDB.model_validate(new_report)

def get_reports_by_user_id(user_id: str) -> List[ReportInDB]:
    cursor = reports_collection.find({"user_id": user_id}).sort("created_at", -1)
    return [ReportInDB.model_validate(doc) for doc in cursor]

def get_reports_nearby(longitude: float, latitude: float, max_distance_meters: int = 5000) -> List[ReportInDB]:
    query = {
        "location": {
            "$near": {
                "$geometry": {
                    "type": "Point",
                    "coordinates": [longitude, latitude]
                },
                "$maxDistance": max_distance_meters
            }
        }
    }
    cursor = reports_collection.find(query).sort("created_at", -1)
    return [ReportInDB.model_validate(doc) for doc in cursor]

def get_reports_for_admin(department: Optional[str] = None) -> List[ReportInDB]:
    query = {}
    if department:
        query["department"] = department
    cursor = reports_collection.find(query).sort("created_at", -1)
    return [ReportInDB.model_validate(doc) for doc in cursor]

def update_report_status(report_id: str, new_status: str) -> Optional[ReportInDB]:
    try:
        obj_id = ObjectId(report_id)
    except Exception:
        return None
    update_result = reports_collection.find_one_and_update(
        {"_id": obj_id},
        {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc)}},
        return_document=True
    )
    return ReportInDB.model_validate(update_result) if update_result else None

def ensure_indexes():
    users_collection.create_index("clerk_user_id", unique=True)
    reports_collection.create_index([("location", GEOSPHERE)])
    print("Database indexes ensured.")

if __name__ == '__main__':
    ensure_indexes()
    print("Civic Connect DB Layer script loaded successfully.")
