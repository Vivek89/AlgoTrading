"""
Marketplace endpoints for sharing and cloning strategies
"""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import JWTManager
from app.models import User, Strategy, SharedStrategy
from app.api.schemas import StrategyCreate, StrategyResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import secrets

router = APIRouter(prefix="/api/v1/marketplace", tags=["marketplace"])


class ShareStrategyRequest(BaseModel):
    """Request to share a strategy"""
    description: Optional[str] = None
    roi_percentage: Optional[int] = None
    max_drawdown: Optional[int] = None


class SharedStrategyResponse(BaseModel):
    """Shared strategy response"""
    id: str
    share_id: str
    name: str
    strategy_type: str
    config: dict
    description: Optional[str]
    author_name: str
    downloads: int
    views: int
    roi_percentage: Optional[int]
    max_drawdown: Optional[int]
    created_at: str


@router.post("/share/{strategy_id}")
async def share_strategy(
    strategy_id: str,
    share_request: ShareStrategyRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Share a strategy to the marketplace"""
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
    
    # Get the strategy
    strategy = db.query(Strategy).filter(
        Strategy.id == strategy_id,
        Strategy.user_id == user_id
    ).first()
    
    if not strategy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Strategy not found")
    
    # Check if already shared
    existing_share = db.query(SharedStrategy).filter(
        SharedStrategy.original_strategy_id == strategy_id
    ).first()
    
    if existing_share:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Strategy already shared. Share ID: " + existing_share.share_id
        )
    
    # Generate unique share ID
    share_id = secrets.token_urlsafe(8)
    
    # Create shared strategy
    shared_strategy = SharedStrategy(
        share_id=share_id,
        original_strategy_id=strategy.id,
        author_id=user_id,
        name=strategy.name,
        strategy_type=strategy.strategy_type,
        config=strategy.config,
        description=share_request.description,
        roi_percentage=share_request.roi_percentage,
        max_drawdown=share_request.max_drawdown,
        is_public=True,
        downloads=0,
        views=0
    )
    
    db.add(shared_strategy)
    db.commit()
    db.refresh(shared_strategy)
    
    return {
        "message": "Strategy shared successfully",
        "share_id": share_id,
        "share_url": f"/marketplace/{share_id}"
    }


@router.get("/", response_model=List[SharedStrategyResponse])
async def list_marketplace_strategies(
    sort: str = "downloads",
    db: Session = Depends(get_db)
):
    """List all shared strategies in the marketplace"""
    query = db.query(SharedStrategy).filter(SharedStrategy.is_public == True)
    
    if sort == "downloads":
        query = query.order_by(SharedStrategy.downloads.desc())
    elif sort == "views":
        query = query.order_by(SharedStrategy.views.desc())
    elif sort == "recent":
        query = query.order_by(SharedStrategy.created_at.desc())
    
    strategies = query.limit(50).all()
    
    result = []
    for strategy in strategies:
        author = db.query(User).filter(User.id == strategy.author_id).first()
        result.append(SharedStrategyResponse(
            id=strategy.id,
            share_id=strategy.share_id,
            name=strategy.name,
            strategy_type=strategy.strategy_type,
            config=strategy.config,
            description=strategy.description,
            author_name=author.full_name if author else "Unknown",
            downloads=strategy.downloads,
            views=strategy.views,
            roi_percentage=strategy.roi_percentage,
            max_drawdown=strategy.max_drawdown,
            created_at=strategy.created_at.isoformat()
        ))
    
    return result


@router.get("/{share_id}", response_model=SharedStrategyResponse)
async def get_shared_strategy(
    share_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific shared strategy"""
    strategy = db.query(SharedStrategy).filter(
        SharedStrategy.share_id == share_id,
        SharedStrategy.is_public == True
    ).first()
    
    if not strategy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shared strategy not found")
    
    # Increment view count
    strategy.views += 1
    db.commit()
    
    author = db.query(User).filter(User.id == strategy.author_id).first()
    
    return SharedStrategyResponse(
        id=strategy.id,
        share_id=strategy.share_id,
        name=strategy.name,
        strategy_type=strategy.strategy_type,
        config=strategy.config,
        description=strategy.description,
        author_name=author.full_name if author else "Unknown",
        downloads=strategy.downloads,
        views=strategy.views,
        roi_percentage=strategy.roi_percentage,
        max_drawdown=strategy.max_drawdown,
        created_at=strategy.created_at.isoformat()
    )


@router.post("/{share_id}/clone", response_model=StrategyResponse)
async def clone_strategy(
    share_id: str,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Clone a shared strategy to the current user's account"""
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
    
    # Get the shared strategy
    shared_strategy = db.query(SharedStrategy).filter(
        SharedStrategy.share_id == share_id,
        SharedStrategy.is_public == True
    ).first()
    
    if not shared_strategy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shared strategy not found")
    
    # Create a new strategy for the current user
    new_strategy = Strategy(
        user_id=user_id,
        name=f"{shared_strategy.name} (Cloned)",
        strategy_type=shared_strategy.strategy_type,
        config=shared_strategy.config,
        is_active=False
    )
    
    db.add(new_strategy)
    
    # Increment download count
    shared_strategy.downloads += 1
    
    db.commit()
    db.refresh(new_strategy)
    
    return StrategyResponse(
        id=new_strategy.id,
        name=new_strategy.name,
        strategy_type=new_strategy.strategy_type,
        config=new_strategy.config,
        is_active=new_strategy.is_active,
        created_at=new_strategy.created_at.isoformat()
    )
