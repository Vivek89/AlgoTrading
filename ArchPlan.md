This is a comprehensive technical specification and architectural blueprint for a **Multi-Tenant SaaS Algorithmic Trading Platform**. This document assumes high-concurrency requirements and strict financial data isolation.

-----

# 1\. System Architecture (Multi-Tenant)

### A. High-Level Architectural Diagram

The system follows an **Event-Driven Microservices** pattern to decouple the web dashboard from the heavy lifting of trading execution.

1.  **Frontend (Next.js):** User interface for dashboards, config, and auth.
2.  **API Gateway / Load Balancer (AWS ALB):** Routes HTTP traffic and terminates SSL.
3.  **Core API Service (FastAPI):** Handles Google Auth, User Management, and Strategy Configuration (CRUD).
4.  **The "Market Nexus" (Data Service):** A specialized service that establishes a socket connection to Zerodha (Kite Ticker). It aggregates subscriptions for all active symbols across all users and pushes ticks to **Redis Pub/Sub**.
5.  **Strategy Workers (Celery/Boyer-Moore):** Stateless workers that subscribe to Redis. They evaluate User Strategy Configs against incoming market data.
6.  **Order Execution Service:** When a strategy triggers, this service pulls the specific User’s `access_token` and executes the order via the Kite Connect API.
7.  **The "Advisor" Engine:** A periodic background worker that analyzes macro-market data and pushes "Optimization Suggestions" to the DB.

### B. Database Schema (PostgreSQL + TimescaleDB)

We will use **PostgreSQL** for relational data and enable the **TimescaleDB** extension for storing historical market data and trade logs time-series.

**1. `users` Table**

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_id VARCHAR(255) UNIQUE NOT NULL, -- From OpenID Connect
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    subscription_tier VARCHAR(50) DEFAULT 'FREE', -- For SaaS limits
    created_at TIMESTAMP DEFAULT NOW()
);
```

**2. `broker_credentials` Table**
*Stores encrypted secrets. Never store plain text.*

```sql
CREATE TABLE broker_credentials (
    user_id UUID REFERENCES users(id),
    broker_name VARCHAR(50) DEFAULT 'ZERODHA',
    api_key VARCHAR(255),
    api_secret_encrypted TEXT, -- Fernet Encrypted
    totp_key_encrypted TEXT,   -- Fernet Encrypted
    access_token TEXT,         -- Generated daily, volatile
    token_date DATE,           -- To check if token is fresh for today
    is_active BOOLEAN DEFAULT FALSE
);
```

**3. `strategies` Table (JSON Config)**

```sql
CREATE TABLE strategies (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'STOPPED', -- RUNNING, STOPPED, PAUSED
    config JSONB NOT NULL,
    -- Example Config: {"instrument": "NIFTY", "type": "straddle", "entry_time": "09:20", "stop_loss_pct": 20}
    created_at TIMESTAMP DEFAULT NOW()
);
```

**4. `optimization_suggestions` (The Advisor)**

```sql
CREATE TABLE optimization_suggestions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    strategy_id UUID REFERENCES strategies(id),
    market_regime VARCHAR(50), -- e.g., "HIGH_IV_EXPANSION"
    suggestion_text TEXT,
    suggested_config_changes JSONB, -- The proposed new params
    status VARCHAR(20) DEFAULT 'PENDING' -- PENDING, APPLIED, REJECTED
);
```

### C. Concurrency: Handling the "Morning Rush"

When 100+ users need to login at 09:00 AM:

1.  **Scheduled Task:** A Cron job triggers at 08:55 AM IST.
2.  **Batching:** The system fetches all active users and pushes `login_task` to a Redis Queue.
3.  **Rate Limiting:** The Celery workers consume these tasks. We must enforce a global rate limit (e.g., 5 logins per second) to prevent the broker from flagging our server IP as a DDoS source, although Zerodha limits are usually per-app.
4.  **TOTP Generation:** The worker decrypts the stored `totp_key`, generates the 6-digit code using `pyotp`, sends the login request, and saves the resulting `access_token` to the DB.

-----

# 2\. Technology Stack Selection

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Backend Framework** | **FastAPI (Python)** | High-performance, async support (crucial for non-blocking I/O), and auto-generation of OpenAPI docs. |
| **Auth Provider** | **Google OAuth 2.0** | Managed via `authlib`. Standard OpenID Connect flow. Simplifies user onboarding. |
| **Database** | **PostgreSQL 15+** | Robust, supports JSONB for strategy configs. |
| **Secret Encryption** | **Fernet (Cryptography)** | Symmetric encryption. The encryption key is injected via AWS Parameter Store (Secret Manager) as an ENV variable. |
| **Task Queue** | **Celery + Redis** | Industry standard for Python background tasks. Redis acts as the Broker and the Cache. |
| **Market Data** | **Redis Pub/Sub** | For broadcasting tick data from the "Connector" to "Strategy Workers". |
| **Frontend** | **Next.js (React)** | Server-side rendering for SEO (marketing pages) and React for the dynamic dashboard. |
| **Infrastructure** | **AWS (Dockerized)** | ECS Fargate for container orchestration. |

-----

# 3\. Module-Level Technical Specifications

### A. The "Connector" Module (Auth Engine)

  * **Responsibility:** Securely managing credentials and session tokens.
  * **Workflow:**
    1.  **Encryption:** When a user enters their API Secret/TOTP on the frontend, the backend immediately encrypts it using `Fernet(KEY).encrypt(data)` before saving to DB.
    2.  **Daily Login:**
        ```python
        # Pseudo-code for Celery Task
        @app.task
        def perform_broker_login(user_id):
            creds = get_decrypted_creds(user_id)
            totp = pyotp.TOTP(creds['totp_key']).now()
            kite = KiteConnect(api_key=creds['api_key'])
            data = kite.generate_session(request_token=..., api_secret=creds['secret'])
            update_db_token(user_id, data['access_token'])
        ```

### B. The Strategy Sandbox (Configuration-Based)

  * **Security:** Users **never** write Python code. They select parameters via a UI Form.
  * **JSON Structure:**
    ```json
    {
      "strategy_type": "iron_fly",
      "leg_selection": "atm",
      "hedge_distance": 200,
      "exit_conditions": {
        "profit_target_mtm": 5000,
        "stop_loss_mtm": -2000,
        "time_exit": "15:15"
      }
    }
    ```
  * **Execution Logic:** The Strategy Worker loads a Python Class based on `strategy_type` and injects the parameters. This prevents Remote Code Execution (RCE) attacks.

### C. The Advisor Engine (Intelligent Optimizer)

  * **Data Source:** Independent of user accounts. The platform maintains its own "Master" data feed to calculate VIX, IV Rank, and PCR (Put Call Ratio).
  * **Logic:**
      * *Rule 1:* If `India VIX` \> 24 AND `User Strategy` == "Short Straddle" -\> **Trigger Alert**: "High Risk. Suggest shifting to Iron Fly (Hedged)."
      * *Rule 2:* If `Market Trend` == "Strong Up" (ADX \> 25) AND `User Strategy` == "Bear Call Spread" -\> **Trigger Alert**: "Trend Misalignment."
  * **Delivery:** The suggestion is saved to the DB. The Frontend polls this table. If the user clicks "Approve," the system patches the `strategies` JSON config automatically.

-----

# 4\. AWS Deployment Plan

### A. Compute & Scalability

  * **AWS ECS (Fargate):** We will deploy the application as Docker containers.
      * *Service A (API):* Auto-scales based on CPU/Memory (User traffic).
      * *Service B (Workers):* Auto-scales based on **Redis Queue Depth**. If the market moves fast and the execution queue fills up, AWS spins up more workers instantly.

### B. Security & Isolation

  * **VPC Design:**
      * **Public Subnet:** Load Balancer (ALB) and NAT Gateway.
      * **Private Subnet:** API Containers, Celery Workers, RDS Database. (No direct internet access to DB).
  * **Data Isolation:**
      * Use **Row Level Security (RLS)** in PostgreSQL as an extra layer of defense. Ensure every SQL query includes `WHERE user_id = current_user`.

-----

# 5\. Development Roadmap

### Phase 1: Foundation & Auth (Weeks 1-3)

  * Setup FastAPI project structure.
  * Implement Google OAuth 2.0 flow (`authlib`).
  * Design PostgreSQL Schema (Users, Credentials).
  * Implement Encryption utility (Fernet) for storing API secrets.

### Phase 2: The Connector & Broker Integration (Weeks 4-6)

  * Build the "Morning Login" scheduler (Celery + Beats).
  * Implement TOTP generation logic.
  * Create manual trigger API to test Broker Login per user.
  * Handle Zerodha API error mapping (Token Exception, Network Exception).

### Phase 3: Strategy Engine Core (Weeks 7-10)

  * Design the JSON Schema for strategies (Straddle, Strangle, Directional).
  * Build the "Market Nexus" (Data fetcher) to push Ticks to Redis.
  * Implement the Strategy Worker: Read Redis Tick -\> Check JSON Config -\> Place Order.

### Phase 4: The Advisor & Frontend (Weeks 11-14)

  * Build the Advisor logic (Market Regime detection).
  * Develop the Next.js Dashboard.
  * **Backtesting:** Implement a simulation mode where the engine runs on historical data (TimescaleDB) instead of live ticks.

-----

# 6\. Risk Management & Compliance

### A. Rate Limiting (Crucial)

Zerodha allows approx 3 requests/sec.

  * **User Level:** Use Redis to implement a "Token Bucket" algorithm for every user. If User A generates 10 orders in 1 second, queue them and throttle execution.
  * **Global Level:** If the platform uses a single IP, we use AWS NAT Gateway with Elastic IP. If we hit limits, we may need a pool of NAT Gateways (Rotation), though usually, Broker limits are per `api_key`.

### B. Cross-Tenant Data Leakage

  * **Strict Logic:** The `order_placement` function requires `user_id` as a mandatory argument.
  * **Audit Logs:** Every trade execution is logged to an immutable `audit_log` table with `timestamp`, `user_id`, `strategy_id`, and `order_id`.

### C. Kill Switch

  * Admin Dashboard must have a **Global Kill Switch**. In case of a bug in the strategy algorithm, the Admin can send a command to cancel all open orders and exit positions for ALL users immediately.

-----

### Next Step

I can draft the **FastAPI Python code for the "Morning Login" Celery task**, including the encryption/decryption logic for the TOTP keys. Would you like to start there?
