"""
Chat document models for MongoDB.

Collection: chat_history
Document structure:
{
    "_id": ObjectId,
    "video_id": str (references videos._id),
    "user_id": str (references users._id),
    "session_id": str | None (references sessions._id),
    "question": str,
    "answer": str,
    "context": str | None,
    "created_at": datetime,
}

Collection: sessions
Document structure:
{
    "_id": ObjectId,
    "user_id": str (references users._id),
    "video_id": str (references videos._id),
    "session_name": str,
    "created_at": datetime,
    "updated_at": datetime,
}
"""
from datetime import datetime
from typing import Optional


def new_chat_history_doc(
    video_id: str,
    user_id: str,
    question: str,
    answer: str,
    context: Optional[str] = None,
    session_id: Optional[str] = None,
) -> dict:
    """Create a new chat history document dict for insertion"""
    return {
        "video_id": video_id,
        "user_id": user_id,
        "session_id": session_id,
        "question": question,
        "answer": answer,
        "context": context,
        "created_at": datetime.utcnow(),
    }


def new_session_doc(
    user_id: str,
    video_id: str,
    session_name: str,
) -> dict:
    """Create a new session document dict for insertion"""
    now = datetime.utcnow()
    return {
        "user_id": user_id,
        "video_id": video_id,
        "session_name": session_name,
        "created_at": now,
        "updated_at": now,
    }
