import httpx
import logging
from typing import List, Dict, Any
from app.core.config import get_settings
from app.schemas.all_schemas import ContactCreate
from app.utils.phone_normalizer import normalize_phone

settings = get_settings()
logger = logging.getLogger(__name__)

class ApifyService:
    BASE_URL = "https://api.apify.com/v2"

    async def search_google_maps(self, terms: List[str], locations: List[str], limit: int = 50) -> List[ContactCreate]:
        """
        Runs the Google Maps Scraper on Apify and returns normalized contacts.
        """
        # Generate all combinations of terms and locations
        search_queries = []
        for term in terms:
            for location in locations:
                search_queries.append(f"{term} in {location}")
        
        # Payload for compass/crawler-google-places
        input_data = {
            "searchStringsArray": search_queries,
            "maxCrawledPlaces": limit,
            "language": "pt-BR",
            "countryCode": "br", # prioritizing Brazil as per context
            "zoom": 14
        }
        
        actor_id = settings.APIFY_ACTOR_ID.replace("/", "~")
        url = f"{self.BASE_URL}/acts/{actor_id}/run-sync-get-dataset-items"
        
        params = {
            "token": settings.APIFY_API_KEY,
            "memory": 4096 # giving enough memory to crawler
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            try:
                logger.info(f"Starting Apify task for {len(search_queries)} queries: {search_queries}")
                response = await client.post(url, json=input_data, params=params)
                
                if response.is_error:
                    logger.error(f"Apify Error Body: {response.text}")
                
                response.raise_for_status()
                
                items = response.json()
                logger.info(f"Apify returned {len(items)} items")
                
                contacts = []
                for item in items:
                    phone = item.get("phoneUnformatted") or item.get("phone")
                    
                    # Skip if no phone
                    if not phone:
                        continue
                        
                    normalized_phone = normalize_phone(phone)
                    
                    # Create Contact object
                    contact = ContactCreate(
                        name=item.get("title", "Unknown"),
                        phone=normalized_phone,
                        address=item.get("address"),
                        category=item.get("categoryName"),
                        google_maps_link=item.get("url")
                    )
                    contacts.append(contact)
                    
                return contacts

            except httpx.HTTPError as e:
                logger.error(f"Apify API error: {e}")
                # We already logged the body if is_error was true above
                raise
            except Exception as e:
                logger.error(f"Unexpected error in Apify service: {e}")
                raise

apify_service = ApifyService()
