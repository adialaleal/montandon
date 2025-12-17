from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.all_models import Template
from app.schemas.all_schemas import TemplateCreate, TemplateRead

router = APIRouter()

@router.get("/", response_model=List[TemplateRead])
def read_templates(db: Session = Depends(get_db)):
    return db.query(Template).all()

@router.post("/", response_model=TemplateRead)
def create_template(template: TemplateCreate, db: Session = Depends(get_db)):
    db_template = Template(**template.model_dump())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

@router.delete("/{template_id}")
def delete_template(template_id: int, db: Session = Depends(get_db)):
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    db.delete(template)
    db.commit()
    return {"ok": True}
