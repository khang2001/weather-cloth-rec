"""
API Server Entry Point
Run this file to start the FastAPI server.
"""
import sys
import os

# Add project root to Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

import uvicorn
from app.config import API_HOST, API_PORT, DEBUG
from app.api.main import app

if __name__ == "__main__":
    uvicorn.run(
        "app.api.main:app",
        host=API_HOST,
        port=API_PORT,
        reload=DEBUG,
        log_level="info" if not DEBUG else "debug"
    )

