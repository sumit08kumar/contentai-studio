"""
Video document model for MongoDB.

Collection: videos
Document structure:
{
    "_id": ObjectId,
    "user_id": str (references users._id),
    "video_id": str (YouTube video ID),
    "video_url": str,
    "title": str,
    "transcript_length": int,
    "num_chunks": int,
    "created_at": datetime,
}
"""
from datetime import datetime


def new_video_doc(
    user_id: str,
    video_id: str,
    video_url: str,
    title: str,
    transcript_length: int,
    num_chunks: int,
) -> dict:
    """Create a new video document dict for insertion"""
    return {
        "user_id": user_id,
        "video_id": video_id,
        "video_url": video_url,
        "title": title,
        "transcript_length": transcript_length,
        "num_chunks": num_chunks,
        "created_at": datetime.utcnow(),
    }
