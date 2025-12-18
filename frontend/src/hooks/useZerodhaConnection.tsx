/**
 * Zerodha Broker Integration Helper
 * Usage in Settings Page
 */

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/lib/constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ZerodhaStatus {
  authenticated: boolean;
  user_id?: string;
  broker_name?: string;
  api_key?: string;
  expires_at?: string;
  message: string;
}

/**
 * Hook to manage Zerodha broker connection
 */
export function useZerodhaConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<ZerodhaStatus | null>(null);

  // Check connection status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  // Check for OAuth callback success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('zerodha_auth') === 'success') {
      setIsConnected(true);
      // Clear query params
      window.history.replaceState({}, '', window.location.pathname);
      // Show success toast
      console.log('Zerodha connected successfully!');
      // Re-check status
      checkStatus();
    }
    
    if (params.get('error') === 'zerodha_auth_failed') {
      const message = params.get('message') || 'Unknown error';
      console.error('Zerodha connection failed:', message);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const checkStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/v1/broker/zerodha/status`);
      const data: ZerodhaStatus = await response.json();
      
      setStatus(data);
      setIsConnected(data.authenticated);
    } catch (error) {
      console.error('Failed to check Zerodha status:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const connectZerodha = () => {
    // Redirect to Zerodha OAuth flow
    window.location.href = `${API_URL}/api/v1/broker/zerodha/login`;
  };

  const disconnectZerodha = async () => {
    // TODO: Implement disconnect logic (clear access token)
    console.log('Disconnect not yet implemented');
  };

  return {
    isConnected,
    isLoading,
    status,
    connectZerodha,
    disconnectZerodha,
    refreshStatus: checkStatus
  };
}

/**
 * Example Usage in Settings Page Component
 */
export function ZerodhaBrokerSetup() {
  const { isConnected, isLoading, status, connectZerodha, refreshStatus } = useZerodhaConnection();

  if (isLoading) {
    return (
      <div className="card">
        <div className="spinner"></div>
        <p className="text-gray-300">Checking Zerodha connection...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">Zerodha Kite Connect</h3>
      
      {isConnected ? (
        <div className="space-y-4">
          <div className="badge-success">
            ✓ Connected to Zerodha
          </div>
          
          {status && (
            <div className="text-sm space-y-1 text-gray-300">
              <p><strong className="text-white">API Key:</strong> {status.api_key}</p>
              <p><strong className="text-white">Status:</strong> {status.message}</p>
              {status.expires_at && (
                <p><strong className="text-white">Token Expires:</strong> {new Date(status.expires_at).toLocaleString()}</p>
              )}
            </div>
          )}
          
          <button 
            onClick={refreshStatus}
            className="btn-secondary"
          >
            Refresh Status
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-300">
            Connect your Zerodha account to enable live trading
          </p>
          
          <button 
            onClick={connectZerodha}
            className="btn-primary"
          >
            Connect Zerodha Account
          </button>
          
          <div className="text-xs text-gray-400">
            <p>You will be redirected to Zerodha Kite to authorize access.</p>
            <p>Make sure you have your Zerodha credentials ready.</p>
          </div>
        </div>
      )}
    </div>
  );
}
