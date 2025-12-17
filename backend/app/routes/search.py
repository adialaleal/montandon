from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.schemas.all_schemas import SearchRequest, ContactCreate
from app.services.apify_service import apify_service

router = APIRouter()

@router.post("/", response_model=List[ContactCreate])
async def search_contacts(request: SearchRequest):
    """
    Search for contacts using Apify Google Maps Scraper.
    Does NOT save to DB automatically. Returns results for review.
    """
    try:
        contacts = await apify_service.search_google_maps(
            terms=request.terms,
            locations=request.locations,
            limit=request.limit
        )
        return contacts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
