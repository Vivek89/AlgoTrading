"""
Base Broker Interface (Abstract Base Class)
All broker integrations must implement this contract
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Optional
from datetime import datetime


class BaseBroker(ABC):
    """
    Abstract base class for all broker integrations.
    Ensures consistent interface across different brokers (Zerodha, AngelOne, etc.)
    """
    
    @abstractmethod
    async def authenticate(self, api_key: str, api_secret: str, request_token: str) -> Dict:
        """
        Authenticate with the broker and obtain access token
        
        Args:
            api_key: Broker API key
            api_secret: Broker API secret
            request_token: OAuth request token from broker callback
            
        Returns:
            Dict containing access_token and expiry information
        """
        pass
    
    @abstractmethod
    async def generate_login_url(self, api_key: str, redirect_uri: str) -> str:
        """
        Generate the broker's OAuth login URL
        
        Args:
            api_key: Broker API key
            redirect_uri: Callback URL after authentication
            
        Returns:
            Full OAuth login URL
        """
        pass
    
    @abstractmethod
    async def get_ltp(self, instruments: List[str]) -> Dict[str, float]:
        """
        Get Last Traded Price for instruments
        
        Args:
            instruments: List of instrument identifiers
            
        Returns:
            Dictionary mapping instrument to LTP
        """
        pass
    
    @abstractmethod
    async def place_order(
        self,
        symbol: str,
        side: str,
        quantity: int,
        order_type: str,
        product: str,
        price: Optional[float] = None
    ) -> Dict:
        """
        Place an order with the broker
        
        Args:
            symbol: Trading symbol
            side: "BUY" or "SELL"
            quantity: Number of shares/lots
            order_type: "MARKET", "LIMIT", etc.
            product: "MIS", "NRML", etc.
            price: Limit price (required for LIMIT orders)
            
        Returns:
            Order details including order_id
        """
        pass
    
    @abstractmethod
    async def get_positions(self) -> List[Dict]:
        """
        Get current positions
        
        Returns:
            List of position dictionaries
        """
        pass
    
    @abstractmethod
    async def get_orders(self) -> List[Dict]:
        """
        Get order history
        
        Returns:
            List of order dictionaries
        """
        pass
    
    @abstractmethod
    async def cancel_order(self, order_id: str) -> Dict:
        """
        Cancel a pending order
        
        Args:
            order_id: Order ID to cancel
            
        Returns:
            Cancellation status
        """
        pass
    
    @abstractmethod
    async def exit_all_positions(self) -> List[Dict]:
        """
        Emergency exit all open positions
        
        Returns:
            List of exit order details
        """
        pass
    
    @abstractmethod
    def is_authenticated(self) -> bool:
        """
        Check if broker is authenticated
        
        Returns:
            True if access token is valid
        """
        pass
