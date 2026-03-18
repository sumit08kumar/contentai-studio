"""
Vercel entrypoint — this file MUST live at the backend root
and contain `app = FastAPI(...)` for Vercel's scanner to detect.
Locally you can still run: uvicorn main:app --reload
"""

import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# ── App-internal imports ──────────────────────────────────
from app.database import connect_to_mongo, close_mongo_connection
from app.api.endpoints import auth, videos, chat, blogs
from app.config import settings

# ── Environment ───────────────────────────────────────────
IS_VERCEL = os.environ.get("VERCEL", False)

# ── Logging ───────────────────────────────────────────────
log_handlers: list[logging.Handler] = [logging.StreamHandler()]
if not IS_VERCEL:
    log_handlers.append(logging.FileHandler("app.log"))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=log_handlers,
)
logger = logging.getLogger(__name__)


# ── Lifespan ──────────────────────────────────────────────
@asynccontextmanager
async def lifespan(_app: FastAPI):
    logger.info("Connecting to MongoDB...")
    await connect_to_mongo()
    logger.info("Connected to MongoDB successfully")

    if not IS_VERCEL:
        Path("storage/blogs").mkdir(parents=True, exist_ok=True)
        Path("storage/images").mkdir(parents=True, exist_ok=True)
    logger.info("Storage directories ready")

    yield

    logger.info("Closing MongoDB connection...")
    await close_mongo_connection()
    logger.info("MongoDB connection closed")


# ── FastAPI app — Vercel detects this ─────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered content studio — YouTube video Q&A, blog generation, web research & AI images",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(videos.router, prefix="/api/videos", tags=["Videos"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(blogs.router, prefix="/api/blogs", tags=["Blog Writing Agent"])

# ── Static files (local only) ────────────────────────────
if not IS_VERCEL:
    Path("storage/images").mkdir(parents=True, exist_ok=True)
    app.mount("/storage", StaticFiles(directory="storage"), name="storage")


# ── Root routes ───────────────────────────────────────────
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
