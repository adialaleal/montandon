from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.all_models import Contact, ContactStatus
from app.schemas.all_schemas import ContactCreate, ContactRead, ContactUpdate

router = APIRouter()

@router.get("/", response_model=List[ContactRead])
def read_contacts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    contacts = db.query(Contact).offset(skip).limit(limit).all()
    return contacts

@router.post("/", response_model=List[ContactRead])
def create_contacts(contacts: List[ContactCreate], db: Session = Depends(get_db)):
    """
    Bulk create contacts. Skips duplicates based on phone.
    """
    created_contacts = []
    for contact_data in contacts:
        # Check duplicate
        existing = db.query(Contact).filter(Contact.phone == contact_data.phone).first()
        if existing:
            continue
        
        db_contact = Contact(
            name=contact_data.name,
            phone=contact_data.phone,
            address=contact_data.address,
            category=contact_data.category,
            google_maps_link=contact_data.google_maps_link,
            status=ContactStatus.PENDING
        )
        db.add(db_contact)
        created_contacts.append(db_contact)
    
    db.commit()
    for c in created_contacts:
        db.refresh(c)
    return created_contacts

@router.delete("/{contact_id}")
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    db.delete(contact)
    db.commit()
    return {"ok": True}
