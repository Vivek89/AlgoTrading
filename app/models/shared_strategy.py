"""
Shared strategy model for the marketplace
"""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base


class SharedStrategy(Base):
    """Publicly shared strategies for the marketplace"""
    __tablename__ = "shared_strategies"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    share_id = Column(String(100), unique=True, nullable=False, index=True)  # Public identifier
    original_strategy_id = Column(String(36), ForeignKey("strategies.id", ondelete="CASCADE"))
    author_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Snapshot of strategy at time of sharing
    name = Column(String(255), nullable=False)
    strategy_type = Column(String(100), nullable=False)
    config = Column(JSON, default={})
    description = Column(Text)
    
    # Marketplace metadata
    is_public = Column(Boolean, default=True)
    downloads = Column(Integer, default=0)
    views = Column(Integer, default=0)
    
    # Performance metrics (optional)
    roi_percentage = Column(Integer)  # User-reported ROI
    max_drawdown = Column(Integer)  # User-reported max drawdown
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    author = relationship("User", foreign_keys=[author_id])
    original_strategy = relationship("Strategy")
