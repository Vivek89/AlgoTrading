"""
SQLAlchemy models for the application
"""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, JSON, Text, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base
from app.models.shared_strategy import SharedStrategy


class User(Base):
    """User model linked to Google OAuth"""
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    google_id = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255))
    profile_picture_url = Column(Text)
    theme_preference = Column(String(10), default='dark')  # 'light' or 'dark'
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    broker_credentials = relationship("BrokerCredential", back_populates="user", cascade="all, delete-orphan")
    strategies = relationship("Strategy", back_populates="user", cascade="all, delete-orphan")
    trade_logs = relationship("TradeLog", back_populates="user", cascade="all, delete-orphan")
    suggestions = relationship("AdvisorSuggestion", back_populates="user", cascade="all, delete-orphan")


class BrokerCredential(Base):
    """Encrypted broker credentials for each user"""
    __tablename__ = "broker_credentials"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    broker_name = Column(String(50), default="zerodha")
    api_key = Column(String(255), nullable=False)
    api_secret_encrypted = Column(String(255), nullable=False)
    totp_key_encrypted = Column(String(255), nullable=False)
    access_token = Column(String(500))
    access_token_expires_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="broker_credentials")


class Strategy(Base):
    """User-defined trading strategies"""
    __tablename__ = "strategies"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    strategy_type = Column(String(100), nullable=False)  # e.g., "SHORT_STRADDLE", "IRON_CONDOR"
    config = Column(JSON, default={})  # Flexible configuration (SMA periods, stop loss, etc.)
    risk_management = Column(JSON, default=None)  # Risk management configuration (Lock & Trail logic)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="strategies")
    trade_logs = relationship("TradeLog", back_populates="strategy", cascade="all, delete-orphan")
    suggestions = relationship("AdvisorSuggestion", back_populates="strategy", cascade="all, delete-orphan")


class TradeLog(Base):
    """Audit trail for all trades executed"""
    __tablename__ = "trade_logs"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    strategy_id = Column(String(36), ForeignKey("strategies.id", ondelete="SET NULL"))
    order_id = Column(String(255))
    symbol = Column(String(20))
    side = Column(String(10))  # "BUY" or "SELL"
    quantity = Column(Integer)
    price = Column(Numeric(15, 2))
    executed_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="trade_logs")
    strategy = relationship("Strategy", back_populates="trade_logs")


class AdvisorSuggestion(Base):
    """Personalized recommendations from the advisor engine"""
    __tablename__ = "advisor_suggestions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    strategy_id = Column(String(36), ForeignKey("strategies.id", ondelete="CASCADE"))
    suggestion_text = Column(Text, nullable=False)
    market_regime = Column(String(100))  # e.g., "HIGH_IV", "LOW_VOLATILITY"
    suggested_action = Column(String(255))  # e.g., "SHIFT_TO_SHORT_STRADDLE"
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    approved_at = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship("User", back_populates="suggestions")
    strategy = relationship("Strategy", back_populates="suggestions")