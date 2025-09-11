from typing import List, Annotated
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from .. import auth, crud, schemas
from ..database.connection import get_db

router = APIRouter(
    prefix="/reports",
    tags=["Citizen Reports"],
    dependencies=[Depends(auth.get_current_user)] # Protect all routes in this router
)

def map_report_to_schema(report_db) -> schemas.Report:
    """
    Manually maps the database model to the Pydantic schema,
    creating the nested GeoJSONLocation object.
    """
    return schemas.Report(
        id=report_db.id,
        user_id=report_db.user_id,
        title=report_db.title,
        category=report_db.category,
        urgency=report_db.urgency,
        assigned_department=report_db.assigned_department,
        original_text=report_db.original_text,
        image_url=report_db.image_url,
        status=report_db.status,
        created_at=report_db.created_at,
        updated_at=report_db.updated_at,
        location=schemas.GeoJSONLocation(
            coordinates=[report_db.longitude, report_db.latitude]
        )
    )

@router.get("/nearby", response_model=List[schemas.Report])
async def get_nearby_reports(
    lat: float = Query(..., description="Latitude of the user's location.", ge=-90, le=90),
    lon: float = Query(..., description="Longitude of the user's location.", ge=-180, le=180),
    db: Session = Depends(get_db)
):
    """
    Get recent reports for the citizen feed based on location.
    Requires authentication.
    """
    reports_db = crud.get_reports_nearby(db, lat=lat, lon=lon)
    # Pydantic v2 with `from_attributes=True` can handle this automatically,
    # but manual mapping is explicit and avoids issues if field names differ.
    return [map_report_to_schema(report) for report in reports_db]

@router.get("/my-reports", response_model=List[schemas.Report])
async def get_user_reports(
    current_user: Annotated[schemas.User, Depends(auth.get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Get all reports submitted by the currently logged-in user.
    Requires authentication.
    """
    reports_db = crud.get_reports_by_user_id(db, user_id=current_user.id)
    return [map_report_to_schema(report) for report in reports_db]
