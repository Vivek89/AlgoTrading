"""
Strategy management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import JWTManager
from app.models import User, Strategy
from app.api.schemas import StrategyCreate, StrategyResponse
from typing import List
from datetime import datetime

router = APIRouter(prefix="/api/v1/strategies", tags=["strategies"])


@router.post("/", response_model=StrategyResponse)
async def create_strategy(
    strategy: StrategyCreate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Create a new trading strategy"""
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
    
    new_strategy = Strategy(
        user_id=user.id,
        name=strategy.name,
        strategy_type=strategy.strategy_type,
        config=strategy.config,
    )
    db.add(new_strategy)
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


@router.get("/", response_model=List[StrategyResponse])
async def list_strategies(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """List all strategies for the current user"""
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
    strategies = db.query(Strategy).filter(Strategy.user_id == user_id).all()
    
    return [
        StrategyResponse(
            id=s.id,
            name=s.name,
            strategy_type=s.strategy_type,
            config=s.config,
            is_active=s.is_active,
            created_at=s.created_at.isoformat()
        )
        for s in strategies
    ]


@router.get("/{strategy_id}", response_model=StrategyResponse)
async def get_strategy(
    strategy_id: str,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get a specific strategy"""
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
    strategy = db.query(Strategy).filter(
        Strategy.id == strategy_id,
        Strategy.user_id == user_id
    ).first()
    
    if not strategy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Strategy not found")
    
    return StrategyResponse(
        id=strategy.id,
        name=strategy.name,
        strategy_type=strategy.strategy_type,
        config=strategy.config,
        is_active=strategy.is_active,
        created_at=strategy.created_at.isoformat()
    )


@router.put("/{strategy_id}", response_model=StrategyResponse)
async def update_strategy(
    strategy_id: str,
    strategy_update: StrategyCreate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Update an existing strategy"""
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
    strategy = db.query(Strategy).filter(
        Strategy.id == strategy_id,
        Strategy.user_id == user_id
    ).first()
    
    if not strategy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Strategy not found")
    
    # Update fields
    strategy.name = strategy_update.name
    strategy.strategy_type = strategy_update.strategy_type
    strategy.config = strategy_update.config
    strategy.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(strategy)
    
    return StrategyResponse(
        id=strategy.id,
        name=strategy.name,
        strategy_type=strategy.strategy_type,
        config=strategy.config,
        is_active=strategy.is_active,
        created_at=strategy.created_at.isoformat()
    )


@router.delete("/{strategy_id}")
async def delete_strategy(
    strategy_id: str,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Delete a strategy"""
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
    strategy = db.query(Strategy).filter(
        Strategy.id == strategy_id,
        Strategy.user_id == user_id
    ).first()
    
    if not strategy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Strategy not found")
    
    db.delete(strategy)
    db.commit()
    
    return {"message": "Strategy deleted successfully"}
