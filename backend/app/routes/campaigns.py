from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import logging
import asyncio

from app.core.database import get_db
from app.models.all_models import Campaign, CampaignLog, Contact, Template, ContactStatus
from app.schemas.all_schemas import CampaignCreate, CampaignRead
from app.services.evolution_service import evolution_service

router = APIRouter()
logger = logging.getLogger(__name__)

async def run_campaign_background(campaign_id: int, contact_ids: List[int], db_session_factory):
    """
    Background task to process campaign.
    We use a fresh session because the passed one might be closed.
    """
    db = db_session_factory()
    try:
        campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not campaign:
            return

        template = campaign.template
        contacts = db.query(Contact).filter(Contact.id.in_(contact_ids)).all()

        campaign.status = "RUNNING"
        db.commit()

        for contact in contacts:
            # Format message
            message = template.content.format(
                nome=contact.name or "",
                cidade=contact.address or "", # Simplified
                categoria=contact.category or ""
            )

            # Send
            success = await evolution_service.send_text(
                phone=contact.phone,
                message=message
            )

            # Log
            log = CampaignLog(
                campaign_id=campaign.id,
                contact_id=contact.id,
                status="SENT" if success else "ERROR",
                error_message=None if success else "Failed to send via Evolution API"
            )
            db.add(log)
            
            # Update Contact Status
            contact.status = ContactStatus.SENT if success else ContactStatus.ERROR
            db.commit()
            
            # Wait a bit to avoid ban
            await asyncio.sleep(5) 

        campaign.status = "COMPLETED"
        db.commit()

    except Exception as e:
        logger.error(f"Campaign failed: {e}")
        if campaign:
            campaign.status = "ERROR"
            db.commit()
    finally:
        db.close()

@router.post("/", response_model=CampaignRead)
def create_campaign(
    campaign_in: CampaignCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # 1. Verify template
    template = db.query(Template).filter(Template.id == campaign_in.template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # 2. Create Campaign Record
    db_campaign = Campaign(
        name=campaign_in.name,
        template_id=campaign_in.template_id,
        status="QUEUED"
    )
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)

    # 3. Launch Background Task
    # We pass the session factory (SessionLocal) to the background task
    from app.core.database import SessionLocal
    background_tasks.add_task(
        run_campaign_background, 
        db_campaign.id, 
        campaign_in.contact_ids, 
        SessionLocal
    )

    return db_campaign

@router.get("/", response_model=List[CampaignRead])
def list_campaigns(db: Session = Depends(get_db)):
    return db.query(Campaign).all()

@router.get("/logs")
def list_logs(db: Session = Depends(get_db)):
    # Simple join to get strings would be better, but for now returning raw logs
    # ideally we return a schema with campaign_name and contact_name
    logs = db.query(
        CampaignLog.id, 
        CampaignLog.status, 
        CampaignLog.sent_at, 
        CampaignLog.error_message, 
        Campaign.name.label("campaign_name"), 
        Contact.name.label("contact_name")
    ).join(Campaign).join(Contact).order_by(CampaignLog.sent_at.desc()).all()
    
    # transform to list of dicts for JSON
    return [
        {
            "id": log.id,
            "status": log.status,
            "sent_at": log.sent_at,
            "error_message": log.error_message,
            "campaign_name": log.campaign_name,
            "contact_name": log.contact_name
        } 
        for log in logs
    ]
