import React, { useState, useEffect } from 'react';

function BrokerCredentialsTab({ brokerCreds, setBrokerCreds }) {
  const [formData, setFormData] = useState({
    apiKey: '',
    apiSecret: '',
    totpKey: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  useEffect(() => {
    // Load existing credentials if available
    if (brokerCreds) {
      setFormData({
        apiKey: brokerCreds.api_key || '',
        apiSecret: '••••••••',
        totpKey: '••••••••'
      });
    }
  }, [brokerCreds]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch('/api/v1/auth/broker-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          api_key: formData.apiKey,
          api_secret: formData.apiSecret,
          totp_key: formData.totpKey
        })
      });

      if (response.ok) {
        const data = await response.json();
        setBrokerCreds(data);
        setMessage('✓ Broker credentials saved securely!');
        setMessageType('success');
        setFormData({
          apiKey: '',
          apiSecret: '',
          totpKey: ''
        });
      } else {
        setMessage('✗ Failed to save credentials');
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`✗ Error: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-section">
      <h3>🔐 Zerodha Broker Credentials</h3>
      
      {message && (
        <div className={message.startsWith('✓') ? 'success-message' : 'error-message'}>
          {message}
        </div>
      )}

      <div style={{
        padding: '15px',
        background: '#fff3cd',
        borderRadius: '4px',
        marginBottom: '20px'
      }}>
        <p style={{ margin: '0', fontWeight: 'bold' }}>⚠️ Security Notice</p>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
          Your credentials are encrypted using industry-standard Fernet encryption 
          and stored securely. They are never logged or displayed after submission.
        </p>
      </div>

      {brokerCreds && (
        <div style={{
          padding: '15px',
          background: '#d4edda',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>✓ Credentials Configured</p>
          <p style={{ margin: '0' }}>
            API Key: <code>{brokerCreds.api_key.substring(0, 5)}****</code>
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
            Last updated: {new Date(brokerCreds.created_at).toLocaleDateString()}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="apiKey">Zerodha API Key</label>
          <input
            type="text"
            id="apiKey"
            name="apiKey"
            value={formData.apiKey}
            onChange={handleChange}
            placeholder="Your Zerodha API key"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="apiSecret">
            API Secret 
            <button
              type="button"
              style={{
                marginLeft: '10px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#4285f4'
              }}
              onClick={() => setShowSecrets(!showSecrets)}
            >
              {showSecrets ? '👁️ Hide' : '👁️ Show'}
            </button>
          </label>
          <input
            type={showSecrets ? "text" : "password"}
            id="apiSecret"
            name="apiSecret"
            value={formData.apiSecret}
            onChange={handleChange}
            placeholder="Your Zerodha API secret"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="totpKey">TOTP Secret Key</label>
          <input
            type={showSecrets ? "text" : "password"}
            id="totpKey"
            name="totpKey"
            value={formData.totpKey}
            onChange={handleChange}
            placeholder="Your TOTP secret (for 2FA)"
            required
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading}
          style={{ marginTop: '20px' }}
        >
          {loading ? (
            <><span className="loading-spinner"></span> Saving...</>
          ) : (
            '💾 Save Credentials'
          )}
        </button>
      </form>

      <div style={{
        marginTop: '30px',
        padding: '15px',
        background: '#f9f9f9',
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>How to find your credentials:</p>
        <ol style={{ margin: '0', paddingLeft: '20px' }}>
          <li>Log in to <a href="https://kite.zerodha.com" target="_blank" rel="noopener noreferrer">Kite</a></li>
          <li>Go to Settings → API Console</li>
          <li>Copy your API Key and Secret</li>
          <li>For TOTP, use your authenticator app's backup codes</li>
        </ol>
      </div>
    </div>
  );
}

export default BrokerCredentialsTab;
