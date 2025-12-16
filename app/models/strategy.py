"""
Strategy Model with Risk Management Support
"""
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base


class Strategy(Base):
    __tablename__ = "strategies"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    strategy_type = Column(String, nullable=False)  # STRADDLE, STRANGLE, IRON_CONDOR
    instrument = Column(String, nullable=False)  # NIFTY, BANKNIFTY, FINNIFTY
    
    # Strategy configuration (lot size, strikes, timing, etc.)
    config = Column(JSON, nullable=False)
    
    # Risk Management configuration (Lock & Trail logic)
    risk_management = Column(JSON, nullable=True, default=None)
    
    # Status and execution
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="strategies")
    
    def __repr__(self):
        return f"<Strategy {self.name} ({self.strategy_type})>"


# Risk Management JSON Structure (for reference):
# {
#   "mode": "NONE" | "LOCK" | "TRAIL" | "LOCK_AND_TRAIL",
#   "combined_premium_sl": 50,  # Percentage
#   "combined_premium_target": 100,  # Percentage
#   "individual_leg_sl": 100,  # Percentage (optional)
#   "lock_and_trail": {
#     "activation_level": 30,  # % profit to activate
#     "lock_profit": 20,  # % profit to lock
#     "trail_step": 10,  # % step for trailing
#     "trail_profit": 5  # % trailing distance
#   }
# }
