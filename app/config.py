"""
Configuration settings for the application.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Database Configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:pukan2001@localhost:1234/weather_cloth_rec"
)

# API Configuration
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", 8000))
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# Application Metadata
APP_NAME = "Weather Clothing Recommendation API"
APP_VERSION = "1.0.0"

