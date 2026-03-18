import os
import json
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


def _parse_allowed_origins() -> list[str]:
    default_origins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    raw_origins = os.getenv("ALLOWED_ORIGINS", "").strip()
    if not raw_origins:
        return default_origins

    try:
        parsed = json.loads(raw_origins)
        if isinstance(parsed, list):
            origins = [str(origin).strip() for origin in parsed if str(origin).strip()]
            return origins or default_origins
    except json.JSONDecodeError:
        pass

    origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
    return origins or default_origins


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "ContentAI Studio API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # MongoDB
    MONGODB_URL: str = os.getenv(
        "MONGODB_URL",
        "mongodb://localhost:27017",
    )
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "youtube_rag_db")
    BWA_MONGODB_DB_NAME: str = os.getenv("BWA_MONGODB_DB_NAME", "blog_writing_db")

    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-min-32-characters-long-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # OpenAI
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # Pinecone
    PINECONE_API_KEY: str = os.getenv("PINECONE_API_KEY", "")

    # CORS
    ALLOWED_ORIGINS: list[str] = _parse_allowed_origins()

    # Extra API Keys
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")
    HF_API_TOKEN: str = os.getenv("HF_API_TOKEN", "")

    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()
