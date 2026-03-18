# Integration Specification: Blog Writing Agent (BWA) + YouTube RAG Chatbot

## 📋 Overview

This document specifies how to integrate the **Blog Writing Agent (BWA)** feature into your existing **YouTube RAG Chatbot** web application. The integration will add AI-powered blog generation capabilities alongside your existing YouTube video chat functionality.

---

## 🎯 What We're Integrating

### Existing System (Already Built)
- YouTube RAG Chatbot website
- Frontend: React.js
- Backend: Python (FastAPI)
- Features: User auth, video processing, chat interface

### New Feature: Blog Writing Agent (BWA)
- **Source Files**: `bwa_backend.py` (core logic)
- **Capabilities**:
  - AI-powered technical blog generation
  - Web research integration (Tavily API)
  - Image generation (Stable Diffusion XL)
  - Multi-stage pipeline with LangGraph
  - Markdown export with images

### Files to Use
✅ **KEEP & INTEGRATE**:
- `bwa_backend.py` - Core BWA logic (LangGraph pipeline)
- `tavily_test.ipynb` - Reference for Tavily API usage

❌ **DISCARD** (Already replaced by your website):
- `bwa_frontend.py` - Old Streamlit UI (replaced by React)
- `1_bwa_basic.ipynb` - Development notebook
- `2_bwa_improved_prompting.ipynb` - Development notebook
- `3_bwa_research.ipynb` - Development notebook
- `4_bwa_research_fine_tuned.ipynb` - Development notebook
- `5_bwa_image.ipynb` - Development notebook

---

## 🏗️ Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React.js Frontend                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   YouTube    │  │     Blog     │  │   Dashboard  │     │
│  │   Chat UI    │  │  Generator   │  │      UI      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           │
                     REST API (FastAPI)
                           │
┌─────────────────────────────────────────────────────────────┐
│                    Python Backend                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  YouTube RAG │  │   BWA Core   │  │     Auth     │     │
│  │   (Existing) │  │  (LangGraph) │  │  (Existing)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
           │                    │                 │
    ┌──────┴─────┐       ┌──────┴──────┐    ┌────┴─────┐
    │  Pinecone  │       │   Tavily    │    │PostgreSQL│
    │   Vector   │       │   Search    │    │ Database │
    │   Store    │       │     API     │    └──────────┘
    └────────────┘       └─────────────┘
                               │
                         ┌─────┴──────┐
                         │ Hugging    │
                         │ Face API   │
                         │  (SDXL)    │
                         └────────────┘
```

---

## 📁 Updated Project Structure

```
youtube-rag-chatbot/
├── frontend/                    # React.js (Existing)
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # Existing
│   │   │   ├── chat/           # Existing YouTube chat
│   │   │   ├── blog/           # 🆕 NEW: Blog generator UI
│   │   │   │   ├── BlogGenerator.jsx
│   │   │   │   ├── BlogForm.jsx
│   │   │   │   ├── BlogPreview.jsx
│   │   │   │   ├── BlogPlan.jsx
│   │   │   │   ├── EvidenceViewer.jsx
│   │   │   │   └── ImageGallery.jsx
│   │   │   ├── dashboard/      # Existing
│   │   │   └── common/         # Existing
│   │   ├── pages/
│   │   │   ├── BlogPage.jsx    # 🆕 NEW
│   │   │   └── ...             # Existing pages
│   │   └── services/
│   │       ├── blogApi.js      # 🆕 NEW: Blog API calls
│   │       └── ...             # Existing services
│
├── backend/                     # Python FastAPI
│   ├── app/
│   │   ├── core/
│   │   │   ├── youtube_rag.py  # Existing
│   │   │   └── bwa_engine.py   # 🆕 NEW: Blog writing engine
│   │   ├── models/
│   │   │   └── blog.py         # 🆕 NEW: Blog database models
│   │   ├── schemas/
│   │   │   └── blog.py         # 🆕 NEW: Blog Pydantic schemas
│   │   ├── api/endpoints/
│   │   │   ├── auth.py         # Existing
│   │   │   ├── videos.py       # Existing
│   │   │   ├── chat.py         # Existing
│   │   │   └── blogs.py        # 🆕 NEW: Blog endpoints
│   │   └── utils/
│   │       └── image_handler.py # 🆕 NEW: Image generation utils
│   └── requirements.txt         # Updated with new deps
│
├── storage/                     # 🆕 NEW: File storage
│   ├── blogs/                  # Generated blog markdown files
│   └── images/                 # Generated blog images
│
└── .env                        # Updated with new API keys
```

---

## 🗄️ New Database Schema

Add these tables to your existing PostgreSQL database:

### Blogs Table
```sql
CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    topic TEXT NOT NULL,
    mode VARCHAR(50),  -- 'closed_book', 'hybrid', 'open_book'
    blog_kind VARCHAR(50),  -- 'explainer', 'tutorial', 'news_roundup', etc.
    audience VARCHAR(200),
    tone VARCHAR(100),
    
    -- Content
    markdown_content TEXT NOT NULL,
    markdown_with_placeholders TEXT,
    
    -- Metadata
    word_count INTEGER,
    has_images BOOLEAN DEFAULT FALSE,
    image_count INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft',  -- 'draft', 'published', 'archived'
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blogs_user_id ON blogs(user_id);
CREATE INDEX idx_blogs_created_at ON blogs(created_at DESC);
```

### Blog Tasks Table
```sql
CREATE TABLE blog_tasks (
    id SERIAL PRIMARY KEY,
    blog_id INTEGER REFERENCES blogs(id) ON DELETE CASCADE,
    task_order INTEGER NOT NULL,
    title VARCHAR(300) NOT NULL,
    goal TEXT,
    target_words INTEGER,
    requires_research BOOLEAN DEFAULT FALSE,
    requires_citations BOOLEAN DEFAULT FALSE,
    requires_code BOOLEAN DEFAULT FALSE,
    tags JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX idx_blog_tasks_blog_id ON blog_tasks(blog_id);
```

### Blog Evidence Table
```sql
CREATE TABLE blog_evidence (
    id SERIAL PRIMARY KEY,
    blog_id INTEGER REFERENCES blogs(id) ON DELETE CASCADE,
    title VARCHAR(500),
    url TEXT NOT NULL,
    snippet TEXT,
    published_at DATE,
    source VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blog_evidence_blog_id ON blog_evidence(blog_id);
```

### Blog Images Table
```sql
CREATE TABLE blog_images (
    id SERIAL PRIMARY KEY,
    blog_id INTEGER REFERENCES blogs(id) ON DELETE CASCADE,
    placeholder VARCHAR(50),  -- e.g., [[IMAGE_1]]
    filename VARCHAR(255) NOT NULL,
    alt_text VARCHAR(500),
    caption TEXT,
    prompt TEXT,
    size VARCHAR(20),  -- e.g., '1024x1024'
    file_path TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blog_images_blog_id ON blog_images(blog_id);
```

---

## 🔌 New API Endpoints

### Blog Generation Endpoints

#### POST `/api/blogs/generate`
Generate a new blog post
```json
Request:
{
  "topic": "Understanding React Server Components",
  "as_of": "2024-03-08"
}

Response:
{
  "blog_id": 123,
  "status": "processing",
  "message": "Blog generation started"
}
```

#### GET `/api/blogs/{blog_id}/status`
Get blog generation status (for streaming/polling)
```json
Response:
{
  "blog_id": 123,
  "status": "processing",  // 'processing', 'completed', 'failed'
  "progress": {
    "current_stage": "worker",
    "completed_sections": 3,
    "total_sections": 5,
    "mode": "hybrid",
    "evidence_count": 12
  }
}
```

#### GET `/api/blogs`
Get all blogs for current user
```json
Response:
{
  "blogs": [
    {
      "id": 123,
      "title": "Understanding React Server Components",
      "topic": "React Server Components RSC",
      "mode": "hybrid",
      "blog_kind": "explainer",
      "word_count": 2340,
      "image_count": 3,
      "status": "completed",
      "created_at": "2024-03-08T10:30:00Z"
    }
  ],
  "total": 1
}
```

#### GET `/api/blogs/{blog_id}`
Get specific blog with full content
```json
Response:
{
  "id": 123,
  "title": "Understanding React Server Components",
  "markdown_content": "# Understanding React...",
  "plan": {
    "blog_title": "Understanding React Server Components",
    "audience": "React developers",
    "tone": "educational, clear",
    "tasks": [...]
  },
  "evidence": [...],
  "images": [...]
}
```

#### GET `/api/blogs/{blog_id}/download/markdown`
Download blog as markdown file

#### GET `/api/blogs/{blog_id}/download/bundle`
Download blog bundle (MD + images as ZIP)

#### PUT `/api/blogs/{blog_id}`
Update blog (edit markdown, change status)
```json
Request:
{
  "markdown_content": "# Updated content...",
  "status": "published"
}
```

#### DELETE `/api/blogs/{blog_id}`
Delete a blog and associated images

---

## 🔧 Backend Implementation

### 1. Core Engine: `app/core/bwa_engine.py`

Adapt `bwa_backend.py` into a production-ready module:

```python
# app/core/bwa_engine.py

from __future__ import annotations

import operator
import os
from datetime import date
from pathlib import Path
from typing import TypedDict, List, Optional, Literal, Annotated, cast

from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, START, END
from langgraph.types import Send
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

# Import all schemas from bwa_backend.py
class Task(BaseModel):
    # ... (same as bwa_backend.py)
    pass

class Plan(BaseModel):
    # ... (same as bwa_backend.py)
    pass

# ... (all other schemas)

class BlogWriterEngine:
    """
    Production wrapper for the BWA LangGraph pipeline.
    Handles user-specific namespacing and persistence.
    """
    
    def __init__(self, user_id: int, output_dir: Path = Path("storage/blogs")):
        self.user_id = user_id
        self.output_dir = output_dir / str(user_id)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize the LangGraph app (from bwa_backend.py)
        self.app = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        # Copy the graph building logic from bwa_backend.py
        # ... (lines 522-537 from bwa_backend.py)
        pass
    
    async def generate_blog(
        self, 
        topic: str, 
        as_of: str = None,
        progress_callback: Optional[callable] = None
    ) -> dict:
        """
        Generate a blog post asynchronously.
        
        Args:
            topic: Blog topic
            as_of: Date string (YYYY-MM-DD)
            progress_callback: Optional callback for progress updates
            
        Returns:
            dict with plan, evidence, final markdown, image_specs
        """
        if as_of is None:
            as_of = date.today().isoformat()
        
        inputs = {
            "topic": topic,
            "mode": "",
            "needs_research": False,
            "queries": [],
            "evidence": [],
            "plan": None,
            "as_of": as_of,
            "recency_days": 7,
            "sections": [],
            "merged_md": "",
            "md_with_placeholders": "",
            "image_specs": [],
            "final": "",
        }
        
        # Stream the graph execution
        current_state = {}
        async for chunk in self.app.astream(inputs):
            # Update state
            current_state.update(chunk)
            
            # Call progress callback if provided
            if progress_callback:
                await progress_callback({
                    "stage": self._get_current_stage(chunk),
                    "state": current_state
                })
        
        return current_state
    
    def _get_current_stage(self, chunk: dict) -> str:
        """Extract current stage from graph chunk"""
        if isinstance(chunk, dict) and len(chunk) == 1:
            return next(iter(chunk.keys()))
        return "processing"
```

### 2. API Endpoints: `app/api/endpoints/blogs.py`

```python
# app/api/endpoints/blogs.py

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import asyncio
from pathlib import Path
import zipfile
from io import BytesIO

from app.database import get_db
from app.models.blog import Blog, BlogTask, BlogEvidence, BlogImage
from app.schemas.blog import (
    BlogCreate, BlogResponse, BlogListResponse, 
    BlogGenerateRequest, BlogStatusResponse
)
from app.core.bwa_engine import BlogWriterEngine
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

# In-memory store for tracking generation progress
blog_generation_status = {}

async def generate_blog_background(
    blog_id: int,
    user_id: int,
    topic: str,
    as_of: str,
    db: Session
):
    """Background task to generate blog"""
    try:
        # Update status to processing
        blog_generation_status[blog_id] = {
            "status": "processing",
            "progress": {"current_stage": "initializing"}
        }
        
        # Initialize BWA engine
        engine = BlogWriterEngine(user_id)
        
        # Progress callback
        async def progress_callback(data):
            blog_generation_status[blog_id]["progress"] = data
        
        # Generate blog
        result = await engine.generate_blog(
            topic=topic,
            as_of=as_of,
            progress_callback=progress_callback
        )
        
        # Save to database
        blog = db.query(Blog).filter(Blog.id == blog_id).first()
        if blog:
            plan = result.get("plan")
            
            blog.markdown_content = result.get("final", "")
            blog.markdown_with_placeholders = result.get("md_with_placeholders", "")
            blog.mode = result.get("mode", "")
            blog.word_count = len(result.get("final", "").split())
            blog.image_count = len(result.get("image_specs", []))
            blog.has_images = blog.image_count > 0
            blog.status = "completed"
            
            if plan:
                blog.title = plan.get("blog_title", topic)
                blog.blog_kind = plan.get("blog_kind", "")
                blog.audience = plan.get("audience", "")
                blog.tone = plan.get("tone", "")
                
                # Save tasks
                for task in plan.get("tasks", []):
                    db_task = BlogTask(
                        blog_id=blog_id,
                        task_order=task.get("id"),
                        title=task.get("title"),
                        goal=task.get("goal"),
                        target_words=task.get("target_words"),
                        requires_research=task.get("requires_research", False),
                        requires_citations=task.get("requires_citations", False),
                        requires_code=task.get("requires_code", False),
                        tags=task.get("tags", [])
                    )
                    db.add(db_task)
            
            # Save evidence
            for ev in result.get("evidence", []):
                db_evidence = BlogEvidence(
                    blog_id=blog_id,
                    title=ev.get("title"),
                    url=ev.get("url"),
                    snippet=ev.get("snippet"),
                    published_at=ev.get("published_at"),
                    source=ev.get("source")
                )
                db.add(db_evidence)
            
            # Save image specs
            for img in result.get("image_specs", []):
                db_image = BlogImage(
                    blog_id=blog_id,
                    placeholder=img.get("placeholder"),
                    filename=img.get("filename"),
                    alt_text=img.get("alt"),
                    caption=img.get("caption"),
                    prompt=img.get("prompt"),
                    size=img.get("size"),
                    file_path=f"storage/images/{user_id}/{img.get('filename')}"
                )
                db.add(db_image)
            
            db.commit()
        
        # Update final status
        blog_generation_status[blog_id] = {
            "status": "completed",
            "progress": {"current_stage": "completed"}
        }
        
    except Exception as e:
        blog_generation_status[blog_id] = {
            "status": "failed",
            "error": str(e)
        }
        
        # Update DB status
        blog = db.query(Blog).filter(Blog.id == blog_id).first()
        if blog:
            blog.status = "failed"
            db.commit()


@router.post("/generate", response_model=BlogStatusResponse)
async def generate_blog(
    request: BlogGenerateRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a new blog post"""
    
    # Create blog entry in database
    blog = Blog(
        user_id=current_user.id,
        topic=request.topic,
        title=request.topic,  # Will be updated after generation
        markdown_content="",
        status="processing"
    )
    db.add(blog)
    db.commit()
    db.refresh(blog)
    
    # Start background generation
    background_tasks.add_task(
        generate_blog_background,
        blog_id=blog.id,
        user_id=current_user.id,
        topic=request.topic,
        as_of=request.as_of or date.today().isoformat(),
        db=db
    )
    
    return {
        "blog_id": blog.id,
        "status": "processing",
        "message": "Blog generation started"
    }


@router.get("/{blog_id}/status", response_model=BlogStatusResponse)
async def get_blog_status(
    blog_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get blog generation status"""
    
    # Verify ownership
    blog = db.query(Blog).filter(
        Blog.id == blog_id,
        Blog.user_id == current_user.id
    ).first()
    
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Get progress from in-memory store
    progress = blog_generation_status.get(blog_id, {})
    
    return {
        "blog_id": blog_id,
        "status": blog.status,
        "progress": progress.get("progress", {})
    }


@router.get("", response_model=BlogListResponse)
async def list_blogs(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all blogs for current user"""
    
    blogs = db.query(Blog).filter(
        Blog.user_id == current_user.id
    ).order_by(Blog.created_at.desc()).offset(skip).limit(limit).all()
    
    total = db.query(Blog).filter(Blog.user_id == current_user.id).count()
    
    return {
        "blogs": blogs,
        "total": total
    }


@router.get("/{blog_id}", response_model=BlogResponse)
async def get_blog(
    blog_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific blog with full details"""
    
    blog = db.query(Blog).filter(
        Blog.id == blog_id,
        Blog.user_id == current_user.id
    ).first()
    
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Load related data
    tasks = db.query(BlogTask).filter(BlogTask.blog_id == blog_id).all()
    evidence = db.query(BlogEvidence).filter(BlogEvidence.blog_id == blog_id).all()
    images = db.query(BlogImage).filter(BlogImage.blog_id == blog_id).all()
    
    return {
        **blog.__dict__,
        "tasks": tasks,
        "evidence": evidence,
        "images": images
    }


@router.get("/{blog_id}/download/markdown")
async def download_markdown(
    blog_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download blog as markdown file"""
    
    blog = db.query(Blog).filter(
        Blog.id == blog_id,
        Blog.user_id == current_user.id
    ).first()
    
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    filename = f"{blog.title.lower().replace(' ', '_')}.md"
    
    return StreamingResponse(
        iter([blog.markdown_content]),
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/{blog_id}/download/bundle")
async def download_bundle(
    blog_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download blog bundle (MD + images as ZIP)"""
    
    blog = db.query(Blog).filter(
        Blog.id == blog_id,
        Blog.user_id == current_user.id
    ).first()
    
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Create ZIP in memory
    zip_buffer = BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Add markdown
        md_filename = f"{blog.title.lower().replace(' ', '_')}.md"
        zip_file.writestr(md_filename, blog.markdown_content)
        
        # Add images
        images = db.query(BlogImage).filter(BlogImage.blog_id == blog_id).all()
        for img in images:
            if Path(img.file_path).exists():
                zip_file.write(img.file_path, f"images/{img.filename}")
    
    zip_buffer.seek(0)
    
    return StreamingResponse(
        iter([zip_buffer.getvalue()]),
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename=blog_{blog_id}_bundle.zip"}
    )


@router.delete("/{blog_id}")
async def delete_blog(
    blog_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a blog and associated files"""
    
    blog = db.query(Blog).filter(
        Blog.id == blog_id,
        Blog.user_id == current_user.id
    ).first()
    
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Delete associated images from filesystem
    images = db.query(BlogImage).filter(BlogImage.blog_id == blog_id).all()
    for img in images:
        if Path(img.file_path).exists():
            Path(img.file_path).unlink()
    
    # Delete from database (cascade will handle related records)
    db.delete(blog)
    db.commit()
    
    return {"message": "Blog deleted successfully"}
```

---

## 🎨 Frontend Implementation

### 1. Blog Generator Page: `src/pages/BlogPage.jsx`

```jsx
// src/pages/BlogPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BlogForm from '../components/blog/BlogForm';
import BlogPreview from '../components/blog/BlogPreview';
import BlogPlan from '../components/blog/BlogPlan';
import EvidenceViewer from '../components/blog/EvidenceViewer';
import ImageGallery from '../components/blog/ImageGallery';
import { generateBlog, getBlogStatus, getBlog } from '../services/blogApi';

const BlogPage = () => {
  const [currentBlogId, setCurrentBlogId] = useState(null);
  const [blogData, setBlogData] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, generating, completed, error
  const [progress, setProgress] = useState({});
  const navigate = useNavigate();

  const handleGenerateBlog = async (topic, asOf) => {
    try {
      setStatus('generating');
      
      // Start blog generation
      const response = await generateBlog({ topic, as_of: asOf });
      setCurrentBlogId(response.blog_id);
      
      // Poll for status
      pollBlogStatus(response.blog_id);
    } catch (error) {
      console.error('Blog generation failed:', error);
      setStatus('error');
    }
  };

  const pollBlogStatus = async (blogId) => {
    const interval = setInterval(async () => {
      try {
        const statusData = await getBlogStatus(blogId);
        setProgress(statusData.progress || {});
        
        if (statusData.status === 'completed') {
          clearInterval(interval);
          setStatus('completed');
          
          // Fetch full blog data
          const fullBlog = await getBlog(blogId);
          setBlogData(fullBlog);
        } else if (statusData.status === 'failed') {
          clearInterval(interval);
          setStatus('error');
        }
      } catch (error) {
        console.error('Status check failed:', error);
        clearInterval(interval);
        setStatus('error');
      }
    }, 2000); // Poll every 2 seconds
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          AI Blog Generator
        </h1>
        <p className="text-lg text-gray-600">
          Create high-quality technical blogs with AI-powered research and image generation
        </p>
      </div>

      {status === 'idle' && (
        <BlogForm onSubmit={handleGenerateBlog} />
      )}

      {status === 'generating' && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          
          <h3 className="text-xl font-semibold text-center mb-4">
            Generating Your Blog...
          </h3>
          
          <div className="space-y-3">
            <ProgressItem 
              label="Research Mode" 
              value={progress.mode || 'Analyzing...'} 
            />
            <ProgressItem 
              label="Current Stage" 
              value={progress.current_stage || 'Initializing...'} 
            />
            {progress.evidence_count > 0 && (
              <ProgressItem 
                label="Evidence Found" 
                value={`${progress.evidence_count} sources`} 
              />
            )}
            {progress.total_sections && (
              <ProgressItem 
                label="Sections Progress" 
                value={`${progress.completed_sections || 0} / ${progress.total_sections}`} 
              />
            )}
          </div>
        </div>
      )}

      {status === 'completed' && blogData && (
        <div className="space-y-6">
          {/* Tabs for different views */}
          <Tabs
            tabs={[
              { name: 'Preview', component: <BlogPreview blog={blogData} /> },
              { name: 'Plan', component: <BlogPlan plan={blogData.plan} tasks={blogData.tasks} /> },
              { name: 'Evidence', component: <EvidenceViewer evidence={blogData.evidence} /> },
              { name: 'Images', component: <ImageGallery images={blogData.images} /> },
            ]}
          />
          
          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => window.open(`/api/blogs/${currentBlogId}/download/markdown`, '_blank')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Download Markdown
            </button>
            <button
              onClick={() => window.open(`/api/blogs/${currentBlogId}/download/bundle`, '_blank')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Download Bundle (MD + Images)
            </button>
            <button
              onClick={() => {
                setStatus('idle');
                setBlogData(null);
                setCurrentBlogId(null);
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Generate Another
            </button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold text-red-800 mb-2">
            Generation Failed
          </h3>
          <p className="text-red-600 mb-4">
            Something went wrong while generating your blog. Please try again.
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

// Helper component
const ProgressItem = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-200">
    <span className="text-gray-600 font-medium">{label}:</span>
    <span className="text-gray-900 font-semibold">{value}</span>
  </div>
);

export default BlogPage;
```

### 2. Blog Form Component: `src/components/blog/BlogForm.jsx`

```jsx
// src/components/blog/BlogForm.jsx

import React, { useState } from 'react';

const BlogForm = ({ onSubmit }) => {
  const [topic, setTopic] = useState('');
  const [asOf, setAsOf] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic, asOf);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold mb-6">What do you want to write about?</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blog Topic *
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., 'Understanding React Server Components', 'Latest developments in AI', 'How to build a REST API with FastAPI'"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            required
          />
          <p className="mt-2 text-sm text-gray-500">
            Be specific! The AI will research and generate a comprehensive blog post.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            As-of Date
          </label>
          <input
            type="date"
            value={asOf}
            onChange={(e) => setAsOf(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-2 text-sm text-gray-500">
            The date context for research (affects recency of sources)
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>✓ AI analyzes your topic and determines research needs</li>
            <li>✓ Searches the web for latest information (if needed)</li>
            <li>✓ Creates a structured outline with multiple sections</li>
            <li>✓ Writes comprehensive content with citations</li>
            <li>✓ Generates relevant diagrams and images</li>
            <li>✓ Delivers a publication-ready blog post</li>
          </ul>
        </div>

        <button
          type="submit"
          className="w-full px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-lg"
        >
          🚀 Generate Blog Post
        </button>
      </form>
    </div>
  );
};

export default BlogForm;
```

### 3. Blog Preview Component: `src/components/blog/BlogPreview.jsx`

```jsx
// src/components/blog/BlogPreview.jsx

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const BlogPreview = ({ blog }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {blog.title}
        </h1>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>📊 {blog.word_count} words</span>
          <span>🖼️ {blog.image_count} images</span>
          <span>📝 {blog.mode}</span>
        </div>
      </div>

      <div className="prose prose-lg max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            // Custom image renderer
            img: ({ node, ...props }) => (
              <div className="my-6">
                <img 
                  {...props} 
                  className="rounded-lg shadow-md w-full"
                  loading="lazy"
                />
                {props.alt && (
                  <p className="text-center text-sm text-gray-600 mt-2 italic">
                    {props.alt}
                  </p>
                )}
              </div>
            ),
            // Custom code block renderer
            code: ({ node, inline, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <div className="relative">
                  <div className="absolute top-0 right-0 px-3 py-1 text-xs text-gray-500 bg-gray-100 rounded-bl">
                    {match[1]}
                  </div>
                  <pre className={className} {...props}>
                    <code className={className}>{children}</code>
                  </pre>
                </div>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {blog.markdown_content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default BlogPreview;
```

---

## 📦 Updated Dependencies

### Backend `requirements.txt` (Add these)
```txt
# Existing dependencies...
# (keep all existing packages)

# BWA Dependencies
langgraph==0.2.0
huggingface-hub==0.20.0
tavily-python==0.3.0  # or use langchain-community's TavilySearchResults
```

### Frontend `package.json` (Add these)
```json
{
  "dependencies": {
    // ... existing dependencies
    "react-markdown": "^9.0.1",
    "remark-gfm": "^4.0.0"
  }
}
```

---

## 🔐 Environment Variables

Update `.env` file with new API keys:

```env
# Existing variables...
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=pcsk_...
DATABASE_URL=postgresql://...

# NEW: BWA API Keys
TAVILY_API_KEY=tvly-...           # Get from https://tavily.com
HF_API_TOKEN=hf_...               # Get from https://huggingface.co/settings/tokens
```

---

## 🚀 Integration Steps

### Phase 1: Backend Setup (2-3 hours)

1. **Database Migration**
   ```bash
   # Create migration for new tables
   alembic revision --autogenerate -m "Add blog tables"
   alembic upgrade head
   ```

2. **Add BWA Core Module**
   - Copy `bwa_backend.py` logic to `app/core/bwa_engine.py`
   - Adapt for async operation and user namespacing
   - Add error handling and logging

3. **Create API Endpoints**
   - Implement `app/api/endpoints/blogs.py`
   - Add blog models and schemas
   - Update `main.py` to include blog router

4. **File Storage Setup**
   ```bash
   mkdir -p storage/blogs storage/images
   ```

### Phase 2: Frontend Implementation (3-4 hours)

1. **Create Blog Components**
   - `BlogPage.jsx` (main page)
   - `BlogForm.jsx` (input form)
   - `BlogPreview.jsx` (markdown preview)
   - `BlogPlan.jsx` (plan viewer)
   - `EvidenceViewer.jsx` (sources)
   - `ImageGallery.jsx` (generated images)

2. **Add Blog API Service**
   ```javascript
   // src/services/blogApi.js
   export const generateBlog = (data) => api.post('/blogs/generate', data);
   export const getBlogStatus = (id) => api.get(`/blogs/${id}/status`);
   export const getBlog = (id) => api.get(`/blogs/${id}`);
   export const listBlogs = () => api.get('/blogs');
   ```

3. **Update Navigation**
   - Add "Blog Generator" link to navbar
   - Add route in `App.jsx`

### Phase 3: Integration & Testing (1-2 hours)

1. **Test End-to-End Flow**
   - Generate a simple blog (closed_book mode)
   - Generate a research blog (hybrid mode)
   - Generate a news roundup (open_book mode)
   - Test image generation
   - Test downloads

2. **Dashboard Integration**
   - Add blog list to dashboard
   - Add quick stats (total blogs, recent blogs)
   - Link to individual blogs

### Phase 4: Optimization (1-2 hours)

1. **Add Caching**
   - Cache Tavily search results
   - Cache generated images

2. **Add WebSocket Support** (Optional)
   - Real-time progress updates instead of polling

3. **Add Queue System** (Optional)
   - Use Celery for better handling of long-running tasks

---

## 🎯 Feature Comparison

| Feature | YouTube RAG | Blog Generator | Combined |
|---------|-------------|----------------|----------|
| User Auth | ✅ | - | ✅ |
| Real-time Chat | ✅ | - | ✅ |
| Web Research | - | ✅ | ✅ |
| Image Generation | - | ✅ | ✅ |
| Content Export | PDF transcript | MD + images | Both |
| Vector Storage | Pinecone | - | Pinecone |
| LLM Provider | OpenAI | OpenAI | OpenAI |

---

## 📊 Success Metrics

### Technical Metrics
- **Blog Generation Time**: < 60 seconds for closed_book, < 120 seconds for research blogs
- **Image Generation Success Rate**: > 90%
- **API Response Time**: < 2 seconds (excluding generation)

### User Metrics
- **Blogs Generated per User**: Track adoption
- **Download Rate**: % of blogs downloaded vs generated
- **Mode Distribution**: Which modes are most popular

---

## 🔄 Future Enhancements

1. **Blog from Video**: Generate blog post from YouTube video transcript
2. **Multi-language Support**: Generate blogs in multiple languages
3. **SEO Optimization**: Auto-generate meta tags, descriptions
4. **Collaborative Editing**: Share and edit blogs with team
5. **Publishing Integration**: Direct publish to Medium, Dev.to, WordPress
6. **Template Library**: Pre-built blog templates
7. **Tone Customization**: Custom tone/style presets
8. **Batch Generation**: Generate multiple blogs at once

---

## ✅ Quick Start Checklist

- [ ] Copy BWA backend logic to `app/core/bwa_engine.py`
- [ ] Run database migrations for new blog tables
- [ ] Create blog API endpoints in `app/api/endpoints/blogs.py`
- [ ] Add blog models and schemas
- [ ] Update `main.py` to include blog router
- [ ] Add Tavily and Hugging Face API keys to `.env`
- [ ] Install new Python dependencies
- [ ] Create React blog components
- [ ] Add blog API service
- [ ] Update navigation to include blog page
- [ ] Install new frontend dependencies
- [ ] Test blog generation (all modes)
- [ ] Test image generation
- [ ] Test downloads (MD and bundle)
- [ ] Add blog list to dashboard
- [ ] Deploy and monitor

---

## 🆘 Troubleshooting

### Common Issues

1. **Tavily API Key Invalid**
   - Verify key at https://tavily.com/dashboard
   - Check quota limits

2. **Image Generation Fails**
   - Check Hugging Face API token
   - Verify SDXL model access
   - Check rate limits

3. **Blog Generation Timeout**
   - Increase backend timeout settings
   - Consider using Celery for long tasks

4. **Image Paths Broken**
   - Verify `storage/images` directory exists
   - Check file permissions

---

## 📝 Summary

This integration adds powerful AI blog generation capabilities to your existing YouTube RAG chatbot platform. The BWA system will:

1. ✅ Seamlessly integrate with existing auth and database
2. ✅ Provide professional blog generation with research
3. ✅ Generate relevant images automatically
4. ✅ Export in multiple formats
5. ✅ Maintain all existing YouTube chat functionality

**Estimated Implementation Time**: 8-12 hours for full integration

**Key Benefit**: Your users can now both chat with YouTube videos AND generate professional blog posts, making your platform a complete content creation suite.
