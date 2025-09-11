import os
import json
from typing import Annotated, List

from fastapi import APIRouter, Depends, Form, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from groq import Groq
from pydantic import BaseModel, Field, ValidationError, conlist

from .. import auth, crud, schemas
from ..database.connection import get_db
from ..utils import save_upload_file, encode_image_to_base64
from .admin import map_report_to_schema # Reusing the mapper from the admin router

# --- AI Configuration ---
try:
    client = Groq(api_key=os.environ["GROQ_API_KEY"])
except KeyError:
    client = None # Handle case where API key is not set

# Pydantic model for validating the AI's JSON output. We get the Literals from the main schema.
class AIResponse(BaseModel):
    title: str = Field(..., max_length=100, description="A short, descriptive title for the issue.")
    category: schemas.ReportBase.__annotations__['category']
    urgency: schemas.ReportBase.__annotations__['urgency']
    assigned_department: schemas.ReportBase.__annotations__['assigned_department']

# Dynamically create the list of allowed values for the prompt
CATEGORY_OPTIONS = list(schemas.ReportBase.__annotations__['category'].__args__)
URGENCY_OPTIONS = list(schemas.ReportBase.__annotations__['urgency'].__args__)
DEPARTMENT_OPTIONS = list(schemas.ReportBase.__annotations__['assigned_department'].__args__)

SYSTEM_PROMPT = f"""
You are an expert civic issue classification system. Your task is to analyze the user's text and image to identify a civic problem.
Your response MUST be a single, valid JSON object and nothing else. Do not include any explanatory text, comments, or markdown formatting.

The JSON object must have the following structure:
{{
  "title": "A short, descriptive title for the issue, under 100 characters.",
  "category": "Choose the most appropriate category from this list: {CATEGORY_OPTIONS}",
  "urgency": "Assess the urgency and choose from this list: {URGENCY_OPTIONS}",
  "assigned_department": "Based on the category, assign the correct department from this list: {DEPARTMENT_OPTIONS}"
}}
"""

router = APIRouter(
    tags=["AI Smart Create"],
    dependencies=[Depends(auth.get_current_user)]
)

@router.post("/reports/smart-create", response_model=schemas.Report, status_code=status.HTTP_201_CREATED)
async def smart_create_report(
    current_user: Annotated[schemas.User, Depends(auth.get_current_user)],
    db: Session = Depends(get_db),
    text: str | None = Form(None, max_length=500),
    image: UploadFile = File(...),
    latitude: float = Form(..., ge=-90, le=90),
    longitude: float = Form(..., ge=-180, le=180)
):
    if not client:
        raise HTTPException(status_code=503, detail="AI service is not configured. GROQ_API_KEY is missing.")

    # 1. Save image and get its path/URL
    full_path, url_path = await save_upload_file(image)
    if not full_path:
        raise HTTPException(status_code=500, detail="Could not save uploaded image file.")

    # 2. Encode image for AI
    base64_image = encode_image_to_base64(full_path)

    # 3. Call Groq AI
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": text or "Please analyze the attached image and classify the civic issue."},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
                        },
                    ],
                }
            ],
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            temperature=0.1,
            max_tokens=256,
        )
        ai_raw_response = chat_completion.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"The AI service failed to process the request: {e}")

    # 4. Parse and validate AI response
    try:
        ai_json = json.loads(ai_raw_response)
        ai_data = AIResponse(**ai_json)
    except (json.JSONDecodeError, ValidationError) as e:
        raise HTTPException(status_code=500, detail=f"The AI service returned an invalid data format. Details: {e}")

    # 5. Create report in DB
    report_create_schema = schemas.ReportCreate(
        **ai_data.dict(),
        original_text=text,
        image_url=url_path,
        latitude=latitude,
        longitude=longitude
    )

    db_report = crud.create_report(db, report=report_create_schema, user_id=current_user.id)

    # 6. Return the formatted response
    return map_report_to_schema(db_report)
