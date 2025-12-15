This is the consolidated **UX Implementation & Automated Test Plan**, refined to merge the "Speed & Scale" technology choices with the specific user journey requirements of your multi-tenant platform.

### **Unified UX Implementation & Automated Test Plan**

This document consolidates the high-performance constraints of the "Speed & Scale" tech stack with the detailed user-centric implementation strategies required for a modern, real-time fintech platform.

---

#### **Part 1: The "Speed & Scale" Tech Stack (2025)**

This stack is selected to balance the need for extreme reactivity (handling high-frequency market ticks) with developer velocity and maintainability.

| Category | Technology | Rationale & Use Case |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15 (App Router)** | Provides the server-side foundation for secure auth routes and optimized initial page loads (LCP). |
| **UI System** | **shadcn/ui** | Built on **Radix UI** & **Tailwind CSS**. Offers accessible, "copy-paste" components that are easily customizable, avoiding the bloat of traditional component libraries. |
| **State Management** | **Zustand** | Chosen for its **transient update** capability. Allows us to subscribe to state changes outside of React's render cycle, which is critical for high-frequency ticker updates. |
| **Live Charts** | **Lightweight Charts (TradingView)** | **Critical Selection:** Uses HTML5 Canvas for rendering. Unlike SVG-based libraries (Recharts), this can handle 60fps market data streams without lagging the browser. |
| **Static/P&L Charts** | **Recharts** | Used via `shadcn/charts` for smoother, more aesthetic visualizations like "Cumulative P&L" or "Backtest Results" where extreme update frequency isn't required. |
| **Data Grid** | **TanStack Table (v8)** | Headless table library providing sorting, filtering, and pagination logic, wrapped in `shadcn` styling for the complex "Strategy Dashboard." |
| **Forms** | **React Hook Form + Zod** | Ensures robust validation for complex financial inputs (e.g., preventing a Stop Loss > 100%) before data ever hits the API. |
| **Socket Client** | **react-use-websocket** | Manages the WebSocket lifecycle, handling auto-reconnection, heartbeats, and connection status (Open/Closed/Error). |
| **E2E Testing** | **Playwright** | Selected for its ability to **mock WebSocket frames** and support **multi-context testing** (simulating User A and User B trading simultaneously). |

---

#### **Part 2: UX Implementation Strategy (Per Persona)**

**1. Priya (The "Set & Forget" Investor)**
* **Goal:** Simplicity and Reassurance.
* **Key Interface: The "Pulse" Dashboard**
    * **Live Metrics:** Large, clear cards for "Today's P&L" and "Total Investment." Numbers use `react-countup` for smooth transitions.
    * **Master Switch:** A prominent `Switch` component labeled "Global Strategy Status." Toggling this to "OFF" immediately triggers a backend "Panic" endpoint to cancel all orders.
    * **Onboarding:** A step-by-step `Dialog` (Modal) for entering Zerodha credentials. Fields are masked (`type="password"`), and a "Lock" icon emphasizes encryption.

**2. Raj (The Quant)**
* **Goal:** Data Density and Precision.
* **Key Interface: The Strategy Command Center**
    * **Data Table:** A dense `TanStack Table` listing active strategies. Columns include *Symbol, Delta, Theta, Live P&L, Status*.
    * **Real-Time Chart:** A `Lightweight Chart` (Candlestick) dominates the view, overlaying strategy entry/exit points on live market data.
    * **Input Forms:** Complex forms using `Slider` (for percentages) and `Select` (for instrument types). Real-time validation shows potential "Max Loss" calculations as the user types.

**3. Admin (The Superuser)**
* **Goal:** System Observability.
* **Key Interface: The "Tower" Dashboard**
    * **Health Grid:** A traffic-light grid showing status of key services: "Zerodha API Gateway" (Green), "Celery Workers" (Green), "Market Data Feed" (Yellow).
    * **Live Logs:** A virtualized list (using `react-window`) displaying the tail of system logs for monitoring errors during the morning login rush.

---

#### **Part 3: Automated Test Plan (The Pyramid)**

**Level 1: Unit Testing (Vitest)**
* *Focus:* Business Logic & Utilities.
* **Tests:**
    * `useSocketStore`: Verify that incoming JSON strings are correctly parsed and stored in the Zustand store.
    * `calculatePnL(entry, current)`: robust math tests to ensure P&L calculations handle edge cases (e.g., zero price).
    * `strategySchema`: Zod validation tests (e.g., ensuring `target_pct` is always positive).

**Level 2: Integration Testing (React Testing Library)**
* *Focus:* Component Interaction & Optimistic UI.
* **Tests:**
    * **Broker Connection:** Mock the API response. Verify that submitting the credentials form shows a "Encrypting..." loader, then a success `Toast`.
    * **Advisor Approval:** Click "Approve" on a suggestion card. Verify the UI immediately marks it as "Applied" (Optimistic update) even before the API confirms.
    * **Socket Reconnect:** Mock `useWebSocket`. Force a disconnect event and verify the "Connection Status" badge turns Red, then Yellow (Connecting).

**Level 3: End-to-End (E2E) Testing (Playwright)**
* *Focus:* Critical User Journeys (CUJs) & Real-Time simulation.
* **Test Suite A: The "Morning Rush"**
    * *Scenario:* Spawn 5 concurrent browser contexts (Users).
    * *Action:* Attempt simultaneous login and token generation.
    * *Check:* All 5 users receive a "Token Generated" success message within 5 seconds.
* **Test Suite B: The "Market Volatility" Stress Test**
    * *Scenario:* Open the Dashboard.
    * *Mock:* Intercept the WebSocket URL and inject a burst of 50 ticks in 1 second.
    * *Check:*
        1.  **Visual:** Snapshot test to confirm the Chart rendered the spikes.
        2.  **Performance:** Ensure the UI did not freeze (frame rate check).
        3.  **Data:** Verify "Total P&L" text matches the final tick value.

---

#### **Part 4: Development Roadmap (Sprint Breakdown)**

**Sprint 1: The Secure Foundation (Weeks 1-2)**
* **Goal:** Secure Auth & Credential Storage.
* **Tasks:**
    * Initialize Next.js 15 repo with TypeScript, Tailwind, shadcn/ui.
    * Implement Google OAuth (`NextAuth.js`) and secure session cookie handling.
    * Build `BrokerCredentialsForm`:
        * UI: Inputs for API Key, Secret, TOTP.
        * Logic: Encrypt fields payload before POST to backend.
* **Deliverable:** Functional Login and "Settings" page.

**Sprint 2: Strategy Configuration Engine (Weeks 3-4)**
* **Goal:** Strategy CRUD.
* **Tasks:**
    * Create `StrategyForm` schema with Zod validation (Straddle vs. Iron Condor logic).
    * Implement `StrategiesTable`:
        * Fetch data via React Query (SWR).
        * Add "Edit" and "Delete" actions.
* **Deliverable:** Users can create, view, and save strategies.

**Sprint 3: The Real-Time Engine (Weeks 5-6) [CRITICAL]**
* **Goal:** Live Charts & WebSocket Integration.
* **Tasks:**
    * Integrate `react-use-websocket` to connect to FastAPI `ws://.../ticks`.
    * Build `LiveMarketChart` component using **Lightweight Charts**.
    * Implement `StreamingPnLCard` using **Zustand** for direct DOM updates (bypassing React render for performance).
    * Add "Connection Health" status indicators.
* **Deliverable:** Dashboard with live-updating charts and P&L.

**Sprint 4: The Advisor & Backtesting (Weeks 7-8)**
* **Goal:** Intelligence & Simulation.
* **Tasks:**
    * Build `AdvisorNotificationCenter`: Real-time alerts for strategy optimization.
    * Create `BacktestPlayground`:
        * Date Range Picker.
        * Static `Recharts` Area chart for historical P&L visualization.
* **Deliverable:** Functional "Advisor" tab and Backtesting UI.

**Sprint 5: Admin, Polish & Load Testing (Weeks 9-10)**
* **Goal:** Production Hardening.
* **Tasks:**
    * Build `AdminHealthDashboard` (Service status monitoring).
    * **Load Testing:** Use Playwright to simulate 50+ concurrent socket connections.
    * **Resilience:** Test UI behavior during network interruptions (auto-reconnect).
* **Deliverable:** Production-ready release candidate.

### **Next Step**
I can generate the **React code for the `LiveMarketChart` component** (Sprint 3), specifically demonstrating how to integrate `Lightweight Charts` with `react-use-websocket` and `Zustand` to achieve high-performance updates without re-renders. Would you like to proceed with that?
