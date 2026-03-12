import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import connect_to_mongo, close_mongo_connection
from app.api.endpoints import auth, videos, chat, blogs
from app.config import settings

IS_VERCEL = os.environ.get("VERCEL", False)

# Configure logging (skip file handler on Vercel — filesystem is read-only)
log_handlers: list[logging.Handler] = [logging.StreamHandler()]
if not IS_VERCEL:
    log_handlers.append(logging.FileHandler("app.log"))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=log_handlers,
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    logger.info("Connecting to MongoDB...")
    await connect_to_mongo()
    logger.info("Connected to MongoDB successfully")

    # Ensure storage directories exist (local only)
    if not IS_VERCEL:
        Path("storage/blogs").mkdir(parents=True, exist_ok=True)
        Path("storage/images").mkdir(parents=True, exist_ok=True)
    logger.info("Storage directories ready")

    yield
    # Shutdown
    logger.info("Closing MongoDB connection...")
    await close_mongo_connection()
    logger.info("MongoDB connection closed")


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered content studio — YouTube video Q&A, blog generation, web research & AI images",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(videos.router, prefix="/api/videos", tags=["Videos"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(blogs.router, prefix="/api/blogs", tags=["Blog Writing Agent"])

# Serve generated images as static files (local only — Vercel FS is ephemeral)
if not IS_VERCEL:
    Path("storage/images").mkdir(parents=True, exist_ok=True)
    app.mount("/storage", StaticFiles(directory="storage"), name="storage")


@app.get("/")
async def root():
    return {
        "message": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational",
        "features": ["YouTube RAG Chat", "Blog Writing Agent"],
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
