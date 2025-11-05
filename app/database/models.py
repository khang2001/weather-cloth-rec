"""
SQLAlchemy database models.
"""
from sqlalchemy import Column, Integer, Float, String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base


class User(Base):
    """
    User model for storing user preferences.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    comfort_temperature = Column(Float, default=70.0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    recommendations = relationship("Recommendation", back_populates="user")


class WeatherCache(Base):
    """
    Cache for weather data to reduce API calls.
    """
    __tablename__ = "weather_cache"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    weather_data = Column(JSON, nullable=False)  # Stores full weather response
    cached_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)


class Recommendation(Base):
    """
    Store recommendation history.
    """
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    comfort_temperature = Column(Float, nullable=False)
    weather_data = Column(JSON, nullable=False)  # Weather conditions at time of request
    comfort_score = Column(Float, nullable=False)
    clothing_recommendations = Column(JSON, nullable=False)  # List of recommended items
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="recommendations")

