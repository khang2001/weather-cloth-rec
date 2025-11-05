"""
FastAPI main application file.
"""
import sys
import os

# Add project root to Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional

from app.config import APP_NAME, APP_VERSION
from app.database import get_db, Base, engine
from app.api.schemas import (
    HealthResponse,
    WeatherResponse,
    RecommendationResponse,
    RecommendationRequest,
    CoordinatesRequest,
    UserCreate,
    UserResponse
)
from src.domain.models.weather import Weather
from src.services.scoring.weather_scoring import score_weather
from src.services.scoring.clothing_scoring import recommend_clothing

# Create database tables (in production, use Alembic migrations)
# Wrap in try-except so server can start even if database isn't available
try:
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created/verified")
except Exception as e:
    print(f"⚠ Warning: Could not create database tables: {e}")
    print("  Server will start, but database features may not work.")

# Initialize FastAPI app
app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="API for weather-based clothing recommendations"
)

# CORS middleware (adjust origins for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health Check Endpoint
@app.get("/", response_model=HealthResponse)
@app.get("/health", response_model=HealthResponse)
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint."""
    try:
        # Test database connection
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = "disconnected"

    return HealthResponse(
        status="healthy",
        version=APP_VERSION,
        database=db_status
    )


# Weather Endpoint
@app.get("/weather/current", response_model=WeatherResponse)
def get_current_weather(
    latitude: float = Query(..., ge=-90, le=90, description="Latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="Longitude")
):
    """
    Get current weather conditions for a location.
    
    - **latitude**: Latitude coordinate (-90 to 90)
    - **longitude**: Longitude coordinate (-180 to 180)
    """
    try:
        from src.clients.nws_client import get_current_conditions
        
        weather_data = get_current_conditions(latitude, longitude)
        
        return WeatherResponse(
            temp_f=weather_data["temp_f"],
            wind_mph=weather_data["wind_mph"],
            short_forecast=weather_data["short_forecast"],
            location=weather_data["location"],
            period_start=weather_data["period_start"],
            source=weather_data["source"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch weather data: {str(e)}"
        )


# Recommendations Endpoint
@app.get("/recommendations", response_model=RecommendationResponse)
@app.post("/recommendations", response_model=RecommendationResponse)
def get_recommendations(
    latitude: Optional[float] = Query(None, ge=-90, le=90),
    longitude: Optional[float] = Query(None, ge=-180, le=180),
    comfort_temperature: Optional[float] = Query(None, ge=50, le=90),
    request: Optional[RecommendationRequest] = None,
    db: Session = Depends(get_db)
):
    """
    Get clothing recommendations based on weather conditions.
    
    Can be called via GET (query params) or POST (JSON body).
    
    - **latitude**: Latitude coordinate (-90 to 90)
    - **longitude**: Longitude coordinate (-180 to 180)
    - **comfort_temperature**: Optional personal comfort temperature (default: 70°F)
    """
    # Handle both GET (query params) and POST (body)
    if request:
        lat = request.latitude
        lon = request.longitude
        comfort_temp = request.comfort_temperature
    else:
        if latitude is None or longitude is None:
            raise HTTPException(
                status_code=400,
                detail="latitude and longitude are required"
            )
        lat = latitude
        lon = longitude
        comfort_temp = comfort_temperature
    
    try:
        # Get weather data
        weather = Weather(lat, lon)
        if not weather.is_ready():
            raise HTTPException(
                status_code=404,
                detail="Weather data not available for this location"
            )
        
        # Calculate comfort score (using custom comfort temp if provided)
        # Note: You'll need to modify weather_scoring to accept custom comfort temp
        comfort_score = score_weather(weather)
        
        # Get clothing recommendations
        clothing_recs = recommend_clothing(comfort_score, weather.get_temperature())
        
        # Format clothing items
        clothing_items = [
            {
                "name": item["name"],
                "score": item["score"],
                "category": item["category"],
                "rainproof": item.get("rainproof"),
                "windproof": item.get("windproof"),
                "insulated": item.get("insulated")
            }
            for item in clothing_recs
        ]
        
        # Build response
        return RecommendationResponse(
            weather=WeatherResponse(
                temp_f=weather.get_temperature(),
                wind_mph=weather.get_wind_speed(),
                short_forecast=weather.get_short_forecast(),
                location=weather.weather_data.get("location", "Unknown"),
                period_start=weather.get_period_start(),
                source="weather.gov"
            ),
            comfort_score=comfort_score,
            clothing_recommendations=clothing_items,
            location={"latitude": lat, "longitude": lon}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate recommendations: {str(e)}"
        )


# User Endpoints (optional - for future use)
@app.post("/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user."""
    from app.database.models import User
    
    db_user = User(
        name=user.name,
        comfort_temperature=user.comfort_temperature
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID."""
    from app.database.models import User
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user
