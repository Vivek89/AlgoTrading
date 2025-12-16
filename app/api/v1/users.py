"""
User management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import JWTManager
from app.models import User
from app.api.schemas import UserResponse

router = APIRouter(prefix="/api/v1/users", tags=["users"])

class ThemeUpdateRequest(BaseModel):
    theme: str


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get current user info"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    
    token = authorization.split(" ")[1]
    payload = JWTManager.verify_token(token)
    
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        profile_picture_url=user.profile_picture_url,
        created_at=user.created_at.isoformat()
    )


@router.put("/me/theme")
async def update_theme_preference(
    request: ThemeUpdateRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Update user theme preference"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    
    token = authorization.split(" ")[1]
    payload = JWTManager.verify_token(token)
    
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Validate theme value
    if request.theme not in ['light', 'dark']:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid theme value")
    
    user.theme_preference = request.theme
    db.commit()
    
    return {"message": "Theme preference updated", "theme": request.theme}
