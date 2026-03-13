from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.air_quality_routes import router as air_quality_router
from routes.transport_routes import router as transport_router
from routes.traffic_routes import router as traffic_router
from services.data_loader import load_traffic_data
from services.transport_service import load_transport_data

app = FastAPI(
    title="AI-Powered Urban Insights Platform API",
    description="Backend API powering the Next.js Dashboard"
)

# Enable CORS for frontend compatibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In hackathon logic, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register specialized routes
app.include_router(traffic_router)
app.include_router(air_quality_router)
app.include_router(transport_router)

@app.on_event("startup")
def startup_event():
    # Load dataset into memory once at startup
    load_traffic_data()
    load_transport_data()
    print("Backend initialized. Traffic and transport datasets loaded successfully into memory.")

@app.get("/")
def health_check():
    return {"status": "healthy", "service": "Urban Insights API", "version": "1.0.0"}
