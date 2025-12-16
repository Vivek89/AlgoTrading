"""
WebSocket endpoints for real-time market data and order updates
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import JWTManager
import json
import asyncio
import random
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws", tags=["websocket"])


class ConnectionManager:
    """Manages WebSocket connections"""
    
    def __init__(self):
        self.active_connections: list[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Client connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"Client disconnected. Total connections: {len(self.active_connections)}")
    
    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to client: {e}")


manager = ConnectionManager()


async def generate_mock_ticks():
    """Generate mock market tick data for testing"""
    symbols = ["NIFTY", "BANKNIFTY", "FINNIFTY"]
    base_prices = {"NIFTY": 21500, "BANKNIFTY": 45000, "FINNIFTY": 19500}
    
    while True:
        for symbol in symbols:
            # Simulate price movement
            base_price = base_prices[symbol]
            change = random.uniform(-50, 50)
            new_price = base_price + change
            base_prices[symbol] = new_price
            
            change_percent = (change / base_price) * 100
            
            tick = {
                "type": "tick",
                "data": {
                    "symbol": symbol,
                    "ltp": round(new_price, 2),
                    "change": round(change, 2),
                    "changePercent": round(change_percent, 4),
                    "volume": random.randint(100000, 5000000),
                    "timestamp": datetime.utcnow().isoformat(),
                }
            }
            
            await manager.broadcast(tick)
        
        # Wait 1 second before next update
        await asyncio.sleep(1)


@router.websocket("/ticks")
async def websocket_ticks(websocket: WebSocket):
    """
    WebSocket endpoint for real-time market tick data
    
    Sends tick updates for all active instruments
    Message format:
    {
        "type": "tick",
        "data": {
            "symbol": "NIFTY",
            "ltp": 21500.50,
            "change": 25.50,
            "changePercent": 0.12,
            "volume": 1234567,
            "timestamp": "2025-12-16T10:30:00"
        }
    }
    """
    await manager.connect(websocket)
    
    try:
        # Send initial connection confirmation
        await websocket.send_json({
            "type": "connected",
            "message": "Connected to market data stream",
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Start background task to generate mock ticks
        tick_task = asyncio.create_task(generate_mock_ticks())
        
        # Keep connection alive and handle incoming messages
        while True:
            try:
                # Receive messages from client (e.g., subscribe/unsubscribe)
                data = await websocket.receive_text()
                message = json.loads(data)
                
                if message.get("type") == "ping":
                    await websocket.send_json({
                        "type": "pong",
                        "timestamp": datetime.utcnow().isoformat()
                    })
                elif message.get("type") == "subscribe":
                    # Handle subscription logic
                    symbols = message.get("symbols", [])
                    logger.info(f"Client subscribed to: {symbols}")
                    await websocket.send_json({
                        "type": "subscribed",
                        "symbols": symbols,
                        "timestamp": datetime.utcnow().isoformat()
                    })
                
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"Error in websocket loop: {e}")
                break
    
    finally:
        manager.disconnect(websocket)
        tick_task.cancel()


@router.websocket("/orders")
async def websocket_orders(websocket: WebSocket):
    """
    WebSocket endpoint for real-time order updates
    
    Sends order status updates
    Message format:
    {
        "type": "order",
        "data": {
            "orderId": "123",
            "strategyId": "456",
            "symbol": "NIFTY24000CE",
            "side": "BUY",
            "quantity": 50,
            "price": 150.50,
            "status": "COMPLETE",
            "timestamp": "2025-12-16T10:30:00"
        }
    }
    """
    await websocket.accept()
    
    try:
        # Send initial connection confirmation
        await websocket.send_json({
            "type": "connected",
            "message": "Connected to order update stream",
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Keep connection alive
        while True:
            data = await websocket.receive_text()
            # Echo back for now
            await websocket.send_text(f"Received: {data}")
    
    except WebSocketDisconnect:
        logger.info("Order WebSocket disconnected")


@router.websocket("/pnl")
async def websocket_pnl(websocket: WebSocket):
    """
    WebSocket endpoint for real-time P&L updates
    
    Sends strategy P&L updates
    Message format:
    {
        "type": "pnl",
        "data": {
            "strategyId": "456",
            "currentPnL": 2500.50,
            "totalPnL": 15000.00,
            "openPositions": 2,
            "timestamp": "2025-12-16T10:30:00"
        }
    }
    """
    await websocket.accept()
    
    try:
        # Send initial connection confirmation
        await websocket.send_json({
            "type": "connected",
            "message": "Connected to P&L stream",
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Generate mock P&L updates
        while True:
            # Simulate P&L changes
            pnl_update = {
                "type": "pnl",
                "data": {
                    "strategyId": "test-strategy-1",
                    "currentPnL": round(random.uniform(-1000, 5000), 2),
                    "totalPnL": round(random.uniform(0, 50000), 2),
                    "openPositions": random.randint(0, 5),
                    "timestamp": datetime.utcnow().isoformat()
                }
            }
            
            await websocket.send_json(pnl_update)
            await asyncio.sleep(2)  # Update every 2 seconds
    
    except WebSocketDisconnect:
        logger.info("P&L WebSocket disconnected")
