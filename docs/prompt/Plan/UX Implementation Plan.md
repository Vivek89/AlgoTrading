This is the **Master UX Development Plan & Architecture**. It consolidates the "Speed & Scale" technology stack, persona-driven design, and a rigorous implementation roadmap for your multi-tenant fintech platform.

This document focuses on **Frontend/UX Engineering**, while explicitly defining the **FastAPI Integration Contracts** required to power the UI.

---

# Part 1: The "Speed & Scale" Tech Stack (2025)

We are deploying the "Golden Stack" for high-frequency trading interfaces.

| Category | Technology | Rationale & UX Role |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15 (App Router)** | Server-Side Rendering (SSR) for secure, fast initial loads. Hosting the app shell. |
| **UI System** | **shadcn/ui** | Built on **Radix UI** & **Tailwind**. Accessible, un-styled primitives that we customize for a "Bloomberg Terminal" aesthetic. |
| **State (Global)** | **Zustand** | Used for **transient updates**. We subscribe to WebSocket streams and update chart components directly, bypassing React's main render cycle to maintain 60fps. |
| **Data Fetching** | **TanStack Query (React Query)** | Manages server state (User Profile, Strategy List) with caching, polling, and optimistic updates. |
| **Real-Time Charts** | **Lightweight Charts** | HTML5 Canvas rendering. Handles thousands of tick updates per second without browser lag. |
| **Complex Forms** | **React Hook Form + Zod** | Manages the "Risk Management" and "Strategy Config" forms. Zod ensures no invalid money management rules are submitted. |
| **Socket Client** | **react-use-websocket** | Robust WebSocket hook handling auto-reconnect, heartbeats, and connection status (Red/Yellow/Green UI indicators). |
| **Testing** | **Playwright** | E2E testing capable of mocking WebSocket frames to simulate market crashes. |

---

# Part 2: UX Implementation Strategy (Per Persona)



### 1. Priya (The "Set & Forget" Investor)
* **UX Goal:** "Confidence."
* **Key Interface:** **The Pulse Dashboard**.
* **Critical UI:**
    * **Panic Switch:** A large toggle to "Exit All Positions."
    * **Simple Cards:** "Total P&L" and "Capital Used" (No complex Greeks).
    * **Wizard Modal:** A stepped dialog for securely entering Zerodha API credentials.

### 2. Raj (The Quant)
* **UX Goal:** "Control."
* **Key Interface:** **The Strategy Command Center**.
* **Critical UI:**
    * **Dense Data Grid:** `TanStack Table` with sortable columns for Delta, Theta, and IV.
    * **Live Chart:** Candlestick chart with overlay lines showing Entry Price and Stop Loss levels.
    * **Complex Forms:** Sliders and Inputs for "Lock & Trail" logic.

### 3. Admin (The Superuser)
* **UX Goal:** "Observability."
* **Key Interface:** **The Tower Dashboard**.
* **Critical UI:**
    * **Health Grid:** Traffic-light status for Broker APIs and Celery Workers.
    * **Live Logs:** Virtualized scrolling list of system events.

---

# Part 3: Detailed UI Pages & FastAPI Integration

### Page 1: Authentication & Broker Setup (`/auth`, `/settings`)
**UX Description:** A clean, trust-inspiring login page followed by a secure credentials management form. The form fields for API Secret/TOTP must be masked and clearly labeled as "End-to-End Encrypted."

**Backend Integration (FastAPI):**
| UI Action | HTTP Method | Endpoint | Payload / Params |
| :--- | :--- | :--- | :--- |
| **Login with Google** | `GET` | `/auth/login/google` | `?redirect_uri=...` |
| **Save Credentials** | `POST` | `/broker/credentials` | `{ "api_key": "...", "api_secret": "...", "totp_key": "..." }` |
| **Check Connection** | `POST` | `/broker/test-connection` | *(Empty, uses session cookie)* |

### Page 2: Strategy Configuration Wizard (`/strategies/new`)
**UX Description:** A multi-step form using **React Hook Form**.
1.  **Selection:** Card grid to select "Straddle", "Strangle", or "Iron Fly".
2.  **Parameters:** Dynamic fields based on selection (e.g., Strike Distance).
3.  **Risk Management:** An accordion section for "Lock & Trail" (See Sprint 6).

**Backend Integration (FastAPI):**
| UI Action | HTTP Method | Endpoint | Payload / Params |
| :--- | :--- | :--- | :--- |
| **Save Draft** | `POST` | `/strategies` | `{ "type": "STRADDLE", "config": {...}, "risk_config": {...} }` |
| **Validate Config** | `POST` | `/strategies/validate` | `{ "config": ... }` *(Returns math errors like "SL > Capital")* |

### Page 3: The Command Center (Dashboard) (`/dashboard`)
**UX Description:** The high-performance view.
* **Top Bar:** Global P&L (Green/Red), Connection Status Dot.
* **Main Stage:** **Lightweight Chart** (Canvas) showing the active symbol.
* **Bottom Panel:** **TanStack Table** of active strategies. Rows flash yellow on update.

**Backend Integration (FastAPI):**
| UI Action | Protocol | Endpoint | Data Flow |
| :--- | :--- | :--- | :--- |
| **Live Market Data** | `WebSocket` | `ws://api.../ws/ticks` | Server pushes `{"symbol": "NIFTY", "ltp": 24500}` |
| **Order Updates** | `WebSocket` | `ws://api.../ws/orders` | Server pushes `{"order_id": "123", "status": "COMPLETE"}` |
| **Panic Exit** | `POST` | `/emergency/kill-switch` | `{ "user_id": "..." }` |

### Page 4: Social Marketplace (`/marketplace`)
**UX Description:** A grid of cards displaying shared strategies. Each card shows "ROI", "Max Drawdown", and a "Clone" button.

**Backend Integration (FastAPI):**
| UI Action | HTTP Method | Endpoint | Payload / Params |
| :--- | :--- | :--- | :--- |
| **Fetch Shared** | `GET` | `/strategies/shared` | `?sort=downloads` |
| **Clone Strategy** | `POST` | `/strategies/{id}/clone` | *(Creates copy in user's DB)* |

---

# Part 4: Automated Test Plan (The Pyramid)



[Image of software testing pyramid]


1.  **Level 1: Unit Testing (Vitest)**
    * **Zod Schemas:** Verify that `riskSchema` correctly rejects a "Target Profit" of -500.
    * **Math Utils:** Test `calculateTrailingSL(entry, current, config)` for exactness.
2.  **Level 2: Integration Testing (React Testing Library)**
    * **Forms:** Fill out the Strategy Form, mock the API success, assert the "Success Toast" appears.
    * **Socket Reconnect:** Mock the WebSocket closing, assert the UI Badge turns "Yellow/Reconnecting".
3.  **Level 3: E2E Testing (Playwright)**
    * **Multi-User Sim:** Open 3 browser contexts. Log in as 3 different users. Assert all 3 can generate tokens simultaneously.
    * **Market Crash:** Inject a mock WebSocket message dropping the price by 5%. Assert the "Stop Loss Triggered" UI state appears.

---

# Part 5: Development Roadmap (Sprints)

### Sprint 1: Core Foundation & Auth (Weeks 1-2)
* **Goal:** Secure Login & Credential Vault.
* **Tasks:**
    * Initialize Next.js 15, Tailwind, shadcn/ui.
    * Implement **Google OAuth** logic (`NextAuth.js`).
    * Build `BrokerCredentialsForm`:
        * Implement **Fernet encryption** utility (Frontend encrypts payload before sending).
        * Create API Client wrapper (Axios/Fetch) with Interceptors for 401 handling.
* **Deliverable:** Functional Login and Settings Page.

### Sprint 2: Strategy Engine & Risk Engine Logic (Weeks 3-5) [HEAVY LIFT]
* **Goal:** The Strategy "Wizard" UI.
* **Tasks:**
    * Create `StrategyForm` with **React Hook Form**.
    * Implement **Zod Schemas** for:
        * `StraddleConfig` (ATM/OTM selection).
        * `IronCondorConfig` (Wing width).
    * Build the `StrategyTable` using **TanStack Table** (Columns: Name, Instrument, Status, Actions).
    * **Integration:** Connect to `POST /strategies` and `GET /strategies`.
* **Deliverable:** Users can Create, Read, Update, and Delete (CRUD) strategies.

### Sprint 3: Real-Time Execution, Charts & WebSocket (Weeks 6-7)
* **Goal:** The "Alive" Dashboard.
* **Tasks:**
    * Setup **Zustand Store** for `marketData` and `orderLog`.
    * Integrate `react-use-websocket` to listen to `/ws/ticks`.
    * Build `LiveMarketChart` component wrapper around **Lightweight Charts**.
    * Implement **Transient Updates**: Ensure Chart updates do not re-render the Sidebar or Header.
    * Add **Connection Health** indicator (Green/Red dot).
* **Deliverable:** Dashboard with live-ticking charts and P&L.

### Sprint 4: Social Sharing & Marketplace (Weeks 8-9)
* **Goal:** Community & Sharing.
* **Tasks:**
    * Build the **Share Modal**: Generates a unique link `platform.com/share/xyz`.
    * Build `MarketplaceGrid`: Display shared strategies with "Clone" buttons.
    * **Integration:** `POST /strategies/{id}/clone`.
* **Deliverable:** A public gallery of strategies and cloning functionality.

### Sprint 5: Admin, Polish & Stress Testing (Weeks 10-11)
* **Goal:** Production Hardening.
* **Tasks:**
    * Build `AdminHealthDashboard`: Visualize Celery Worker queues and API Latency.
    * **Playwright Load Test:** Simulate 50 concurrent browser sessions receiving high-frequency socket ticks.
    * **UX Polish:** Add Skeleton loaders, Tooltips, and Error Boundaries.
* **Deliverable:** Production Release Candidate.

### Sprint 6: Functional Specification: Advanced Risk Management Engine (The "Guardrails")
* **Goal:** Visualizing "Lock & Trail" Logic.
* **Tasks:**
    * **Enhance Strategy Form:** Add the "Risk Management" accordion.
    * **UI Components:**
        * `RadioGroup` for "None / Lock / Trail / Lock & Trail".
        * `Collapsible` section for the 4-step parameter inputs (Reach, Lock, Step, Trail).
    * **Visualizer:** Create a small static SVG diagram in the form that *changes dynamically* as the user types, visually explaining how their Lock & Trail logic will behave.
    * **Backend Integration:** Map these form fields to the `risk_management` JSON key in the `POST /strategies` payload.
* **Deliverable:** The advanced "Guardrails" UI fully implemented and validated.
