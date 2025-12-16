"""
Authentication endpoints (Google OAuth + Broker Credentials)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Header, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import datetime
import httpx
import jwt
import logging

from app.core.database import get_db
from app.core.config import settings
from app.core.security import JWTManager, EncryptionManager
from app.models import User, BrokerCredential
from app.api.schemas import (
    GoogleAuthRequest,
    BrokerCredentialInput,
    BrokerCredentialResponse,
    AuthResponse,
    UserResponse
)

# Set up logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def decode_id_token(id_token: str) -> dict:
    """
    Decode Google's JWT ID token without verification
    (verification is done by Google's token endpoint)
    """
    try:
        logger.debug("Attempting to decode ID token")
        # Decode without verification since we got it from Google's secure endpoint
        decoded = jwt.decode(id_token, options={"verify_signature": False})
        logger.debug(f"Successfully decoded ID token. User sub: {decoded.get('sub')}")
        return decoded
    except Exception as e:
        logger.error(f"Failed to decode ID token: {str(e)}", exc_info=True)
        raise ValueError(f"Invalid ID token: {str(e)}")


@router.get("/google")
async def google_auth():
    """
    Initiate Google OAuth flow - redirects to Google's authorization endpoint
    """
    logger.info("Google OAuth flow initiated")
    
    # Build Google's authorization URL
    auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid profile email",
        "access_type": "offline",
        "prompt": "consent",
    }
    
    # Build query string
    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
    redirect_url = f"{auth_url}?{query_string}"
    
    return RedirectResponse(url=redirect_url, status_code=302)


@router.get("/google/callback")
async def google_callback_get(code: str = Query(...), db: Session = Depends(get_db)):
    """
    Handle Google OAuth callback (GET) and redirect to dashboard
    """
    logger.info("=== Google OAuth Callback Started ===")
    logger.debug(f"Received authorization code: {code[:20]}...")
    
    try:
        # Exchange auth code for tokens
        logger.info("Exchanging authorization code for tokens")
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }
        
        logger.debug(f"Token endpoint URL: {token_url}")
        logger.debug(f"Redirect URI: {settings.GOOGLE_REDIRECT_URI}")
        
        async with httpx.AsyncClient() as client:
            logger.debug("Sending POST request to Google token endpoint")
            token_response = await client.post(token_url, data=token_data, timeout=10.0)
            
            if token_response.status_code != 200:
                error_text = token_response.text
                logger.error(f"Token exchange failed with status {token_response.status_code}: {error_text}")
                return RedirectResponse(
                    url=f"http://localhost:3000/login?error=Token exchange failed: {token_response.status_code}",
                    status_code=302
                )
            
            logger.debug(f"Token response status: {token_response.status_code}")
            tokens = token_response.json()
            logger.debug(f"Token keys received: {tokens.keys()}")
        
        # Extract ID token
        logger.info("Extracting ID token from response")
        id_token = tokens.get("id_token")
        if not id_token:
            logger.error("No ID token found in token response")
            return RedirectResponse(
                url="http://localhost:3000/login?error=No ID token received",
                status_code=302
            )
        
        logger.debug("ID token received, decoding...")
        # Decode ID token to get user info
        user_info = decode_id_token(id_token)
        logger.debug(f"User info keys: {user_info.keys()}")
        
        google_id = user_info.get("sub")
        email = user_info.get("email")
        full_name = user_info.get("name", "")
        picture = user_info.get("picture", "")
        
        logger.info(f"User info extracted - Google ID: {google_id}, Email: {email}, Name: {full_name}")
        
        # Find or create user
        logger.info(f"Looking up user with google_id: {google_id}")
        user = db.query(User).filter(User.google_id == google_id).first()
        
        if not user:
            logger.info(f"User not found, creating new user: {email}")
            user = User(
                google_id=google_id,
                email=email,
                full_name=full_name,
                profile_picture_url=picture,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"New user created with ID: {user.id}")
        else:
            logger.info(f"Existing user found with ID: {user.id}, updating profile")
            # Update user info if changed
            user.full_name = full_name
            user.profile_picture_url = picture
            db.commit()
            db.refresh(user)
            logger.info(f"User profile updated")
        
        # Create app tokens
        logger.info("Creating JWT tokens for user")
        access_token = JWTManager.create_access_token(
            data={"sub": str(user.id), "email": user.email}
        )
        refresh_token = JWTManager.create_refresh_token(str(user.id))
        logger.debug(f"Tokens created - Access token length: {len(access_token)}, Refresh token length: {len(refresh_token)}")
        
        # Redirect to login page with token in query
        redirect_url = f"http://localhost:3000/login?token={access_token}&refresh_token={refresh_token}"
        logger.info(f"Redirecting to login page with authentication tokens")
        logger.debug(f"Redirect URL: {redirect_url[:100]}...")
        
        response = RedirectResponse(url=redirect_url, status_code=302)
        # Also set secure cookies for redundancy
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,
            samesite="lax"
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite="lax"
        )
        logger.info("=== Google OAuth Callback Completed Successfully ===")
        return response
        
    except Exception as e:
        logger.error(f"=== Google OAuth Callback Failed ===")
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Error message: {str(e)}")
        logger.error("Full traceback:", exc_info=True)
        
        error_msg = str(e)
        return RedirectResponse(
            url=f"http://localhost:3000/login?error={error_msg}",
            status_code=302
        )


@router.post("/google/callback", response_model=AuthResponse)
async def google_callback_post(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Handle Google OAuth callback (POST) and return tokens as JSON
    """
    logger.info("=== Google OAuth Callback (POST) Started ===")
    logger.debug(f"Received authorization code: {request.code[:20]}...")
    
    try:
        # Exchange auth code for tokens
        logger.info("Exchanging authorization code for tokens")
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": request.code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }
        
        async with httpx.AsyncClient() as client:
            logger.debug("Sending POST request to Google token endpoint")
            token_response = await client.post(token_url, data=token_data, timeout=10.0)
            token_response.raise_for_status()
            tokens = token_response.json()
            logger.debug(f"Token keys received: {tokens.keys()}")
        
        # Extract and decode ID token
        logger.info("Extracting and decoding ID token")
        id_token = tokens.get("id_token")
        if not id_token:
            logger.error("No ID token found in token response")
            raise ValueError("No ID token received from Google")
        
        user_info = decode_id_token(id_token)
        
        google_id = user_info.get("sub")
        email = user_info.get("email")
        full_name = user_info.get("name", "")
        picture = user_info.get("picture", "")
        
        logger.info(f"User info extracted - Google ID: {google_id}, Email: {email}")
        
        # Find or create user
        logger.info(f"Looking up user with google_id: {google_id}")
        user = db.query(User).filter(User.google_id == google_id).first()
        
        if not user:
            logger.info(f"User not found, creating new user: {email}")
            user = User(
                google_id=google_id,
                email=email,
                full_name=full_name,
                profile_picture_url=picture,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"New user created with ID: {user.id}")
        else:
            logger.info(f"Existing user found with ID: {user.id}")
            # Update user info if changed
            user.full_name = full_name
            user.profile_picture_url = picture
            db.commit()
            db.refresh(user)
        
        # Create app tokens
        logger.info("Creating JWT tokens for user")
        access_token = JWTManager.create_access_token(
            data={"sub": str(user.id), "email": user.email}
        )
        refresh_token = JWTManager.create_refresh_token(str(user.id))
        logger.info("=== Google OAuth Callback (POST) Completed Successfully ===")
        
        return AuthResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse(
                id=user.id,
                email=user.email,
                full_name=user.full_name,
                profile_picture_url=user.profile_picture_url,
                created_at=user.created_at.isoformat()
            )
        )
    
    except Exception as e:
        logger.error(f"=== Google OAuth Callback (POST) Failed ===")
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Error message: {str(e)}")
        logger.error("Full traceback:", exc_info=True)
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )
    except Exception as e:
        # Redirect to login with error
        error_msg = str(e)
        return RedirectResponse(
            url=f"http://localhost:3000/login?error={error_msg}",
            status_code=302
        )


@router.post("/google/callback", response_model=AuthResponse)
async def google_callback(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Handle Google OAuth callback (POST) and return tokens as JSON
    """
    try:
        # Exchange auth code for ID token
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": request.code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }
        
        async with httpx.AsyncClient() as client:
            token_response = await client.post(token_url, data=token_data)
            token_response.raise_for_status()
            tokens = token_response.json()
        
        # Verify ID token and get user info
        id_token = tokens.get("id_token")
        user_info_url = "https://oauth2.googleapis.com/tokeninfo"
        
        async with httpx.AsyncClient() as client:
            user_info_response = await client.get(
                user_info_url,
                params={"id_token": id_token}
            )
            user_info_response.raise_for_status()
            user_info = user_info_response.json()
        
        google_id = user_info.get("sub")
        email = user_info.get("email")
        full_name = user_info.get("name")
        picture = user_info.get("picture")
        
        # Find or create user
        user = db.query(User).filter(User.google_id == google_id).first()
        if not user:
            user = User(
                google_id=google_id,
                email=email,
                full_name=full_name,
                profile_picture_url=picture,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Create tokens
        access_token = JWTManager.create_access_token(
            data={"sub": str(user.id), "email": user.email}
        )
        refresh_token = JWTManager.create_refresh_token(str(user.id))
        
        return AuthResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse(
                id=user.id,
                email=user.email,
                full_name=user.full_name,
                profile_picture_url=user.profile_picture_url,
                created_at=user.created_at.isoformat()
            )
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )


@router.post("/broker-credentials", response_model=BrokerCredentialResponse)
async def add_broker_credentials(
    credentials: BrokerCredentialInput,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """
    Store encrypted broker credentials for the current user
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    
    token = authorization.split(" ")[1]
    payload = JWTManager.verify_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if credentials already exist
    existing = db.query(BrokerCredential).filter(
        BrokerCredential.user_id == user.id
    ).first()
    
    # Encrypt sensitive data
    api_secret_encrypted = EncryptionManager.encrypt(credentials.api_secret)
    totp_key_encrypted = EncryptionManager.encrypt(credentials.totp_key)
    
    if existing:
        existing.api_key = credentials.api_key
        existing.api_secret_encrypted = api_secret_encrypted
        existing.totp_key_encrypted = totp_key_encrypted
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        broker_cred = existing
    else:
        broker_cred = BrokerCredential(
            user_id=user.id,
            api_key=credentials.api_key,
            api_secret_encrypted=api_secret_encrypted,
            totp_key_encrypted=totp_key_encrypted,
        )
        db.add(broker_cred)
        db.commit()
        db.refresh(broker_cred)
    
    return BrokerCredentialResponse(
        id=broker_cred.id,
        user_id=broker_cred.user_id,
        broker_name=broker_cred.broker_name,
        api_key=broker_cred.api_key,
        access_token_expires_at=broker_cred.access_token_expires_at.isoformat() if broker_cred.access_token_expires_at else None,
        created_at=broker_cred.created_at.isoformat()
    )


@router.get("/broker-credentials", response_model=BrokerCredentialResponse)
async def get_broker_credentials(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """
    Get broker credentials for the current user (no secrets returned)
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    
    token = authorization.split(" ")[1]
    payload = JWTManager.verify_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    user_id = payload.get("sub")
    broker_cred = db.query(BrokerCredential).filter(
        BrokerCredential.user_id == user_id
    ).first()
    
    if not broker_cred:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Broker credentials not found"
        )
    
    return BrokerCredentialResponse(
        id=broker_cred.id,
        user_id=broker_cred.user_id,
        broker_name=broker_cred.broker_name,
        api_key=broker_cred.api_key,
        access_token_expires_at=broker_cred.access_token_expires_at.isoformat() if broker_cred.access_token_expires_at else None,
        created_at=broker_cred.created_at.isoformat()
    )
