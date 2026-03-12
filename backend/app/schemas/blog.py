"""Pydantic schemas for Blog Writing Agent API."""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


# ─── Request schemas ─────────────────────────────────────────────────────────

class BlogGenerateRequest(BaseModel):
    topic: str = Field(..., min_length=3, max_length=500, description="Blog topic")
    as_of: Optional[str] = Field(
        None, description="Date context for research (YYYY-MM-DD)"
    )


class BlogUpdateRequest(BaseModel):
    markdown_content: Optional[str] = None
    status: Optional[str] = None
    title: Optional[str] = None


# ─── Sub-schemas for nested data ─────────────────────────────────────────────

class BlogTaskSchema(BaseModel):
    id: Optional[str] = None
    task_order: int
    title: str
    goal: str = ""
    target_words: int = 300
    requires_research: bool = False
    requires_citations: bool = False
    requires_code: bool = False
    tags: List[str] = []


class BlogEvidenceSchema(BaseModel):
    id: Optional[str] = None
    title: str = ""
    url: str = ""
    snippet: str = ""
    published_at: Optional[str] = None
    source: str = ""
    created_at: Optional[datetime] = None


class BlogImageSchema(BaseModel):
    id: Optional[str] = None
    placeholder: str = ""
    filename: str = ""
    alt_text: str = ""
    caption: str = ""
    prompt: str = ""
    size: str = "1024x1024"
    file_path: str = ""
    created_at: Optional[datetime] = None


# ─── Response schemas ────────────────────────────────────────────────────────

class BlogStatusResponse(BaseModel):
    blog_id: str
    status: str
    message: str = ""
    progress: Optional[dict] = None


class BlogSummaryResponse(BaseModel):
    """Lightweight blog info for list views."""
    id: str
    title: str
    topic: str
    mode: str = ""
    blog_kind: str = ""
    word_count: int = 0
    image_count: int = 0
    status: str = "processing"
    created_at: Optional[datetime] = None


class BlogListResponse(BaseModel):
    blogs: List[BlogSummaryResponse]
    total: int


class BlogDetailResponse(BaseModel):
    """Full blog detail including content and related data."""
    id: str
    title: str
    topic: str
    mode: str = ""
    blog_kind: str = ""
    audience: str = ""
    tone: str = ""
    markdown_content: str = ""
    markdown_with_placeholders: str = ""
    word_count: int = 0
    has_images: bool = False
    image_count: int = 0
    status: str = "processing"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    tasks: List[BlogTaskSchema] = []
    evidence: List[BlogEvidenceSchema] = []
    images: List[BlogImageSchema] = []
