"""
Quick test script for the API.
Run this after starting the server with: python app/api_server.py
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def print_response(title, response):
    """Pretty print API response."""
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)

def test_api():
    """Test all API endpoints."""
    
    # 1. Health Check
    print("\n🔍 Testing Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print_response("Health Check", response)
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Server is not running!")
        print("   Start the server with: python app/api_server.py")
        return
    
    # 2. Get Current Weather
    print("\n🌤️  Testing Weather Endpoint...")
    response = requests.get(
        f"{BASE_URL}/weather/current",
        params={"latitude": 40.7128, "longitude": -74.0060}  # NYC
    )
    print_response("Current Weather (NYC)", response)
    
    # 3. Get Recommendations (GET)
    print("\n👕 Testing Recommendations (GET)...")
    response = requests.get(
        f"{BASE_URL}/recommendations",
        params={
            "latitude": 40.7128,
            "longitude": -74.0060,
            "comfort_temperature": 72.0
        }
    )
    print_response("Recommendations (GET)", response)
    
    # 4. Get Recommendations (POST)
    print("\n👕 Testing Recommendations (POST)...")
    response = requests.post(
        f"{BASE_URL}/recommendations",
        json={
            "latitude": 34.0522,
            "longitude": -118.2437,  # Los Angeles
            "comfort_temperature": 75.0
        }
    )
    print_response("Recommendations (POST - LA)", response)
    
    # 5. Create User
    print("\n👤 Testing Create User...")
    response = requests.post(
        f"{BASE_URL}/users",
        json={
            "name": "Test User",
            "comfort_temperature": 72.0
        }
    )
    print_response("Create User", response)
    
    # 6. Get User (if user was created)
    if response.status_code == 200:
        user_id = response.json().get("id")
        if user_id:
            print("\n👤 Testing Get User...")
            response = requests.get(f"{BASE_URL}/users/{user_id}")
            print_response(f"Get User (ID: {user_id})", response)
    
    print("\n" + "="*60)
    print("✅ Testing Complete!")
    print("="*60)

if __name__ == "__main__":
    test_api()

