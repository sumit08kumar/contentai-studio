import logging
from datetime import datetime
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import PlainTextResponse

from app.database import get_db
from app.schemas.chat import (
    ChatAsk,
    ChatAskWithMemory,
    ChatResponse,
    ChatWithMemoryResponse,
    ChatHistoryResponse,
    ChatHistoryItem,
    ChatExportResponse,
)
from app.core.security import get_current_user
from app.core.youtube_rag import YouTubeRAG
from app.models.chat import new_chat_history_doc, new_session_doc

logger = logging.getLogger(__name__)
router = APIRouter()


async def _get_video_or_404(db, video_id: str, user_id: str):
    """Helper to find a video by its MongoDB _id and verify ownership."""
    try:
        obj_id = ObjectId(video_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid video ID format",
        )
    video = await db.videos.find_one({"_id": obj_id, "user_id": user_id})
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found",
        )
    video["id"] = str(video["_id"])
    return video


@router.post("/ask", response_model=ChatResponse)
async def ask_question(
    chat_data: ChatAsk,
    current_user: dict = Depends(get_current_user),
):
    """Ask a question about a video"""
    db = get_db()

    video = await _get_video_or_404(db, chat_data.video_id, current_user["id"])

    try:
        rag = YouTubeRAG(user_id=current_user["id"])
        answer, context_list = rag.ask(
            question=chat_data.question,
            video_id=video["video_id"],
        )

        # Save to chat history
        chat_doc = new_chat_history_doc(
            video_id=video["id"],
            user_id=current_user["id"],
            question=chat_data.question,
            answer=answer,
            context="\n---\n".join(context_list) if context_list else None,
        )
        await db.chat_history.insert_one(chat_doc)

        return ChatResponse(
            answer=answer,
            question=chat_data.question,
            context=context_list if chat_data.verbose else None,
            created_at=chat_doc["created_at"],
        )

    except Exception as e:
        logger.error(f"Error answering question: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing question: {str(e)}",
        )


@router.post("/ask-with-memory", response_model=ChatWithMemoryResponse)
async def ask_with_memory(
    chat_data: ChatAskWithMemory,
    current_user: dict = Depends(get_current_user),
):
    """Ask a question with conversation context"""
    db = get_db()

    video = await _get_video_or_404(db, chat_data.video_id, current_user["id"])

    # Get or create session
    session = None
    if chat_data.session_id:
        try:
            session = await db.sessions.find_one(
                {"_id": ObjectId(chat_data.session_id), "user_id": current_user["id"]}
            )
        except Exception:
            pass

    if not session:
        session_doc = new_session_doc(
            user_id=current_user["id"],
            video_id=video["id"],
            session_name=f"Chat - {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}",
        )
        result = await db.sessions.insert_one(session_doc)
        session_doc["_id"] = result.inserted_id
        session = session_doc

    session_id_str = str(session["_id"])

    try:
        # Get previous messages in this session for context
        cursor = db.chat_history.find(
            {"session_id": session_id_str}
        ).sort("created_at", 1)

        history = []
        async for msg in cursor:
            history.append({"question": msg["question"], "answer": msg["answer"]})

        rag = YouTubeRAG(user_id=current_user["id"])
        answer, context_list = rag.ask_with_memory(
            question=chat_data.question,
            video_id=video["video_id"],
            history=history,
        )

        # Save to chat history
        chat_doc = new_chat_history_doc(
            video_id=video["id"],
            user_id=current_user["id"],
            question=chat_data.question,
            answer=answer,
            context="\n---\n".join(context_list) if context_list else None,
            session_id=session_id_str,
        )
        await db.chat_history.insert_one(chat_doc)

        return ChatWithMemoryResponse(
            answer=answer,
            question=chat_data.question,
            session_id=session_id_str,
            created_at=chat_doc["created_at"],
        )

    except Exception as e:
        logger.error(f"Error answering question with memory: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing question: {str(e)}",
        )


@router.get("/history/{video_id}", response_model=ChatHistoryResponse)
async def get_chat_history(
    video_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get chat history for a specific video"""
    db = get_db()

    video = await _get_video_or_404(db, video_id, current_user["id"])

    cursor = db.chat_history.find(
        {"video_id": video["id"], "user_id": current_user["id"]}
    ).sort("created_at", 1)

    history = []
    async for doc in cursor:
        history.append(ChatHistoryItem(
            id=str(doc["_id"]),
            question=doc["question"],
            answer=doc["answer"],
            created_at=doc["created_at"],
        ))

    return ChatHistoryResponse(history=history, total=len(history))


@router.post("/export/{video_id}", response_model=ChatExportResponse)
async def export_chat(
    video_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Export chat history to Markdown"""
    db = get_db()

    video = await _get_video_or_404(db, video_id, current_user["id"])

    cursor = db.chat_history.find(
        {"video_id": video["id"], "user_id": current_user["id"]}
    ).sort("created_at", 1)

    # Build markdown
    md_content = f"# Chat Export - {video.get('title', video['video_id'])}\n\n"
    md_content += f"**Video URL:** {video['video_url']}\n"
    md_content += f"**Exported:** {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}\n\n"
    md_content += "---\n\n"

    async for msg in cursor:
        md_content += f"### 🧑 User\n{msg['question']}\n\n"
        md_content += f"### 🤖 Assistant\n{msg['answer']}\n\n"
        md_content += "---\n\n"

    filename = f"chat_export_{video['video_id']}_{datetime.utcnow().strftime('%Y%m%d')}.md"

    return ChatExportResponse(
        filename=filename,
        content=md_content,
    )


@router.delete("/history/{video_id}")
async def clear_chat_history(
    video_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Clear chat history for a video"""
    db = get_db()

    video = await _get_video_or_404(db, video_id, current_user["id"])

    await db.chat_history.delete_many(
        {"video_id": video["id"], "user_id": current_user["id"]}
    )

    return {"message": "Chat history cleared successfully"}
