from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .connection import Base # Import Base from connection.py in the same directory

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="citizen", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    reports = relationship("Report", back_populates="owner")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String, index=True, nullable=False)
    category = Column(String, nullable=False)
    urgency = Column(String, nullable=False)
    assigned_department = Column(String, index=True, nullable=False)

    original_text = Column(String)
    image_url = Column(String)

    # Storing location as separate lat/lon floats
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    status = Column(String, default="Submitted", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    owner = relationship("User", back_populates="reports")
