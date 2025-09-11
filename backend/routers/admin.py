from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from .. import auth, crud, schemas
from ..database.connection import get_db
# I can't reuse the mapping function directly because it's in a sibling file.
# I will copy the function here. A better solution would be to move it to a utils file.
# For now, this is fine.

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

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(auth.get_current_admin_user)]
)

@router.get("/reports", response_model=List[schemas.Report])
async def get_all_reports_for_admin(
    department: str = Query(None, description="Filter reports by assigned department.", enum=[d.value for d in schemas.ReportBase.__annotations__['assigned_department'].__args__]),
    db: Session = Depends(get_db)
):
    """
    Get all reports for the admin map.
    Can be filtered by department.
    Requires admin privileges.
    """
    if department:
        reports_db = crud.get_reports_by_department(db, department=department)
    else:
        reports_db = db.query(crud.models.Report).order_by(crud.models.Report.created_at.desc()).all()

    return [map_report_to_schema(report) for report in reports_db]

@router.patch("/reports/{report_id}", response_model=schemas.Report)
async def update_a_report_status(
    report_id: int,
    status_update: schemas.ReportStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a report's status.
    Requires admin privileges.
    """
    # First, check if report exists
    report_db = db.query(crud.models.Report).filter(crud.models.Report.id == report_id).first()
    if not report_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    updated_report = crud.update_report_status(db, report_id=report_id, status=status_update.status)

    return map_report_to_schema(updated_report)
