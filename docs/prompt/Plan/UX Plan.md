 As a Senior UI/UX Architect and Developer specializing in high-performance fintech platforms, I'll provide a comprehensive specification covering the UI/UX, a detailed React development roadmap, and a crucial backend connectivity plan for your multi-tenant algorithmic trading platform.

This plan is designed for security, scalability, and a clean, intuitive user experience.

Part 1: UI/UX Specification
This section defines the user-centric foundation of the platform.

1.1 User Personas
We will design for three primary user archetypes:

Persona 1: The "Set & Forget" Investor (Priya)

Background: A tech-savvy professional who understands market basics but lacks the time for active trading.
Goals: To deploy proven, simple strategies (like Nifty/BankNifty straddles) and have the system manage them. Values security and automation above all.
UI Needs: A clean, uncluttered dashboard with a clear P&L view, simple strategy setup, and prominent "Advisor" suggestions. The onboarding for broker credentials must feel exceptionally secure and straightforward.
Persona 2: The Experienced Quant (Raj)

Background: An experienced trader who builds and tests their own complex, multi-leg options strategies.
Goals: Wants granular control over strategy parameters, access to detailed backtesting results, and real-time performance metrics.
UI Needs: Advanced strategy configuration forms, detailed trade logs, performance charts, and a robust backtesting interface. He is less concerned with UI aesthetics and more with data density and responsiveness.
Persona 3: The Platform Administrator (Admin)

Background: The super-user responsible for platform stability and monitoring.
Goals: To ensure the automated token generation for all users is successful, monitor for system-wide errors, and view high-level user activity without accessing sensitive data.
UI Needs: A separate, functional dashboard showing system health, background job status, global error logs, and active user counts.
1.2 User Journey & Flows
Onboarding & Authentication Flow:

User visits the landing page -> Clicks "Login with Google".
Google OAuth Redirect -> User authenticates with Google.
Callback to Backend -> Backend creates a user profile, generates a JWT.
Redirect to Frontend Dashboard -> User is now logged in.
First-Time Login Prompt: A modal or banner prompts the user to connect their broker account.
Broker Setup: User navigates to Account > Broker Credentials and enters their Zerodha API Key, Secret, and TOTP Key. The UI will emphasize that secrets are encrypted and never displayed again.
Confirmation: The UI confirms credentials are saved and informs the user that the system will automatically generate an access token at 9:00 AM IST.
Strategy Creation Flow:

User navigates to /strategies -> Clicks "Create New Strategy".
Select Strategy Type: A modal appears (e.g., "Short Straddle," "Iron Condor").
Configure Parameters: The user is presented with a form specific to the chosen strategy (e.g., for a Straddle: Symbol, Strike Distance, Stop Loss %, Target %).
Save Strategy: The strategy is saved and appears in their list of strategies, initially in a "Paused" state.
Advisor Suggestion & Approval Flow:

System Analysis (Backend): The advisor engine analyzes the market (e.g., detects high VIX).
Suggestion Generated: A suggestion is created for a user's specific strategy.
UI Notification: A notification badge appears on the "Advisor" tab. A card appears on the main dashboard.
User Review: The user clicks the suggestion to see the rationale ("Why are you suggesting this?").
One-Click Approval: The user clicks "Approve." The UI sends a request to the backend to update the strategy's configuration. The change is logged.
1.3 Information Architecture (IA)
This defines the main navigation and routing structure for the React (Next.js) application.

/login - Public-facing login page.
/ or /dashboard - (Protected) The main user dashboard. The central hub for P&L, active strategies, and advisor alerts.
/strategies - (Protected)
/strategies/ - List of all user-created strategies with status (Active, Paused, Error).
/strategies/create - The strategy creation and configuration view.
/strategies/[id] - Detailed view of a single strategy, including its configuration, trade logs, and performance charts.
/backtesting - (Protected) A playground to test strategy configurations against historical data.
/advisor - (Protected) A dedicated page listing all historical and active suggestions from the optimizer.
/account - (Protected)
/account/profile - User profile information (from Google).
/account/broker - The form to add/update broker credentials.
/admin - (Admin-Only)
/admin/health - System health dashboard.
/admin/users - High-level user management.
Part 2: React Development Plan
This is a phased plan for building the frontend using a modern, robust stack.

2.1 Tech Stack & Design System
Framework: Next.js (for server-side rendering, routing, and API routes).
Styling: Tailwind CSS (for rapid, utility-first styling).
Component Library: shadcn/ui or MUI. Provides accessible, pre-built components like buttons, modals, and forms that can be styled with Tailwind.
State Management: Zustand or Redux Toolkit (Zustand is simpler for most use cases).
Data Fetching: SWR or React Query (TanStack Query) for caching, revalidation, and fetching data from the FastAPI backend.
Forms: React Hook Form for performant and flexible form validation.
Charts: Recharts or Lightweight Charts for financial data visualization.
2.2 Development Roadmap
Phase 1: Foundation & Authentication (1-2 Sprints)

Objective: Establish the core application shell, routing, and the complete authentication flow.
Tasks:
Project Setup: Initialize Next.js project with TypeScript and Tailwind CSS.
Layout: Create the main Layout component with a persistent Header and Sidebar.
Authentication:
LoginPage: Simple page with a "Login with Google" button.
Implement the OAuth callback logic (/api/auth/callback) to exchange the code for a JWT from the FastAPI backend.
Store JWTs securely in httpOnly cookies.
Protected Routes: Implement Next.js Middleware to protect dashboard routes and handle token refreshes.
Account & Broker Page:
Build the /account/broker page.
Create the BrokerCredentialsForm component using React Hook Form for validation.
Implement API calls to securely POST the credentials to the backend.
Phase 2: Strategy Management (CRUD) (2 Sprints)

Objective: Allow users to create, view, update, and delete their trading strategies.
Tasks:
Strategies List Page (/strategies):
Use SWR/React Query to fetch and display a list of the user's strategies.
Create a StrategyRow component showing name, type, status (Badge), and action buttons (Edit, Pause/Resume, Delete).
Strategy Creation/Editor Page (/strategies/create, /strategies/[id]):
Build a dynamic StrategyForm organism.
Use conditional rendering to show different form fields based on the selected strategy type.
Implement POST (create) and PUT (update) API calls to save the strategy configuration.
Phase 3: Dashboard & Real-Time Data (2 Sprints)

Objective: Create a dynamic and informative user dashboard.
Tasks:
Dashboard Grid (/dashboard):
Design a responsive grid layout using CSS Grid or Flexbox.
Create a MetricCard component for key data points ("Today's P&L," "Active Strategies").
Fetch and display summary data. Consider using SWR's refreshInterval for periodic polling.
Strategy Detail View (/strategies/[id]):
Display the detailed configuration of a single strategy.
Add a TradeLogTable component to fetch and show all trades executed by that strategy.
Integrate a charting library to visualize the P&L curve for the strategy.
Phase 4: The "Advisor" Engine & Backtesting (2-3 Sprints)

Objective: Integrate the intelligent optimizer and provide backtesting capabilities.
Tasks:
Advisor UI Integration:
Create an AdvisorSuggestionCard component for the dashboard.
Build the /advisor page to list all suggestions.
Implement the "Approve" button logic to send a PATCH request to the backend.
Add a notification system (e.g., a bell icon in the header) that shows a badge for new suggestions.
Backtesting Playground (/backtesting):
Reuse the StrategyForm to allow users to input a configuration.
Add date range pickers.
Create a "Run Backtest" button that sends the configuration to the backend.
Display backtest results: total P&L, win/loss ratio, max drawdown, and a P&L chart.
Phase 5: Admin Dashboard & Polish (1 Sprint)

Objective: Build the admin interface and refine the overall user experience.
Tasks:
Admin Role & Routing: Implement role-based access control in the Next.js middleware.
Admin Health Dashboard: Create a simple, data-dense page showing system health metrics fetched from admin-only endpoints.
UX Polish: Review the entire application for loading states (skeletons, spinners), error handling (user-friendly messages), and mobile responsiveness.
Part 3: Backend FastAPI Connectivity Plan
This section outlines the API contract between the React frontend and the FastAPI backend. We'll use Pydantic-style schemas for clarity.

Authentication (/auth)
GET /auth/login/google
Action: Redirects the user to Google's OAuth consent screen.
Frontend Call: window.location.href = '/api/auth/login/google';
GET /auth/callback/google
Action: Handles the callback from Google, creates/logs in the user, and returns a JWT.
Response Body:
json
{
  "access_token": "your_jwt_token",
  "token_type": "bearer"
}
GET /users/me
Action: Returns the profile of the currently authenticated user.
Headers: Authorization: Bearer your_jwt_token
Response Body:
json
{ "email": "user@example.com", "name": "User Name", "picture": "url_to_avatar" }
Broker Credentials (/broker)
POST /broker/credentials
Action: Saves or updates the user's encrypted broker credentials.
Headers: Authorization: Bearer your_jwt_token
Request Body:
json
{
  "api_key": "user_api_key",
  "api_secret": "user_api_secret",
  "totp_key": "user_totp_key"
}
Response: 204 No Content on success.
Strategies (/strategies)
POST /strategies
Action: Creates a new strategy for the user.
Request Body:
json
{
  "name": "My BankNifty Straddle",
  "type": "SHORT_STRADDLE",
  "config": { "symbol": "BANKNIFTY", "stop_loss_pct": 25, "target_pct": 80 }
}
Response: 201 Created with the full strategy object.
GET /strategies
Action: Gets a list of all strategies for the authenticated user.
Response Body:
json
[
  { "id": "uuid1", "name": "My Straddle", "type": "SHORT_STRADDLE", "status": "ACTIVE" },
  { "id": "uuid2", "name": "My Condor", "type": "IRON_CONDOR", "status": "PAUSED" }
]
GET /strategies/{strategy_id}
Action: Gets detailed information for a single strategy.
Response Body: Full strategy object including config, P&L, etc.
PUT /strategies/{strategy_id}
Action: Updates the configuration of an existing strategy.
Request Body: Same as POST /strategies.
DELETE /strategies/{strategy_id}
Action: Deletes a strategy.
Response: 204 No Content.
Advisor (/advisor)
GET /advisor/suggestions
Action: Gets a list of active suggestions for the user.
Response Body:
json
 Show full code block 
[
  {
    "id": "sugg_uuid1",
    "strategy_id": "uuid1",
    "strategy_name": "My BankNifty Straddle",
    "suggestion": "Consider changing stop loss to 35%",
    "rationale": "Market VIX is above 20, indicating high volatility.",
    "proposed_config_change": { "stop_loss_pct": 35 }
  }
]
POST /advisor/suggestions/{suggestion_id}/approve
Action: Approves a suggestion, which triggers the backend to update the strategy.
Response: 200 OK with the updated strategy object.
Admin (/admin)
GET /admin/system-health
Action: (Admin Only) Returns system-wide health metrics.
Response Body:
json
 Show full code block 
{
  "active_users": 150,
  "strategies_running": 250,
  "last_token_refresh_status": "SUCCESS",
  "errors_last_24h": 5
}
