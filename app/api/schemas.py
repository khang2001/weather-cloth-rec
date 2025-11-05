"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime


# Request Schemas
class CoordinatesRequest(BaseModel):
    """Request schema for latitude/longitude."""
    latitude: float = Field(..., ge=-90, le=90, description="Latitude (-90 to 90)")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude (-180 to 180)")

    @validator("latitude", "longitude")
    def validate_coordinates(cls, v):
        if abs(v) > 180:
            raise ValueError("Coordinate out of valid range")
        return v


class RecommendationRequest(CoordinatesRequest):
    """Request schema for recommendations with optional comfort temperature."""
    comfort_temperature: Optional[float] = Field(
        default=None,
        ge=50,
        le=90,
        description="Personal comfort temperature in Fahrenheit (default: 70)"
    )


class UserCreate(BaseModel):
    """Schema for creating a user."""
    name: str = Field(..., min_length=1, max_length=100)
    comfort_temperature: float = Field(default=70.0, ge=50, le=90)


# Response Schemas
class WeatherResponse(BaseModel):
    """Weather data response."""
    temp_f: float
    wind_mph: float
    short_forecast: str
    location: str
    period_start: str
    source: str = "weather.gov"

    class Config:
        from_attributes = True


class ClothingItem(BaseModel):
    """Individual clothing item in recommendations."""
    name: str
    score: int
    category: str
    rainproof: Optional[bool] = None
    windproof: Optional[bool] = None
    insulated: Optional[bool] = None


class ComfortScoreBreakdown(BaseModel):
    """Breakdown of comfort score components."""
    temperature_score: float
    wind_multiplier: float
    forecast_score: float
    final_score: float


class RecommendationResponse(BaseModel):
    """Full recommendation response."""
    weather: WeatherResponse
    comfort_score: float
    score_breakdown: Optional[ComfortScoreBreakdown] = None
    clothing_recommendations: List[ClothingItem]
    location: Dict[str, float]  # {"latitude": float, "longitude": float}


class UserResponse(BaseModel):
    """User response schema."""
    id: int
    name: str
    comfort_temperature: float
    created_at: datetime

    class Config:
        from_attributes = True


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = "healthy"
    version: str
    database: str = "connected"

