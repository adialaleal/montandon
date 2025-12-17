from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.all_models import ContactStatus

# --- Contact Schemas ---
class ContactBase(BaseModel):
    name: str
    phone: str
    address: Optional[str] = None
    category: Optional[str] = None
    google_maps_link: Optional[str] = None

class ContactCreate(ContactBase):
    pass

class ContactRead(ContactBase):
    id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ContactUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None

# --- Template Schemas ---
class TemplateBase(BaseModel):
    name: str
    content: str

class TemplateCreate(TemplateBase):
    pass

class TemplateRead(TemplateBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- Campaign Schemas ---
class CampaignBase(BaseModel):
    name: str
    template_id: int

class CampaignCreate(CampaignBase):
    contact_ids: List[int]

class CampaignRead(CampaignBase):
    id: int
    status: str
    created_at: datetime
    # logs: List[CampaignLogRead] = []

    class Config:
        from_attributes = True

# --- Search Schemas ---
class SearchRequest(BaseModel):
    terms: List[str]
    locations: List[str]
    limit: int = 50
