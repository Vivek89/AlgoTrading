import React, { useState, useEffect } from 'react';

function StrategiesTab({ strategies, setStrategies }) {
  const [formData, setFormData] = useState({
    name: '',
    strategyType: 'SHORT_STRADDLE',
    config: {}
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  const strategyTypes = [
    { value: 'SHORT_STRADDLE', label: 'Short Straddle' },
    { value: 'IRON_CONDOR', label: 'Iron Condor' },
    { value: 'LONG_CALL', label: 'Long Call' },
    { value: 'LONG_PUT', label: 'Long Put' },
    { value: 'BULL_CALL_SPREAD', label: 'Bull Call Spread' },
  ];

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/v1/strategies/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStrategies(data);
      }
    } catch (error) {
      console.error('Error fetching strategies:', error);
    }
  };

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
      
      const response = await fetch('/api/v1/strategies/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          strategy_type: formData.strategyType,
          config: formData.config
        })
      });

      if (response.ok) {
        const newStrategy = await response.json();
        setStrategies([...strategies, newStrategy]);
        setMessage('✓ Strategy created successfully!');
        setMessageType('success');
        setFormData({
          name: '',
          strategyType: 'SHORT_STRADDLE',
          config: {}
        });
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('✗ Failed to create strategy');
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
      <h3>📊 Trading Strategies</h3>

      {message && (
        <div className={message.startsWith('✓') ? 'success-message' : 'error-message'}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <h4>Create New Strategy</h4>

        <div className="form-group">
          <label htmlFor="name">Strategy Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Morning Short Straddle"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="strategyType">Strategy Type</label>
          <select
            id="strategyType"
            name="strategyType"
            value={formData.strategyType}
            onChange={handleChange}
          >
            {strategyTypes.map(st => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading}
        >
          {loading ? (
            <><span className="loading-spinner"></span> Creating...</>
          ) : (
            '➕ Create Strategy'
          )}
        </button>
      </form>

      <h4>Your Strategies</h4>
      {strategies.length === 0 ? (
        <p className="no-data">No strategies created yet. Create one above to get started!</p>
      ) : (
        <ul className="strategies-list">
          {strategies.map(strategy => (
            <li key={strategy.id} className="strategy-item">
              <h4>{strategy.name}</h4>
              <p><strong>Type:</strong> {strategy.strategy_type}</p>
              <p><strong>Status:</strong> {strategy.is_active ? '🟢 Active' : '🔴 Inactive'}</p>
              <p><strong>Created:</strong> {new Date(strategy.created_at).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default StrategiesTab;
