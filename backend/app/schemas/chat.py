from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class ChatAsk(BaseModel):
    video_id: str
    question: str
    verbose: bool = False


class ChatAskWithMemory(BaseModel):
    video_id: str
    question: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    question: str
    context: Optional[List[str]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ChatWithMemoryResponse(BaseModel):
    answer: str
    question: str
    session_id: str
    created_at: datetime


class ChatHistoryItem(BaseModel):
    id: str
    question: str
    answer: str
    context: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ChatHistoryResponse(BaseModel):
    history: List[ChatHistoryItem]
    total: int


class ChatExportResponse(BaseModel):
    filename: str
    content: str
