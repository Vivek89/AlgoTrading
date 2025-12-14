import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ setIsAuthenticated, setUser }) {
  const navigate = useNavigate();
  const [brokerCredentials, setBrokerCredentials] = useState({
    apiKey: '',
    apiSecret: '',
    totpKey: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth using actual credentials
    const clientId = '84358406942-ljh2ng640j1ttum03qh0dpiu2plgbnnf.apps.googleusercontent.com';
    const redirectUri = 'http://localhost:8000/api/v1/auth/google/callback';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid email profile&access_type=offline`;
    
    // Store the intended redirect location
    sessionStorage.setItem('oauth_redirect_pending', 'true');
    window.location.href = authUrl;
  };

  const handleSimulateLogin = async () => {
    // Simulate authentication for testing purposes
    setLoading(true);
    setError('');

    try {
      // Simulate a user token
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      localStorage.setItem('access_token', mockToken);
      localStorage.setItem('refresh_token', mockToken);
      
      setIsAuthenticated(true);
      setUser({
        id: '123456',
        email: 'test@example.com',
        full_name: 'Test User',
        profile_picture_url: null
      });
      
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBrokerCredentialsChange = (e) => {
    const { name, value } = e.target;
    setBrokerCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBrokerCredentialsSubmit = async (e) => {
    e.preventDefault();
    // This would be used after Google OAuth is successful
    console.log('Broker credentials:', brokerCredentials);
  };

  return (
    <div className="login-container">
      <h1 className="login-title">AlgoTrading</h1>
      <div className="login-form">
        {error && <div className="error-message">{error}</div>}
        
        <h3>Step 1: Authenticate with Google</h3>
        <button 
          className="google-auth-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          🔐 Sign in with Google
        </button>

        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <p>OR</p>
        </div>

        <button 
          className="submit-btn"
          onClick={handleSimulateLogin}
          disabled={loading}
        >
          {loading ? 'Logging in...' : '✓ Simulate Login (Test Only)'}
        </button>

        <div style={{ 
          padding: '15px', 
          background: '#e8f4f8', 
          borderRadius: '4px',
          marginTop: '20px'
        }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Demo Credentials (Local Testing):</p>
          <p style={{ margin: '5px 0' }}>📧 Email: test@example.com</p>
          <p style={{ margin: '5px 0' }}>🔑 API Key: demo_api_key_12345</p>
          <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>Click "Simulate Login" to proceed</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
