import logging
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import get_db
from app.schemas.video import (
    VideoProcess,
    VideoResponse,
    VideoListResponse,
    VideoProcessResponse,
    VideoSummaryResponse,
)
from app.core.security import get_current_user
from app.core.youtube_rag import YouTubeRAG
from app.models.video import new_video_doc
from app.utils.validators import validate_youtube_url

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/process", response_model=VideoProcessResponse)
async def process_video(
    video_data: VideoProcess,
    current_user: dict = Depends(get_current_user),
):
    """Process a new YouTube video - extract transcript, chunk, embed, store"""

    # Validate URL
    if not validate_youtube_url(video_data.video_url):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid YouTube URL",
        )

    db = get_db()

    try:
        rag = YouTubeRAG(user_id=current_user["id"])
        result = rag.process_video(
            video_url=video_data.video_url,
            chunk_size=video_data.chunk_size,
            chunk_overlap=video_data.chunk_overlap,
        )

        # Get video title (try using YouTube API or extract from page)
        video_id = result["video_id"]
        title = f"YouTube Video - {video_id}"

        # Check if video already exists for this user
        existing = await db.videos.find_one(
            {"video_id": video_id, "user_id": current_user["id"]}
        )

        if existing:
            # Update existing record
            await db.videos.update_one(
                {"_id": existing["_id"]},
                {"$set": {
                    "transcript_length": result["transcript_length"],
                    "num_chunks": result["num_chunks"],
                }},
            )
            return VideoProcessResponse(
                video_id=video_id,
                id=str(existing["_id"]),
                title=existing.get("title", title),
                transcript_length=result["transcript_length"],
                num_chunks=result["num_chunks"],
                message="Video re-processed successfully",
            )

        # Save to database
        video_doc = new_video_doc(
            user_id=current_user["id"],
            video_id=video_id,
            video_url=video_data.video_url,
            title=title,
            transcript_length=result["transcript_length"],
            num_chunks=result["num_chunks"],
        )
        insert_result = await db.videos.insert_one(video_doc)

        return VideoProcessResponse(
            video_id=video_id,
            id=str(insert_result.inserted_id),
            title=title,
            transcript_length=result["transcript_length"],
            num_chunks=result["num_chunks"],
            message="Video processed successfully",
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error processing video: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing video: {str(e)}",
        )


@router.get("/", response_model=VideoListResponse)
async def get_videos(
    current_user: dict = Depends(get_current_user),
):
    """Get all videos for the current user"""
    db = get_db()
    cursor = db.videos.find(
        {"user_id": current_user["id"]}
    ).sort("created_at", -1)

    videos = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        videos.append(VideoResponse(
            id=doc["id"],
            video_id=doc["video_id"],
            video_url=doc["video_url"],
            title=doc.get("title", ""),
            transcript_length=doc.get("transcript_length", 0),
            num_chunks=doc.get("num_chunks", 0),
            created_at=doc["created_at"],
        ))

    return VideoListResponse(videos=videos, total=len(videos))


@router.get("/{video_id}", response_model=VideoResponse)
async def get_video(
    video_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get specific video details"""
    db = get_db()

    try:
        obj_id = ObjectId(video_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid video ID format",
        )

    video = await db.videos.find_one(
        {"_id": obj_id, "user_id": current_user["id"]}
    )
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found",
        )

    video["id"] = str(video["_id"])
    return VideoResponse(
        id=video["id"],
        video_id=video["video_id"],
        video_url=video["video_url"],
        title=video.get("title", ""),
        transcript_length=video.get("transcript_length", 0),
        num_chunks=video.get("num_chunks", 0),
        created_at=video["created_at"],
    )


@router.delete("/{video_id}")
async def delete_video(
    video_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a video and its related data"""
    db = get_db()

    try:
        obj_id = ObjectId(video_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid video ID format",
        )

    video = await db.videos.find_one(
        {"_id": obj_id, "user_id": current_user["id"]}
    )
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found",
        )

    # Delete embeddings from Pinecone
    try:
        rag = YouTubeRAG(user_id=current_user["id"])
        rag.delete_video_embeddings(video["video_id"])
    except Exception as e:
        logger.warning(f"Could not delete embeddings: {e}")

    # Delete related chat history
    await db.chat_history.delete_many({"video_id": str(video["_id"])})
    # Delete the video
    await db.videos.delete_one({"_id": obj_id})

    return {"message": "Video deleted successfully"}


@router.get("/{video_id}/summary", response_model=VideoSummaryResponse)
async def get_video_summary(
    video_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Generate and return a video summary"""
    db = get_db()

    try:
        obj_id = ObjectId(video_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid video ID format",
        )

    video = await db.videos.find_one(
        {"_id": obj_id, "user_id": current_user["id"]}
    )
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found",
        )

    try:
        rag = YouTubeRAG(user_id=current_user["id"])
        transcript = rag.get_transcript(video["video_id"])
        summary = rag.summarize(video["video_id"], transcript)

        return VideoSummaryResponse(
            video_id=video["video_id"],
            title=video.get("title", ""),
            summary=summary,
        )
    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating summary: {str(e)}",
        )
