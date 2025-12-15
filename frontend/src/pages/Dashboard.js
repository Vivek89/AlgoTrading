import React, { useState, useEffect } from 'react';
import BrokerCredentialsTab from '../components/BrokerCredentialsTab';
import StrategiesTab from '../components/StrategiesTab';

function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('broker');
  const [brokerCreds, setBrokerCreds] = useState(null);
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial data
    setLoading(false);
  }, []); 

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">AlgoTrading Dashboard</h1>
        <div className="user-info">
          {user && (
            <>
              {user.profile_picture_url && (
                <img 
                  src={user.profile_picture_url} 
                  alt={user.full_name}
                  className="user-profile-pic"
                />
              )}
              <div>
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
                  {user.full_name || user.email}
                </p>
                <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                  {user.email}
                </p>
              </div>
            </>
          )}
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'broker' ? 'active' : ''}`}
          onClick={() => setActiveTab('broker')}
        >
          🔐 Broker Credentials
        </button>
        <button 
          className={`tab-btn ${activeTab === 'strategies' ? 'active' : ''}`}
          onClick={() => setActiveTab('strategies')}
        >
          📊 Trading Strategies
        </button>
        <button 
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'broker' && (
          <BrokerCredentialsTab 
            brokerCreds={brokerCreds}
            setBrokerCreds={setBrokerCreds}
          />
        )}
        {activeTab === 'strategies' && (
          <StrategiesTab 
            strategies={strategies}
            setStrategies={setStrategies}
          />
        )}
        {activeTab === 'settings' && (
          <div>
            <h3>Settings</h3>
            <p>Settings page coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
