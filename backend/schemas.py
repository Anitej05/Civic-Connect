from pydantic import BaseModel, Field, EmailStr
from typing import Literal, List
from datetime import datetime

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: int
    role: str
    created_at: datetime
    hashed_password: str

    class Config:
        from_attributes = True

class User(UserBase):
    id: int
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Report Schemas ---

# As per the API contract, location is a GeoJSON-like object in responses.
class GeoJSONLocation(BaseModel):
    type: Literal['Point'] = "Point"
    coordinates: List[float]  # [longitude, latitude]

class ReportBase(BaseModel):
    title: str = Field(..., max_length=100)
    category: Literal['Sanitation', 'Pothole', 'Streetlight', 'Water Leakage', 'Other']
    urgency: Literal['Low', 'Medium', 'High']
    assigned_department: Literal['Sanitation', 'Public Works', 'Electrical', 'Water Board', 'General']
    original_text: str | None = Field(None, max_length=500)
    image_url: str | None = None

# Schema for creating a report from the AI service's output
class ReportCreate(ReportBase):
    latitude: float
    longitude: float

# Schema for updating a report's status
class ReportStatusUpdate(BaseModel):
    status: Literal['Submitted', 'In Progress', 'Resolved']

# The full report model for API responses, matching the data contract
class Report(ReportBase):
    id: int
    user_id: int
    location: GeoJSONLocation
    status: Literal['Submitted', 'In Progress', 'Resolved']
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
