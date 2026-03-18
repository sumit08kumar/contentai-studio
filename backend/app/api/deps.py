from fastapi import Depends, HTTPException

from app.core.security import get_current_user


async def get_current_active_user(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Dependency to get the current active user"""
    if not current_user.get("is_active", True):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
