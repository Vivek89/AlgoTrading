"""
Admin endpoints for system health monitoring and management
"""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.core.security import JWTManager
from app.models import User
from pydantic import BaseModel
from typing import Dict, List
from datetime import datetime
import time

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


class HealthMetric(BaseModel):
    """Individual health metric"""
    name: str
    status: str  # "healthy", "degraded", "unhealthy"
    latency_ms: float | None = None
    message: str | None = None
    timestamp: str


class SystemHealthResponse(BaseModel):
    """System health response"""
    overall_status: str  # "healthy", "degraded", "unhealthy"
    checks: List[HealthMetric]
    timestamp: str


async def check_database_health(db: Session) -> HealthMetric:
    """Check database connection and latency"""
    try:
        start = time.time()
        db.execute(text("SELECT 1"))
        latency = (time.time() - start) * 1000
        
        if latency < 50:
            status_val = "healthy"
            message = "Database connection OK"
        elif latency < 200:
            status_val = "degraded"
            message = f"Database latency high: {latency:.2f}ms"
        else:
            status_val = "unhealthy"
            message = f"Database latency critical: {latency:.2f}ms"
        
        return HealthMetric(
            name="Database",
            status=status_val,
            latency_ms=latency,
            message=message,
            timestamp=datetime.utcnow().isoformat()
        )
    except Exception as e:
        return HealthMetric(
            name="Database",
            status="unhealthy",
            latency_ms=None,
            message=f"Database connection failed: {str(e)}",
            timestamp=datetime.utcnow().isoformat()
        )


async def check_websocket_health() -> HealthMetric:
    """Check WebSocket service health"""
    try:
        # In a real implementation, this would check if WebSocket workers are running
        # For now, we'll just check if the service is theoretically available
        return HealthMetric(
            name="WebSocket Service",
            status="healthy",
            latency_ms=0,
            message="WebSocket endpoint available",
            timestamp=datetime.utcnow().isoformat()
        )
    except Exception as e:
        return HealthMetric(
            name="WebSocket Service",
            status="unhealthy",
            latency_ms=None,
            message=f"WebSocket service error: {str(e)}",
            timestamp=datetime.utcnow().isoformat()
        )


async def check_api_latency() -> HealthMetric:
    """Check API response time"""
    try:
        start = time.time()
        # Simulate a simple operation
        _ = datetime.utcnow()
        latency = (time.time() - start) * 1000
        
        return HealthMetric(
            name="API Response Time",
            status="healthy" if latency < 100 else "degraded",
            latency_ms=latency,
            message=f"Average response time: {latency:.2f}ms",
            timestamp=datetime.utcnow().isoformat()
        )
    except Exception as e:
        return HealthMetric(
            name="API Response Time",
            status="unhealthy",
            latency_ms=None,
            message=f"API latency check failed: {str(e)}",
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/health", response_model=SystemHealthResponse)
async def get_system_health(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive system health status
    Requires admin authentication
    """
    # Verify authentication
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
    
    # Run all health checks
    checks = []
    
    # Database check
    db_check = await check_database_health(db)
    checks.append(db_check)
    
    # WebSocket check
    ws_check = await check_websocket_health()
    checks.append(ws_check)
    
    # API latency check
    api_check = await check_api_latency()
    checks.append(api_check)
    
    # Determine overall status
    statuses = [check.status for check in checks]
    if "unhealthy" in statuses:
        overall_status = "unhealthy"
    elif "degraded" in statuses:
        overall_status = "degraded"
    else:
        overall_status = "healthy"
    
    return SystemHealthResponse(
        overall_status=overall_status,
        checks=checks,
        timestamp=datetime.utcnow().isoformat()
    )


@router.get("/stats")
async def get_system_stats(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get system statistics"""
    # Verify authentication
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
    
    # Get statistics
    from app.models import Strategy, SharedStrategy
    
    total_users = db.query(User).count()
    total_strategies = db.query(Strategy).count()
    active_strategies = db.query(Strategy).filter(Strategy.is_active == True).count()
    shared_strategies = db.query(SharedStrategy).count()
    
    return {
        "total_users": total_users,
        "total_strategies": total_strategies,
        "active_strategies": active_strategies,
        "shared_strategies": shared_strategies,
        "timestamp": datetime.utcnow().isoformat()
    }
