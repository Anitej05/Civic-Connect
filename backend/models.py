from pydantic import BaseModel, Field, EmailStr
from typing import Literal, List
from datetime import datetime, timezone

class User(BaseModel):
    id: str
    email: EmailStr
    role: Literal['admin', 'user']
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GeoJSONLocation(BaseModel):
    type: Literal['Point'] = "Point"
    coordinates: List[float]

class Report(BaseModel):
    id: str = Field(..., alias="_id")
    user_id: str

    # AI generated fields
    title: str = Field(..., max_length=100)
    category: Literal['Sanitation', 'Pothole', 'Streetlight', 'Water Leakage', 'Other']
    urgency: Literal['Low', 'Medium', 'High']
    assigned_department: Literal['Sanitation', 'Public Works', 'Electrical', 'Water Board', 'General']
    
    # User provided fields
    original_text: str | None = Field(None, max_length=500)
    image_url: str | None = None
    location: GeoJSONLocation

    # System fields
    status: Literal['Submitted', 'In Progress', 'Resolved'] = 'Submitted' # Default status
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))