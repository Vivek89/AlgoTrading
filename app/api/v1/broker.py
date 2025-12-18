"""
Broker OAuth and Integration Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import datetime
import logging

from app.core.database import get_db
from app.core.config import settings
from app.core.security import EncryptionManager
from app.models import User, BrokerCredential
from app.brokers.zerodha import ZerodhaBroker

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

router = APIRouter(prefix="/api/v1/broker", tags=["broker"])


@router.get("/zerodha/login")
async def zerodha_login():
    """
    Initiate Zerodha OAuth flow
    Redirects user to Kite Connect login page
    """
    logger.info("Zerodha OAuth flow initiated")
    
    # Build Zerodha login URL
    login_url = f"https://kite.zerodha.com/connect/login?api_key={settings.ZERODHA_API_KEY}&v=3"
    
    logger.info(f"Redirecting to Zerodha login: {login_url}")
    return RedirectResponse(url=login_url, status_code=302)


@router.get("/zerodha/callback")
async def zerodha_callback(
    request_token: str = Query(...),
    status_param: str = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    """
    Handle Zerodha OAuth callback
    Exchanges request_token for access_token and stores it
    
    Query params from Zerodha:
    - request_token: Used to generate access token
    - action: "login"
    - status: "success" or error message
    """
    logger.info("=== Zerodha OAuth Callback Started ===")
    logger.info(f"Request token received: {request_token[:20]}...")
    logger.info(f"Status: {status_param}")
    
    try:
        # Check if login was successful
        if status_param and status_param != "success":
            logger.error(f"Zerodha login failed with status: {status_param}")
            return RedirectResponse(
                url=f"http://localhost:3000/settings?error=zerodha_auth_failed&message={status_param}",
                status_code=302
            )
        
        # Initialize Zerodha broker
        broker = ZerodhaBroker(
            api_key=settings.ZERODHA_API_KEY,
            api_secret=settings.ZERODHA_API_SECRET
        )
        
        # Exchange request token for access token
        logger.info("Exchanging request_token for access_token")
        auth_data = await broker.authenticate(
            api_key=settings.ZERODHA_API_KEY,
            api_secret=settings.ZERODHA_API_SECRET,
            request_token=request_token
        )
        
        access_token = auth_data["access_token"]
        user_id = auth_data.get("user_id")
        expires_at = auth_data.get("expires_at")
        
        logger.info(f"Access token obtained successfully for user: {user_id}")
        
        # TODO: Associate with logged-in user (for now, store with a placeholder)
        # In production, you should get the user_id from the session/JWT
        # For testing purposes, we'll find or create a test user
        
        # Get the first user or create a test user
        test_user = db.query(User).first()
        
        if not test_user:
            logger.warning("No user found, creating test user")
            test_user = User(
                google_id="test_google_id",
                email="test@example.com",
                full_name="Test User"
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)
        
        # Update or create broker credentials with access token
        broker_cred = db.query(BrokerCredential).filter(
            BrokerCredential.user_id == test_user.id
        ).first()
        
        if broker_cred:
            logger.info(f"Updating existing broker credentials for user: {test_user.id}")
            broker_cred.access_token = access_token
            broker_cred.access_token_expires_at = datetime.fromisoformat(expires_at) if expires_at else None
            broker_cred.updated_at = datetime.utcnow()
        else:
            logger.info(f"Creating new broker credentials for user: {test_user.id}")
            # For testing, use encrypted dummy values for api_secret and totp
            dummy_secret = EncryptionManager.encrypt(settings.ZERODHA_API_SECRET)
            dummy_totp = EncryptionManager.encrypt("DUMMY_TOTP_KEY")
            
            broker_cred = BrokerCredential(
                user_id=test_user.id,
                broker_name="zerodha",
                api_key=settings.ZERODHA_API_KEY,
                api_secret_encrypted=dummy_secret,
                totp_key_encrypted=dummy_totp,
                access_token=access_token,
                access_token_expires_at=datetime.fromisoformat(expires_at) if expires_at else None
            )
            db.add(broker_cred)
        
        db.commit()
        db.refresh(broker_cred)
        
        logger.info("=== Zerodha OAuth Callback Completed Successfully ===")
        
        # Redirect back to frontend settings page with success
        return RedirectResponse(
            url="http://localhost:3000/settings?zerodha_auth=success",
            status_code=302
        )
        
    except Exception as e:
        logger.error(f"=== Zerodha OAuth Callback Failed ===")
        logger.error(f"Error: {str(e)}", exc_info=True)
        
        return RedirectResponse(
            url=f"http://localhost:3000/settings?error=zerodha_auth_failed&message={str(e)}",
            status_code=302
        )


@router.get("/zerodha/status")
async def zerodha_status(db: Session = Depends(get_db)):
    """
    Check Zerodha authentication status for current user
    For testing, checks the first user
    """
    try:
        # Get test user
        test_user = db.query(User).first()
        
        if not test_user:
            return {
                "authenticated": False,
                "message": "No user found"
            }
        
        # Check broker credentials
        broker_cred = db.query(BrokerCredential).filter(
            BrokerCredential.user_id == test_user.id
        ).first()
        
        if not broker_cred or not broker_cred.access_token:
            return {
                "authenticated": False,
                "message": "No Zerodha credentials found"
            }
        
        # Check if token is expired
        if broker_cred.access_token_expires_at:
            if datetime.utcnow() > broker_cred.access_token_expires_at:
                return {
                    "authenticated": False,
                    "message": "Access token expired",
                    "expires_at": broker_cred.access_token_expires_at.isoformat()
                }
        
        # Token is valid
        return {
            "authenticated": True,
            "user_id": test_user.id,
            "broker_name": broker_cred.broker_name,
            "api_key": broker_cred.api_key,
            "expires_at": broker_cred.access_token_expires_at.isoformat() if broker_cred.access_token_expires_at else None,
            "message": "Zerodha authenticated successfully"
        }
        
    except Exception as e:
        logger.error(f"Error checking Zerodha status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
