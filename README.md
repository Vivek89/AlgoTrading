"# AlgoTrading - Multi-Tenant Algorithmic Trading Platform

A scalable, multi-tenant platform for algorithmic trading with integrated authentication, secure credential management, and personalized strategy optimization.

## 🎯 Features Implemented

### Phase 1: Multi-Layer Authentication & Security ✅

#### 1. **Platform Access (Google OAuth 2.0)**
- ✅ Secure user authentication via Google OAuth 2.0 (OpenID Connect)
- ✅ Automatic user creation and profile sync
- ✅ JWT-based session management (8-hour expiration)
- ✅ Refresh token support for extended sessions

#### 2. **Broker Access (Per-User Credentials)**
- ✅ Zerodha API credential storage
- ✅ **Application-level encryption** using Fernet cipher
- ✅ TOTP secret management for 2FA
- ✅ Secure credential retrieval without exposing secrets
- ✅ Multi-user isolation (no cross-tenant data leakage)

#### 3. **Security Best Practices**
- ✅ All sensitive data encrypted before database storage
- ✅ Row-level security queries (filter by user_id)
- ✅ CORS protection with configurable origins
- ✅ HTTPS-ready (proxy support)
- ✅ Environment-based configuration
- ✅ No secrets in version control

## 🏗️ Architecture

```
┌─────────────────┐
│   React UI      │
│ (Localhost:3000)│
└────────┬────────┘
         │ OAuth Code / API Requests
         ▼
┌──────────────────────────────┐
│   FastAPI Backend            │
│  (Localhost:8000)            │
│ ┌────────────────────────┐   │
│ │ Google Auth Service    │   │
│ │ Encryption Manager     │   │
│ │ JWT Manager            │   │
│ │ TOTP Manager           │   │
│ └────────────────────────┘   │
└────────┬─────────────────────┘
         │ SQL Queries
         ▼
┌──────────────────────────────┐
│   PostgreSQL Database        │
│  - users                     │
│  - broker_credentials        │
│  - strategies                │
│  - trade_logs                │
│  - advisor_suggestions       │
└──────────────────────────────┘
```

## 🚀 Quick Start

### Option 1: Automated Setup (Windows)
```bash
cd c:\workspace\AlgoTrading
setup.bat
```

### Option 2: Manual Setup with UV

**1. Backend Setup**
```bash
# Install UV (if not already installed)
pip install uv

# Create virtual environment with UV
uv venv venv
venv\Scripts\activate

# Install dependencies with UV
uv sync --all-extras

# Create database
psql -U postgres -c "CREATE DATABASE algotrading;"

# Import schema
psql -U algotrading -d algotrading -f ddl/schema.sql

# Start backend
uvicorn app.main:app --reload
```

**2. Frontend Setup**
```bash
cd frontend
npm install
npm start
```

### 3. Configure OAuth (Optional)
To enable real Google OAuth:
1. Create a Google Cloud project: https://console.cloud.google.com
2. Create OAuth 2.0 credentials (Web application)
3. Add redirect URI: `http://localhost:8000/api/v1/auth/google/callback`
4. Update `.env`:
   ```
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

## 📚 API Documentation

### Authentication Endpoints

**POST /api/v1/auth/google/callback**
- Exchange Google auth code for JWT tokens
- Response includes user profile and tokens

**POST /api/v1/auth/broker-credentials**
- Store encrypted Zerodha credentials
- Secrets encrypted with Fernet cipher

**GET /api/v1/auth/broker-credentials**
- Retrieve stored broker credentials (no secrets)

### Strategy Endpoints

**POST /api/v1/strategies/**
- Create new trading strategy

**GET /api/v1/strategies/**
- List all user strategies

**GET /api/v1/strategies/{strategy_id}**
- Get specific strategy details

### User Endpoints

**GET /api/v1/users/me**
- Get current user information

## 🔐 Security Features

### Encryption

```python
# Sensitive data encrypted with Fernet
from app.core.security import EncryptionManager

encrypted = EncryptionManager.encrypt("secret_value")
decrypted = EncryptionManager.decrypt(encrypted)
```

### JWT Tokens

```python
# Tokens contain user ID and email, expire after 8 hours
from app.core.security import JWTManager

token = JWTManager.create_access_token({"sub": user_id})
payload = JWTManager.verify_token(token)
```

### TOTP Generation

```python
# Generate time-based one-time passwords for 2FA
from app.core.security import TOTPManager

totp_code = TOTPManager.generate_totp(encrypted_secret)
```

## 📊 Database Schema

### users
- `id` (UUID): Primary key
- `google_id` (VARCHAR): Unique Google identifier
- `email` (VARCHAR): User email
- `full_name` (VARCHAR): User name
- `profile_picture_url` (TEXT): Google profile picture

### broker_credentials
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to users
- `api_key` (VARCHAR): Zerodha API key
- `api_secret_encrypted` (VARCHAR): Encrypted API secret
- `totp_key_encrypted` (VARCHAR): Encrypted TOTP secret
- `access_token` (VARCHAR): Current Zerodha access token

### strategies
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to users
- `name` (VARCHAR): Strategy name
- `strategy_type` (VARCHAR): Type (e.g., SHORT_STRADDLE)
- `config` (JSON): Strategy configuration
- `is_active` (BOOLEAN): Active status

### trade_logs
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to users
- `strategy_id` (UUID): Foreign key to strategies
- `symbol` (VARCHAR): Trading symbol
- `side` (VARCHAR): BUY/SELL
- `quantity` (INTEGER): Trade quantity
- `price` (NUMERIC): Execution price
- `executed_at` (TIMESTAMP): Execution time

### advisor_suggestions
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to users
- `strategy_id` (UUID): Foreign key to strategies
- `suggestion_text` (TEXT): Recommendation text
- `market_regime` (VARCHAR): Market condition
- `suggested_action` (VARCHAR): Suggested change
- `is_approved` (BOOLEAN): User approval status

## 🧪 Testing

### Local Testing (No Google OAuth Required)

1. Start backend: `uvicorn app.main:app --reload`
2. Start frontend: `npm start` (in frontend folder)
3. Click "✓ Simulate Login (Test Only)" button
4. Test broker credentials form
5. Test strategy creation

### API Testing

Use the interactive Swagger UI: `http://localhost:8000/docs`

### Database Testing

```bash
# Connect to database
psql -U algotrading -d algotrading

# Check users
SELECT * FROM users;

# Check encrypted credentials
SELECT user_id, api_key, api_secret_encrypted FROM broker_credentials;

# Verify multi-tenancy isolation
SELECT user_id, name FROM strategies;
```

## 🔧 Configuration

### Environment Variables

Create `.env` file (or copy from `.env.example`):

```env
# Database
DATABASE_URL=postgresql://algotrading:password@localhost:5432/algotrading

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback

# Encryption (min 32 chars)
ENCRYPTION_KEY=your-encryption-key-min-32-chars-long!!!!!

# JWT
SECRET_KEY=your-jwt-secret-key-min-32-chars-long!!!
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480

# CORS
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:8000"]

# App
APP_NAME=AlgoTrading
DEBUG=True
```

## 📁 Project Structure

```
AlgoTrading/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app
│   ├── api/
│   │   ├── deps.py            # Dependency injection
│   │   ├── schemas.py         # Pydantic models
│   │   └── v1/
│   │       ├── auth.py        # OAuth & credentials
│   │       ├── strategies.py  # Strategy management
│   │       └── users.py       # User endpoints
│   ├── core/
│   │   ├── config.py          # Settings
│   │   ├── database.py        # SQLAlchemy setup
│   │   └── security.py        # Encryption, JWT, TOTP
│   ├── models/
│   │   └── __init__.py        # SQLAlchemy models
│   ├── services/
│   ├── workers/               # Celery tasks
│   └── tests/
├── frontend/                   # React app
│   ├── src/
│   │   ├── App.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   └── Dashboard.js
│   │   └── components/
│   │       ├── BrokerCredentialsTab.js
│   │       └── StrategiesTab.js
│   └── package.json
├── ddl/
│   └── schema.sql             # Database schema
├── .env.example               # Config template
├── pyproject.toml                  # Project metadata & dependencies (UV)
├── docker-compose.yml
├── Dockerfile
├── SETUP_GUIDE.md            # Comprehensive setup guide
└── README.md                 # This file
```

## 📋 Key Files

### Security Implementation
- [app/core/security.py](app/core/security.py) - Encryption, JWT, TOTP
- [app/models/__init__.py](app/models/__init__.py) - SQLAlchemy models
- [ddl/schema.sql](ddl/schema.sql) - Database schema

### Authentication
- [app/api/v1/auth.py](app/api/v1/auth.py) - OAuth & credential endpoints
- [app/core/config.py](app/core/config.py) - Configuration management

### Frontend
- [frontend/src/pages/Dashboard.js](frontend/src/pages/Dashboard.js) - Main dashboard
- [frontend/src/components/BrokerCredentialsTab.js](frontend/src/components/BrokerCredentialsTab.js) - Credentials form

## 🚀 Next Phases

### Phase 2: Automated Token Management
- [ ] Implement Celery task for 09:00 AM IST token refresh
- [ ] Store and update access tokens automatically
- [ ] Implement token health checks

### Phase 3: Strategy Execution Engine
- [ ] Per-user strategy execution workers
- [ ] Real-time data via Zerodha Kite Ticker
- [ ] Order placement and tracking

### Phase 4: Advisor Engine
- [ ] Market regime analysis (VIX, IV Rank)
- [ ] Personalized recommendations
- [ ] Push notifications

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Test PostgreSQL
psql -U postgres -c "SELECT 1;"

# Check connection string in .env
DATABASE_URL=postgresql://user:password@localhost:5432/algotrading
```

### Module Import Errors
```bash
# Ensure you're in virtual environment
which python  # Should show venv path

# Reinstall dependencies
uv sync --all-extras --force
```

### CORS Errors
- Check `ALLOWED_ORIGINS` includes your frontend URL
- Frontend default: `http://localhost:3000`
- Backend default: `http://localhost:8000`

## 📖 Documentation

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Comprehensive setup and testing guide
- [prompt/project_plan.md](prompt/project_plan.md) - Original project requirements
- API Docs: `http://localhost:8000/docs` (when running)

## 📄 License

MIT License - See LICENSE file for details

## 👥 Support

For issues, questions, or contributions:
1. Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for troubleshooting
2. Review database schema: [ddl/schema.sql](ddl/schema.sql)
3. Check security implementation: [app/core/security.py](app/core/security.py)

