import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.settings import settings
from routes import sensor_routes, crop_routes, health_routes, model_routes, chat_routes
from utils.logger import logger

# Validate settings on startup
settings.validate()

# Banner
BANNER = """
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ███████╗ █████╗ ██████╗ ███╗   ███╗██╗   ██╗███████╗██╗  ██╗ █████╗ 
║   ██╔════╝██╔══██╗██╔══██╗████╗ ████║██║   ██║██╔════╝╚██╗██╔╝██╔══██╗
║   █████╗  ███████║██████╔╝██╔████╔██║██║   ██║█████╗   ╚███╔╝ ███████║
║   ██╔══╝  ██╔══██║██╔══██╗██║╚██╔╝██║╚██╗ ██╔╝██╔══╝   ██╔██╗ ██╔══██║
║   ██║     ██║  ██║██║  ██║██║ ╚═╝ ██║ ╚████╔╝ ███████╗██╔╝ ██╗██║  ██║
║   ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
║                                                              ║
║              AI-POWERED FARM INTELLIGENCE ENGINE              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"""

AI_MODE_BANNER = {
    "local": """
    ┌──────────────────────────────────────┐
    │  🤖 AI MODE: LOCAL                    │
    │  📦 Model: crop_ai_model_v1.h5        │
    │  🧠 Framework: TensorFlow             │
    │  📏 Image Size: 224x224               │
    │  🎯 Confidence Threshold: 75%         │
    └──────────────────────────────────────┘
    """,
    "gemini": """
    ┌──────────────────────────────────────┐
    │  🤖 AI MODE: GEMINI                   │
    │  🌐 Model: gemini-3.5-flash           │
    │  ☁️  Provider: Google AI               │
    │  📏 Image Size: 224x224               │
    │  🎯 Confidence Threshold: 75%         │
    └──────────────────────────────────────┘
    """,
    "hdm": """
    ┌──────────────────────────────────────┐
    │  🤖 AI MODE: HDM AI                   │
    │  🌐 Provider: HDM AI API              │
    │  🔗 URL: Configured                   │
    │  📏 Image Size: 224x224               │
    │  🎯 Confidence Threshold: 75%         │
    └──────────────────────────────────────┘
    """
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    # STARTUP
    print(BANNER)

    ai_mode = settings.AI_USED
    print(AI_MODE_BANNER.get(ai_mode, f"  ⚠️  Unknown AI Mode: {ai_mode}"))

    print(f"""
    ╔════════════════════════════════════════╗
    ║  🟢 SERVER STATUS: ONLINE              ║
    ║  📡 Port: {settings.PORT:<28}║
    ║  🔗 MERN: {settings.MERN_URL:<28}║
    ║  📂 Uploads: {settings.UPLOAD_DIR:<25}║
    ║  🗂️  Temp: {settings.TEMP_DIR:<28}║
    ╚════════════════════════════════════════╝
    """)

    logger.info(f"🚀 {settings.APP_NAME} started on port {settings.PORT}")
    logger.info(f"🤖 AI Mode: {settings.AI_USED}")
    logger.info(f"🔗 MERN Server: {settings.MERN_URL}")

    if ai_mode == "local":
        if os.path.exists(settings.CROP_AI_MODEL):
            logger.info(f"✅ Model found: {settings.CROP_AI_MODEL}")
        else:
            logger.warning(f"⚠️  Model not found: {settings.CROP_AI_MODEL}")
            logger.info("💡 Model will be created when first training is done")

    if not os.path.exists(settings.RULE_ENGINE_CONFIG):
        logger.info("💡 Rule engine config not found — using defaults (fine for now)")

    yield

    # SHUTDOWN
    print("""
    ╔════════════════════════════════════════╗
    ║  🔴 SERVER STATUS: SHUTDOWN            ║
    ╚════════════════════════════════════════╝
    """)
    logger.info("👋 FarmVexa AI Engine shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Farm Intelligence Engine",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.MERN_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(health_routes.router, prefix="/api", tags=["Health"])
app.include_router(sensor_routes.router, prefix="/api", tags=["Sensor Analysis"])
app.include_router(crop_routes.router, prefix="/api", tags=["Crop Analysis"])
app.include_router(model_routes.router, prefix="/api", tags=["Models"])
app.include_router(chat_routes.router, prefix="/api", tags=["Farmer Chat"])

# Create directories
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.TEMP_DIR, exist_ok=True)


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": "1.0.0",
        "status": "running",
        "ai_mode": settings.AI_USED,
        "endpoints": {
            "health": "/api/health",
            "analyze_sensors": "/api/analyze/sensors",
            "analyze_crop": "/api/analyze/crop",
            "model_details": "/api/models/details",
            "train_model": "/api/models/train",
            "farmer_chat": "/api/chat"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)