from sqlalchemy.orm import Session
import math

from . import schemas
from .database import models
from .security import get_password_hash

# --- User CRUD ---

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Report CRUD ---

def create_report(db: Session, report: schemas.ReportCreate, user_id: int):
    # Create a dictionary from the pydantic model
    report_data = report.dict()
    # Create a Report instance using the dictionary
    db_report = models.Report(**report_data, user_id=user_id)
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

def get_reports_by_user_id(db: Session, user_id: int):
    return db.query(models.Report).filter(models.Report.user_id == user_id).order_by(models.Report.created_at.desc()).all()

def get_reports_by_department(db: Session, department: str):
    return db.query(models.Report).filter(models.Report.assigned_department == department).order_by(models.Report.created_at.desc()).all()

def get_reports_nearby(db: Session, lat: float, lon: float, radius_km: int = 5):
    """
    Get reports within a certain radius using the Haversine formula.
    This is less efficient than a real geospatial index but works for SQLite.
    """
    all_reports = db.query(models.Report).order_by(models.Report.created_at.desc()).all()
    nearby_reports = []

    R = 6371  # Radius of Earth in kilometers

    for report in all_reports:
        lat2 = report.latitude
        lon2 = report.longitude

        dLat = math.radians(lat2 - lat)
        dLon = math.radians(lon2 - lon)
        rLat1 = math.radians(lat)
        rLat2 = math.radians(lat2)

        a = math.sin(dLat/2) * math.sin(dLat/2) + \
            math.cos(rLat1) * math.cos(rLat2) * \
            math.sin(dLon/2) * math.sin(dLon/2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        distance = R * c

        if distance <= radius_km:
            nearby_reports.append(report)

    return nearby_reports

def update_report_status(db: Session, report_id: int, status: str):
    db_report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if db_report:
        db_report.status = status
        db.commit()
        db.refresh(db_report)
    return db_report
