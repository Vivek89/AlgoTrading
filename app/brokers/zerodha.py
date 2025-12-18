"""
Zerodha Kite Connect Broker Implementation
"""
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from kiteconnect import KiteConnect
import logging

from app.brokers import BaseBroker

logger = logging.getLogger(__name__)


class ZerodhaBroker(BaseBroker):
    """
    Zerodha Kite Connect implementation of BaseBroker
    """
    
    def __init__(self, api_key: str, api_secret: str = None, access_token: str = None):
        """
        Initialize Zerodha broker instance
        
        Args:
            api_key: Zerodha API Key
            api_secret: Zerodha API Secret (needed for authentication)
            access_token: Existing access token (if already authenticated)
        """
        self.api_key = api_key
        self.api_secret = api_secret
        self.kite = KiteConnect(api_key=api_key)
        
        if access_token:
            self.kite.set_access_token(access_token)
            self.access_token = access_token
            self.token_expiry = None  # Zerodha tokens expire at end of trading day
        else:
            self.access_token = None
            self.token_expiry = None
    
    async def generate_login_url(self, api_key: str, redirect_uri: str) -> str:
        """
        Generate Zerodha login URL
        """
        return f"https://kite.zerodha.com/connect/login?api_key={api_key}&v=3"
    
    async def authenticate(self, api_key: str, api_secret: str, request_token: str) -> Dict:
        """
        Exchange request token for access token
        """
        try:
            logger.info(f"Authenticating with Zerodha - API Key: {api_key[:10]}...")
            
            # Generate session
            data = self.kite.generate_session(request_token, api_secret=api_secret)
            
            self.access_token = data["access_token"]
            self.kite.set_access_token(self.access_token)
            
            # Zerodha tokens expire at end of trading day (around 3:30 AM IST next day)
            # Setting a conservative 6-hour expiry
            self.token_expiry = datetime.utcnow() + timedelta(hours=6)
            
            logger.info("Zerodha authentication successful")
            
            return {
                "access_token": self.access_token,
                "user_id": data.get("user_id"),
                "user_name": data.get("user_name"),
                "expires_at": self.token_expiry.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Zerodha authentication failed: {str(e)}")
            raise Exception(f"Zerodha authentication failed: {str(e)}")
    
    async def get_ltp(self, instruments: List[str]) -> Dict[str, float]:
        """
        Get Last Traded Price for instruments
        
        Args:
            instruments: List of instruments in format "EXCHANGE:SYMBOL"
                        e.g., ["NSE:NIFTY 50", "NFO:NIFTY24000CE"]
        """
        try:
            ltp_data = self.kite.ltp(instruments)
            
            # Extract LTP values
            result = {}
            for instrument in instruments:
                if instrument in ltp_data:
                    result[instrument] = ltp_data[instrument]["last_price"]
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to get LTP: {str(e)}")
            raise
    
    async def place_order(
        self,
        symbol: str,
        side: str,
        quantity: int,
        order_type: str = "MARKET",
        product: str = "MIS",
        price: Optional[float] = None,
        exchange: str = "NFO"
    ) -> Dict:
        """
        Place order with Zerodha
        
        Args:
            symbol: Trading symbol (e.g., "NIFTY24000CE")
            side: "BUY" or "SELL"
            quantity: Lot size
            order_type: "MARKET" or "LIMIT"
            product: "MIS" (Intraday) or "NRML" (Normal)
            price: Limit price (required for LIMIT orders)
            exchange: "NFO", "NSE", "BSE"
        """
        try:
            order_params = {
                "exchange": exchange,
                "tradingsymbol": symbol,
                "transaction_type": side,
                "quantity": quantity,
                "order_type": order_type,
                "product": product,
                "variety": "regular"
            }
            
            if order_type == "LIMIT" and price:
                order_params["price"] = price
            
            logger.info(f"Placing {side} order: {symbol} x {quantity}")
            order_id = self.kite.place_order(**order_params)
            
            logger.info(f"Order placed successfully - Order ID: {order_id}")
            
            return {
                "order_id": order_id,
                "symbol": symbol,
                "side": side,
                "quantity": quantity,
                "status": "SUCCESS"
            }
            
        except Exception as e:
            logger.error(f"Failed to place order: {str(e)}")
            raise
    
    async def get_positions(self) -> List[Dict]:
        """
        Get current positions
        """
        try:
            positions = self.kite.positions()
            return positions.get("net", [])
        except Exception as e:
            logger.error(f"Failed to get positions: {str(e)}")
            raise
    
    async def get_orders(self) -> List[Dict]:
        """
        Get order history
        """
        try:
            orders = self.kite.orders()
            return orders
        except Exception as e:
            logger.error(f"Failed to get orders: {str(e)}")
            raise
    
    async def cancel_order(self, order_id: str) -> Dict:
        """
        Cancel a pending order
        """
        try:
            result = self.kite.cancel_order(variety="regular", order_id=order_id)
            return {"order_id": order_id, "status": "CANCELLED"}
        except Exception as e:
            logger.error(f"Failed to cancel order: {str(e)}")
            raise
    
    async def exit_all_positions(self) -> List[Dict]:
        """
        Emergency exit all open positions
        """
        try:
            positions = await self.get_positions()
            exit_orders = []
            
            for position in positions:
                if position["quantity"] != 0:
                    # Determine side (opposite of current position)
                    side = "SELL" if position["quantity"] > 0 else "BUY"
                    qty = abs(position["quantity"])
                    
                    # Place market order to exit
                    order = await self.place_order(
                        symbol=position["tradingsymbol"],
                        side=side,
                        quantity=qty,
                        order_type="MARKET",
                        product=position["product"],
                        exchange=position["exchange"]
                    )
                    exit_orders.append(order)
            
            return exit_orders
            
        except Exception as e:
            logger.error(f"Failed to exit positions: {str(e)}")
            raise
    
    def is_authenticated(self) -> bool:
        """
        Check if broker is authenticated with valid token
        """
        if not self.access_token:
            return False
        
        if self.token_expiry and datetime.utcnow() > self.token_expiry:
            return False
        
        return True
    
    async def get_profile(self) -> Dict:
        """
        Get user profile information
        """
        try:
            profile = self.kite.profile()
            return profile
        except Exception as e:
            logger.error(f"Failed to get profile: {str(e)}")
            raise
    
    async def get_instruments(self, exchange: str = "NFO") -> List[Dict]:
        """
        Get list of instruments for an exchange
        """
        try:
            instruments = self.kite.instruments(exchange)
            return instruments
        except Exception as e:
            logger.error(f"Failed to get instruments: {str(e)}")
            raise
