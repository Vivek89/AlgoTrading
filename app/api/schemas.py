"""
Pydantic request/response schemas
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID


class GoogleAuthRequest(BaseModel):
    """Google OAuth authorization code"""
    code: str


class BrokerCredentialInput(BaseModel):
    """Input for broker credentials"""
    api_key: str
    api_secret: str
    totp_key: str


class BrokerCredentialResponse(BaseModel):
    """Response for broker credentials (no secrets)"""
    id: UUID
    user_id: UUID
    broker_name: str
    api_key: str
    access_token_expires_at: Optional[str]
    created_at: str


class StrategyCreate(BaseModel):
    """Create a new strategy"""
    name: str
    strategy_type: str
    config: dict = {}
    risk_management: Optional[dict] = None


class StrategyResponse(BaseModel):
    """Strategy response"""
    id: UUID
    name: str
    strategy_type: str
    config: dict
    risk_management: Optional[dict] = None
    is_active: bool
    created_at: str


class UserResponse(BaseModel):
    """User response"""
    id: UUID
    email: str
    full_name: Optional[str]
    profile_picture_url: Optional[str]
    created_at: str


class AuthResponse(BaseModel):
    """Authentication response"""
    access_token: str
    refresh_token: str
    user: UserResponse
    token_type: str = "bearer"
