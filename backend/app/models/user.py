"""
User document model for MongoDB.

Collection: users
Document structure:
{
    "_id": ObjectId,
    "email": str (unique),
    "username": str (unique),
    "hashed_password": str,
    "is_active": bool (default True),
    "created_at": datetime,
    "updated_at": datetime,
}
"""
from datetime import datetime


def new_user_doc(email: str, username: str, hashed_password: str) -> dict:
    """Create a new user document dict for insertion"""
    now = datetime.utcnow()
    return {
        "email": email,
        "username": username,
        "hashed_password": hashed_password,
        "is_active": True,
        "created_at": now,
        "updated_at": now,
    }
