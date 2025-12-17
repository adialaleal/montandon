import httpx
import logging
from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

class EvolutionService:
    
    def _get_headers(self):
        return {
            "apikey": settings.EVOLUTION_API_KEY,
            "Content-Type": "application/json"
        }

    async def send_text(self, phone: str, message: str, delay: int = 2000) -> bool:
        """
        Sends a text message using Evolution API.
        """
        url = f"{settings.EVOLUTION_API_URL}/message/sendText/{settings.EVOLUTION_INSTANCE_NAME}"
        
        payload = {
            "number": phone,
            "options": {
                "delay": delay,
                "presence": "composing",
                "linkPreview": False
            },
            "textMessage": {
                "text": message
            }
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=payload, headers=self._get_headers())
                response.raise_for_status()
                data = response.json()
                # Check for success in response body if Evolution returns structured data
                # Usually Evolution returns the message object if successful
                return True
            except Exception as e:
                logger.error(f"Failed to send message to {phone}: {e}")
                return False

    async def get_instance_status(self):
        url = f"{settings.EVOLUTION_API_URL}/instance/connectionState/{settings.EVOLUTION_INSTANCE_NAME}"
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, headers=self._get_headers())
                return response.json()
            except Exception as e:
                logger.error(f"Error fetching instance status: {e}")
                return {"error": str(e)}

evolution_service = EvolutionService()
