"""
Security utilities for encryption, JWT, and TOTP
"""
from cryptography.fernet import Fernet
from datetime import datetime, timedelta
from typing import Optional
import jwt
import pyotp
from app.core.config import settings

# Initialize Fernet cipher
cipher = Fernet(settings.ENCRYPTION_KEY.encode())


class EncryptionManager:
    """Handles encryption/decryption of sensitive data"""
    
    @staticmethod
    def encrypt(plain_text: str) -> str:
        """Encrypt a string"""
        return cipher.encrypt(plain_text.encode()).decode()
    
    @staticmethod
    def decrypt(encrypted_text: str) -> str:
        """Decrypt an encrypted string"""
        return cipher.decrypt(encrypted_text.encode()).decode()


class TOTPManager:
    """Handles TOTP generation for Zerodha 2FA"""
    
    @staticmethod
    def generate_totp(encrypted_secret: str) -> str:
        """Generate current TOTP code from encrypted secret"""
        secret = EncryptionManager.decrypt(encrypted_secret)
        totp = pyotp.TOTP(secret)
        return totp.now()
    
    @staticmethod
    def verify_totp(encrypted_secret: str, code: str) -> bool:
        """Verify a TOTP code"""
        secret = EncryptionManager.decrypt(encrypted_secret)
        totp = pyotp.TOTP(secret)
        return totp.verify(code)


class JWTManager:
    """Handles JWT token generation and validation"""
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Optional[dict]:
        """Verify and decode a JWT token"""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except jwt.InvalidTokenError:
            return None
    
    @staticmethod
    def create_refresh_token(user_id: str) -> str:
        """Create a refresh token"""
        return JWTManager.create_access_token(
            data={"sub": user_id, "type": "refresh"},
            expires_delta=timedelta(days=7)
        )
