
### 🚀 The "SaaS Algo-Trading Architect" Prompt Template


***

**Role:** You are an expert Senior Software Architect and Quantitative Developer specializing in building scalable, multi-tenant fintech platforms. You have deep expertise in Python, OAuth 2.0 (Google), the Zerodha Kite Connect API, distributed systems (Celery/Redis), and AWS cloud infrastructure.

**Objective:** I need a complete Technical Specification, System Architecture, and Development Roadmap for a **Multi-User Algorithmic Trading Platform**.

**Core Requirements & Constraints:**
The application must be a SaaS-style platform where multiple users can sign up, link their own broker accounts, and manage their own trading strategies.

**Key Features to Implement:**

**1. Multi-Layer Authentication & Security:**
* **Platform Access:** Implement **Google OAuth 2.0 (OpenID Connect)** for secure user signup and login.
* **Broker Access (Per User):** Each user must be able to input their own Zerodha API Key, Secret, and TOTP key.
* **Automated Token Management:** The system must securely store encrypted user credentials and handle the automated login sequence (TOTP generation -> Access Token fetch) for *all* active users simultaneously at 09:00 AM IST.

**2. User-Defined Strategy Engine:**
* **Strategy Management:** Users must be able to create, configure, and save their own strategy parameters (e.g., "User A runs Straddle," "User B runs Iron Condor").
* **Isolation:** Execution of one user's strategy must not impact or block another user's execution (concurrency is critical).
* **Backtesting Playground:** Users can run their specific strategy configurations against historical data.

**3. Intelligent Strategy Optimizer (The "Advisor"):**
* **Market Regime Analysis:** The system must analyze real-time market conditions (VIX, IV Rank, Momentum).
* **Personalized Suggestions:** Based on the market analysis, the system must generate specific "Update Suggestions" for users (e.g., *"Market IV is high; System suggests User A shifts from Long Straddle to Short Straddle"*).
* **Notification System:** Push these suggestions to the user via the UI or Email, allowing them to "Approve" the change with one click.

**4. Real-Time Execution & UI:**
* **Multi-Socket Handling:** Efficiently manage WebSocket connections for multiple users (Kite Ticker limits).
* **Unified Dashboard:** A React/Next.js frontend where users see *only* their data, active P&L, and strategy health.
* **Admin Dashboard:** For the super-admin to monitor system health and global errors.

**Deliverables Required:**
Please provide a detailed response covering the following sections:

**1. System Architecture (Multi-Tenant)**
* **Diagram Description:** Explain how the system handles multiple users. (e.g., Load Balancer -> API Gateway -> Auth Service / Strategy Workers).
* **Database Schema:** A relational schema designed for multi-tenancy.
    * *Users Table* (linked to Google ID).
    * *BrokerCredentials Table* (storing encrypted API secrets).
    * *Strategies Table* (JSON config for user parameters).
    * *TradeLogs* (linked by `user_id`).
* **Concurrency Model:** How to handle the "Morning Rush" (100 users logging in at 9:00 AM) using Task Queues (e.g., Celery/RabbitMQ or Kafka).

**2. Technology Stack Selection**
* **Backend:** Python framework capable of high concurrency (FastAPI vs. Django with Channels).
* **Auth Provider:** Libraries for handling Google OAuth flows.
* **Encryption:** Best practices for storing user TOTP secrets (e.g., AWS KMS or Fernet encryption).
* **Task Queue:** Redis/Celery for running user strategies in the background.

**3. Module-Level Technical Specifications**
* **The "Connector" Module:** Logic to iterate through all active users and regenerate Zerodha tokens daily.
* **The Strategy Sandbox:** How to allow users to define logic safely (Configuration-based strategies vs. Python code injection). *Note: Recommend Configuration-based for security.*
* **The Advisor Engine:** Logic for comparing "Current Market Data" vs. "User Strategy Config" to generate optimization alerts.

**4. AWS Deployment Plan**
* **Scalability:** Autoscaling groups for strategy workers (e.g., AWS ECS or Fargate).
* **Database:** RDS (PostgreSQL) for user data + TimescaleDB for market tick data.
* **Security:** VPC design to ensure user trade data is isolated.

**5. Development Roadmap**
* Phase 1: Google Auth & Multi-User Database Schema.
* Phase 2: Encrypted Credential Management & Multi-User Kite Login.
* Phase 3: Strategy Configuration UI & Backtesting.
* Phase 4: The "Advisor" Recommendation Engine & Live Trading.

**6. Risk Management & Compliance**
* **Rate Limiting:** Managing Zerodha's API limits per user vs. global IP limits.
* **Data Isolation:** Preventing "Cross-Tenant Data Leakage" (User A seeing User B's trades).

***

### 💡 Why this updated template works

I have adjusted the prompt to address the complexity of **Multi-Tenancy** and **User-Specific Logic**:

* **The "Dual-Auth" Challenge:** The prompt now explicitly separates **Identity Auth** (Google) from **Action Auth** (Zerodha). This forces the AI to design a database schema that links a Google Identity to a set of encrypted Zerodha API secrets.
* **The "Thundering Herd" Problem:** By mentioning the "Morning Rush" and "Task Queues," I am guiding the AI to suggest an asynchronous architecture (like Celery or AWS SQS). If you try to log in 100 users synchronously in a simple loop at 9:00 AM, the system will time out. The AI will now suggest a worker-based approach.
* **Configuration vs. Code:** In the "Strategy Sandbox" section, I added a constraint to prefer **Configuration-based strategies**. Allowing users to upload raw Python code is a massive security risk (they could hack your server). The prompt guides the AI to suggest a parameter-based system (e.g., User selects "SMA Crossover" and inputs "20" and "50") which is much safer.
* **The "Advisor" Loop:** I refined the regime change requirement to be **Personalized**. Instead of just "Market changed," the prompt asks for "Compare Market Data vs. User Config," which leads to a much more sophisticated recommendation engine.

### Next Step
Would you like me to run a simulation of this prompt and generate the **"Database Schema"** section immediately, so you can see how the Google Auth and Zerodha Credentials link together?
