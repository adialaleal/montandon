from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "Montandon"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "postgresql://tatoh_user:582275325@host.docker.internal:5433/montandon"
    
    # Apify
    APIFY_API_KEY: str = ""
    APIFY_ACTOR_ID: str = "compass/crawler-google-places"
    
    # Evolution API
    EVOLUTION_API_URL: str = "http://evolution:8080"
    EVOLUTION_INSTANCE_NAME: str = "main"
    EVOLUTION_API_KEY: str = "" # In real setup this might be global API key if enabled, but usually instance token is more important. 
    # Evolution usually uses an API Global Key in headers or Instance Token. We will assume Global Key for management.

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
