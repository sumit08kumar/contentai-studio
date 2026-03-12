"""
Blog document models for MongoDB.

Database: blog_writing_db

Collections:
  - blogs         (main blog documents)
  - blog_tasks    (individual section tasks from the plan)
  - blog_evidence (research evidence / sources)
  - blog_images   (generated image metadata)
"""
from datetime import datetime
from typing import Any, Dict, List, Optional


def new_blog_doc(
    user_id: str,
    topic: str,
    title: str = "",
    status: str = "processing",
) -> dict:
    """Create a new blog document dict for insertion into blogs collection."""
    now = datetime.utcnow()
    return {
        "user_id": user_id,
        "topic": topic,
        "title": title or topic,
        "mode": "",
        "blog_kind": "",
        "audience": "",
        "tone": "",
        "markdown_content": "",
        "markdown_with_placeholders": "",
        "word_count": 0,
        "has_images": False,
        "image_count": 0,
        "status": status,  # 'processing', 'completed', 'failed'
        "created_at": now,
        "updated_at": now,
    }


def new_blog_task_doc(
    blog_id: str,
    task_order: int,
    title: str,
    goal: str = "",
    target_words: int = 300,
    requires_research: bool = False,
    requires_citations: bool = False,
    requires_code: bool = False,
    tags: Optional[List[str]] = None,
) -> dict:
    """Create a new blog task document for blog_tasks collection."""
    return {
        "blog_id": blog_id,
        "task_order": task_order,
        "title": title,
        "goal": goal,
        "target_words": target_words,
        "requires_research": requires_research,
        "requires_citations": requires_citations,
        "requires_code": requires_code,
        "tags": tags or [],
    }


def new_blog_evidence_doc(
    blog_id: str,
    title: str = "",
    url: str = "",
    snippet: str = "",
    published_at: Optional[str] = None,
    source: str = "",
) -> dict:
    """Create a new blog evidence document for blog_evidence collection."""
    return {
        "blog_id": blog_id,
        "title": title,
        "url": url,
        "snippet": snippet,
        "published_at": published_at,
        "source": source,
        "created_at": datetime.utcnow(),
    }


def new_blog_image_doc(
    blog_id: str,
    placeholder: str = "",
    filename: str = "",
    alt_text: str = "",
    caption: str = "",
    prompt: str = "",
    size: str = "1024x1024",
    file_path: str = "",
) -> dict:
    """Create a new blog image document for blog_images collection."""
    return {
        "blog_id": blog_id,
        "placeholder": placeholder,
        "filename": filename,
        "alt_text": alt_text,
        "caption": caption,
        "prompt": prompt,
        "size": size,
        "file_path": file_path,
        "created_at": datetime.utcnow(),
    }
