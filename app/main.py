"""
Main FastAPI application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.api.v1 import auth, strategies, users, websocket, marketplace, admin

# Initialize database
init_db()

# Create app
app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(strategies.router)
app.include_router(users.router)
app.include_router(websocket.router)
app.include_router(marketplace.router)
app.include_router(admin.router)


@app.get("/")
async def root():
    return {"message": "AlgoTrading SaaS API", "version": "0.1.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}
