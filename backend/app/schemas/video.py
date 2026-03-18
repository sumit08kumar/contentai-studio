from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class VideoProcess(BaseModel):
    video_url: str
    chunk_size: int = 1000
    chunk_overlap: int = 200


class VideoResponse(BaseModel):
    id: str
    video_id: str
    video_url: str
    title: Optional[str] = None
    transcript_length: Optional[int] = None
    num_chunks: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class VideoListResponse(BaseModel):
    videos: List[VideoResponse]
    total: int


class VideoProcessResponse(BaseModel):
    video_id: str
    id: str
    title: Optional[str] = None
    transcript_length: int
    num_chunks: int
    message: str


class VideoSummaryResponse(BaseModel):
    video_id: str
    title: Optional[str] = None
    summary: str
