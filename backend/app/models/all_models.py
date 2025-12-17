from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SqEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base

class ContactStatus(str, enum.Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    ERROR = "ERROR"
    ARCHIVED = "ARCHIVED"

class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String, unique=True, index=True)
    address = Column(String, nullable=True)
    category = Column(String, nullable=True)
    google_maps_link = Column(String, nullable=True)
    
    # Can be used to track if this contact was ever contacted successfully
    status = Column(String, default=ContactStatus.PENDING) 
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Template(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    content = Column(Text) # Supports {nome}, {cidade} etc
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    template_id = Column(Integer, ForeignKey("templates.id"))
    status = Column(String, default="DRAFT") # DRAFT, RUNNING, COMPLETED
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    template = relationship("Template")
    logs = relationship("CampaignLog", back_populates="campaign")

class CampaignLog(Base):
    __tablename__ = "campaign_logs"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    contact_id = Column(Integer, ForeignKey("contacts.id"))
    status = Column(String) # SENT, ERROR
    error_message = Column(Text, nullable=True)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())

    campaign = relationship("Campaign", back_populates="logs")
    contact = relationship("Contact")
