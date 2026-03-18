"""
Blog Writing Agent API endpoints.

All blog data lives in a separate MongoDB database (blog_writing_db).
"""

import asyncio
import logging
import zipfile
from datetime import date, datetime
from io import BytesIO
from pathlib import Path
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from app.core.security import get_current_user
from app.database import get_bwa_db
from app.models.blog import (
    new_blog_doc,
    new_blog_evidence_doc,
    new_blog_image_doc,
    new_blog_task_doc,
)
from app.schemas.blog import (
    BlogDetailResponse,
    BlogGenerateRequest,
    BlogListResponse,
    BlogStatusResponse,
    BlogSummaryResponse,
    BlogUpdateRequest,
)

logger = logging.getLogger(__name__)

router = APIRouter()

# ── In-memory progress tracker (per blog_id string) ─────────────────────────
blog_generation_progress: dict = {}


# ── Helpers ──────────────────────────────────────────────────────────────────

def _oid(id_str: str) -> ObjectId:
    """Convert string to ObjectId, raising 404 on invalid."""
    if not ObjectId.is_valid(id_str):
        raise HTTPException(status_code=404, detail="Blog not found")
    return ObjectId(id_str)


def _blog_summary(doc: dict) -> dict:
    """Convert a MongoDB blog document to a summary dict."""
    return {
        "id": str(doc["_id"]),
        "title": doc.get("title", ""),
        "topic": doc.get("topic", ""),
        "mode": doc.get("mode", ""),
        "blog_kind": doc.get("blog_kind", ""),
        "word_count": doc.get("word_count", 0),
        "image_count": doc.get("image_count", 0),
        "status": doc.get("status", "processing"),
        "created_at": doc.get("created_at"),
    }


# ── Background Task: Generate Blog ──────────────────────────────────────────

async def _generate_blog_background(
    blog_id_str: str,
    user_id: str,
    topic: str,
    as_of: str,
):
    """
    Background coroutine that runs the BWA engine and saves results to MongoDB.
    """
    bwa_db = get_bwa_db()

    try:
        blog_generation_progress[blog_id_str] = {
            "status": "processing",
            "current_stage": "initializing",
            "mode": "",
            "evidence_count": 0,
            "completed_sections": 0,
            "total_sections": 0,
        }

        # Import here to avoid circular imports
        from app.core.bwa_engine import BlogWriterEngine

        engine = BlogWriterEngine()

        async def progress_callback(data: dict):
            blog_generation_progress[blog_id_str] = {
                "status": "processing",
                "current_stage": data.get("stage_label", data.get("stage", "")),
                "mode": data.get("mode", ""),
                "evidence_count": data.get("evidence_count", 0),
                "completed_sections": data.get("completed_sections", 0),
                "total_sections": data.get("total_sections", 0),
            }

        result = await engine.generate_blog(
            topic=topic,
            as_of=as_of,
            progress_callback=progress_callback,
        )

        # ── Save results to MongoDB ──────────────────────────────────────
        plan = result.get("plan") or {}
        final_md = result.get("final", "")
        evidence = result.get("evidence", [])
        image_specs = result.get("image_specs", [])
        sections = result.get("sections", [])

        # Generate images
        from app.utils.image_handler import generate_blog_images

        updated_specs = await generate_blog_images(
            image_specs=image_specs,
            user_id=user_id,
            blog_id=blog_id_str,
        )

        # Update blog document
        update_data = {
            "title": plan.get("blog_title", topic),
            "mode": result.get("mode", ""),
            "blog_kind": plan.get("blog_kind", ""),
            "audience": plan.get("audience", ""),
            "tone": plan.get("tone", ""),
            "markdown_content": final_md,
            "markdown_with_placeholders": result.get("md_with_placeholders", ""),
            "word_count": len(final_md.split()),
            "has_images": len(updated_specs) > 0,
            "image_count": len(updated_specs),
            "status": "completed",
            "updated_at": datetime.utcnow(),
        }

        await bwa_db.blogs.update_one(
            {"_id": ObjectId(blog_id_str)},
            {"$set": update_data},
        )

        # Save tasks
        for task in plan.get("tasks", []):
            task_doc = new_blog_task_doc(
                blog_id=blog_id_str,
                task_order=task.get("id", 0),
                title=task.get("title", ""),
                goal=task.get("goal", ""),
                target_words=task.get("target_words", 300),
                requires_research=task.get("requires_research", False),
                requires_citations=task.get("requires_citations", False),
                requires_code=task.get("requires_code", False),
                tags=task.get("tags", []),
            )
            await bwa_db.blog_tasks.insert_one(task_doc)

        # Save evidence
        for ev in evidence:
            ev_doc = new_blog_evidence_doc(
                blog_id=blog_id_str,
                title=ev.get("title", ""),
                url=ev.get("url", ""),
                snippet=ev.get("snippet", ""),
                published_at=ev.get("published_at"),
                source=ev.get("source", ""),
            )
            await bwa_db.blog_evidence.insert_one(ev_doc)

        # Save image metadata
        for spec in updated_specs:
            img_doc = new_blog_image_doc(
                blog_id=blog_id_str,
                placeholder=spec.get("placeholder", ""),
                filename=spec.get("filename", ""),
                alt_text=spec.get("alt", spec.get("alt_text", "")),
                caption=spec.get("caption", ""),
                prompt=spec.get("prompt", ""),
                size=spec.get("size", "1024x1024"),
                file_path=spec.get("file_path", ""),
            )
            await bwa_db.blog_images.insert_one(img_doc)

        blog_generation_progress[blog_id_str] = {
            "status": "completed",
            "current_stage": "completed",
        }

        logger.info(f"Blog {blog_id_str} generation completed successfully")

    except Exception as e:
        logger.error(f"Blog {blog_id_str} generation failed: {e}", exc_info=True)

        blog_generation_progress[blog_id_str] = {
            "status": "failed",
            "current_stage": "failed",
            "error": str(e),
        }

        await bwa_db.blogs.update_one(
            {"_id": ObjectId(blog_id_str)},
            {"$set": {"status": "failed", "updated_at": datetime.utcnow()}},
        )


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/generate", response_model=BlogStatusResponse)
async def generate_blog(
    request: BlogGenerateRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
):
    """Start generating a new blog post (runs in background)."""
    bwa_db = get_bwa_db()
    user_id = current_user["id"]

    # Create initial blog document
    blog_doc = new_blog_doc(
        user_id=user_id,
        topic=request.topic,
        title=request.topic,
        status="processing",
    )
    result = await bwa_db.blogs.insert_one(blog_doc)
    blog_id_str = str(result.inserted_id)

    as_of = request.as_of or date.today().isoformat()

    # Run in background
    background_tasks.add_task(
        _generate_blog_background,
        blog_id_str=blog_id_str,
        user_id=user_id,
        topic=request.topic,
        as_of=as_of,
    )

    return BlogStatusResponse(
        blog_id=blog_id_str,
        status="processing",
        message="Blog generation started",
    )


@router.get("/{blog_id}/status", response_model=BlogStatusResponse)
async def get_blog_status(
    blog_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get blog generation status (polling endpoint)."""
    bwa_db = get_bwa_db()
    blog = await bwa_db.blogs.find_one(
        {"_id": _oid(blog_id), "user_id": current_user["id"]}
    )
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    progress = blog_generation_progress.get(blog_id, {})

    return BlogStatusResponse(
        blog_id=blog_id,
        status=blog.get("status", "processing"),
        message="",
        progress=progress,
    )


@router.get("", response_model=BlogListResponse)
async def list_blogs(
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
):
    """Get all blogs for the current user."""
    bwa_db = get_bwa_db()
    user_id = current_user["id"]

    cursor = (
        bwa_db.blogs.find({"user_id": user_id})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    blogs = [_blog_summary(doc) async for doc in cursor]
    total = await bwa_db.blogs.count_documents({"user_id": user_id})

    return BlogListResponse(blogs=blogs, total=total)


@router.get("/{blog_id}", response_model=BlogDetailResponse)
async def get_blog(
    blog_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get a specific blog with full content and related data."""
    bwa_db = get_bwa_db()

    blog = await bwa_db.blogs.find_one(
        {"_id": _oid(blog_id), "user_id": current_user["id"]}
    )
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    # Fetch related collections
    tasks_cursor = bwa_db.blog_tasks.find({"blog_id": blog_id}).sort("task_order", 1)
    tasks = []
    async for t in tasks_cursor:
        tasks.append({
            "id": str(t["_id"]),
            "task_order": t.get("task_order", 0),
            "title": t.get("title", ""),
            "goal": t.get("goal", ""),
            "target_words": t.get("target_words", 300),
            "requires_research": t.get("requires_research", False),
            "requires_citations": t.get("requires_citations", False),
            "requires_code": t.get("requires_code", False),
            "tags": t.get("tags", []),
        })

    evidence_cursor = bwa_db.blog_evidence.find({"blog_id": blog_id})
    evidence = []
    async for ev in evidence_cursor:
        evidence.append({
            "id": str(ev["_id"]),
            "title": ev.get("title", ""),
            "url": ev.get("url", ""),
            "snippet": ev.get("snippet", ""),
            "published_at": ev.get("published_at"),
            "source": ev.get("source", ""),
            "created_at": ev.get("created_at"),
        })

    images_cursor = bwa_db.blog_images.find({"blog_id": blog_id})
    images = []
    async for img in images_cursor:
        images.append({
            "id": str(img["_id"]),
            "placeholder": img.get("placeholder", ""),
            "filename": img.get("filename", ""),
            "alt_text": img.get("alt_text", ""),
            "caption": img.get("caption", ""),
            "prompt": img.get("prompt", ""),
            "size": img.get("size", "1024x1024"),
            "file_path": img.get("file_path", ""),
            "created_at": img.get("created_at"),
        })

    return BlogDetailResponse(
        id=str(blog["_id"]),
        title=blog.get("title", ""),
        topic=blog.get("topic", ""),
        mode=blog.get("mode", ""),
        blog_kind=blog.get("blog_kind", ""),
        audience=blog.get("audience", ""),
        tone=blog.get("tone", ""),
        markdown_content=blog.get("markdown_content", ""),
        markdown_with_placeholders=blog.get("markdown_with_placeholders", ""),
        word_count=blog.get("word_count", 0),
        has_images=blog.get("has_images", False),
        image_count=blog.get("image_count", 0),
        status=blog.get("status", "processing"),
        created_at=blog.get("created_at"),
        updated_at=blog.get("updated_at"),
        tasks=tasks,
        evidence=evidence,
        images=images,
    )


@router.put("/{blog_id}", response_model=BlogDetailResponse)
async def update_blog(
    blog_id: str,
    request: BlogUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update a blog (edit content, change status, etc.)."""
    bwa_db = get_bwa_db()

    blog = await bwa_db.blogs.find_one(
        {"_id": _oid(blog_id), "user_id": current_user["id"]}
    )
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    update_fields: dict = {"updated_at": datetime.utcnow()}
    if request.markdown_content is not None:
        update_fields["markdown_content"] = request.markdown_content
        update_fields["word_count"] = len(request.markdown_content.split())
    if request.status is not None:
        update_fields["status"] = request.status
    if request.title is not None:
        update_fields["title"] = request.title

    await bwa_db.blogs.update_one(
        {"_id": _oid(blog_id)},
        {"$set": update_fields},
    )

    # Return full updated blog via the GET handler
    return await get_blog(blog_id, current_user)


@router.get("/{blog_id}/download/markdown")
async def download_markdown(
    blog_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Download the blog as a .md file."""
    bwa_db = get_bwa_db()

    blog = await bwa_db.blogs.find_one(
        {"_id": _oid(blog_id), "user_id": current_user["id"]}
    )
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    content = blog.get("markdown_content", "")
    title = blog.get("title", "blog")
    safe_name = "".join(c if c.isalnum() or c in " _-" else "" for c in title)
    filename = f"{safe_name.strip().replace(' ', '_')}.md"

    return StreamingResponse(
        iter([content]),
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/{blog_id}/download/bundle")
async def download_bundle(
    blog_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Download blog + images as a ZIP bundle."""
    bwa_db = get_bwa_db()

    blog = await bwa_db.blogs.find_one(
        {"_id": _oid(blog_id), "user_id": current_user["id"]}
    )
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    title = blog.get("title", "blog")
    safe_name = "".join(c if c.isalnum() or c in " _-" else "" for c in title)
    md_filename = f"{safe_name.strip().replace(' ', '_')}.md"

    zip_buffer = BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        # Add markdown
        zf.writestr(md_filename, blog.get("markdown_content", ""))

        # Add images
        images_cursor = bwa_db.blog_images.find({"blog_id": blog_id})
        async for img in images_cursor:
            fpath = img.get("file_path", "")
            if fpath and Path(fpath).exists():
                zf.write(fpath, f"images/{img.get('filename', 'image.png')}")

    zip_buffer.seek(0)

    return StreamingResponse(
        iter([zip_buffer.getvalue()]),
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename=blog_{blog_id}_bundle.zip"
        },
    )


@router.delete("/{blog_id}")
async def delete_blog(
    blog_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a blog and all associated data (tasks, evidence, images)."""
    bwa_db = get_bwa_db()

    blog = await bwa_db.blogs.find_one(
        {"_id": _oid(blog_id), "user_id": current_user["id"]}
    )
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    # Delete image files from filesystem
    images_cursor = bwa_db.blog_images.find({"blog_id": blog_id})
    async for img in images_cursor:
        fpath = img.get("file_path", "")
        if fpath and Path(fpath).exists():
            try:
                Path(fpath).unlink()
            except OSError:
                pass

    # Delete from all collections
    await bwa_db.blog_tasks.delete_many({"blog_id": blog_id})
    await bwa_db.blog_evidence.delete_many({"blog_id": blog_id})
    await bwa_db.blog_images.delete_many({"blog_id": blog_id})
    await bwa_db.blogs.delete_one({"_id": _oid(blog_id)})

    # Clean progress tracker
    blog_generation_progress.pop(blog_id, None)

    return {"message": "Blog deleted successfully"}
