from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

from app.database import get_db
from app.schemas.user import UserCreate, UserResponse, Token
from app.core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
    get_current_user,
)
from app.models.user import new_user_doc
from app.config import settings
from app.utils.validators import validate_password

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    """Register a new user"""

    # Validate password
    is_valid, message = validate_password(user.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        )

    db = get_db()

    # Check if user exists
    existing_user = await db.users.find_one(
        {"$or": [{"email": user.email}, {"username": user.username}]}
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered",
        )

    # Create new user
    hashed_password = get_password_hash(user.password)
    user_doc = new_user_doc(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
    )

    result = await db.users.insert_one(user_doc)
    user_doc["id"] = str(result.inserted_id)

    return UserResponse(
        id=user_doc["id"],
        email=user_doc["email"],
        username=user_doc["username"],
        is_active=user_doc["is_active"],
        created_at=user_doc["created_at"],
    )


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    """Login user and return JWT token"""

    db = get_db()
    user = await db.users.find_one({"email": form_data.username})

    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )

    user["id"] = str(user["_id"])

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(
            id=user["id"],
            email=user["email"],
            username=user["username"],
            is_active=user.get("is_active", True),
            created_at=user["created_at"],
        ),
    }


@router.get("/login")
async def login_get_info():
    """Inform clients that login must use POST."""
    return {
        "message": "Use POST /api/auth/login with form fields: username and password",
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user"""
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        username=current_user["username"],
        is_active=current_user.get("is_active", True),
        created_at=current_user["created_at"],
    )


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout user (client should discard the token)"""
    return {"message": "Successfully logged out"}
