# Weather Clothing Recommendation System - Function Documentation

This document provides comprehensive documentation for all functions, components, and modules in the Weather Clothing Recommendation System.

**Doc locations:** Frontend docs live in **`frontend/docs/`**. Backend docs live in the **weather-backend** repo under **`docs/`**.

## Table of Contents

1. [Backend API Documentation](#backend-api-documentation)
2. [Backend Functions Documentation](#backend-functions-documentation)
3. [Frontend Components Documentation](#frontend-components-documentation)
4. [Configuration Documentation](#configuration-documentation)

---

## Backend API Documentation

### API Endpoints

#### `GET /health` / `GET /`
**Health Check Endpoint**

- **Description**: Checks the health status of the API and database connection
- **Response Model**: `HealthResponse`
- **Returns**: 
  - `status`: "healthy"
  - `version`: Application version string
  - `database`: "connected" or "disconnected"

**Example Request**:
```http
GET /health
```

**Example Response**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "database": "connected"
}
```

---

#### `GET /score` / `POST /score`
**Get Clothing Recommendations**

- **Description**: Main endpoint for getting clothing recommendations based on weather conditions
- **Request Model**: `RecommendationRequest` (POST) or query parameters (GET)
- **Response Model**: `RecommendationResponse`
- **Parameters**:
  - `latitude` (float, required): Latitude coordinate (-90 to 90)
  - `longitude` (float, required): Longitude coordinate (-180 to 180)
  - `comfort_temperature` (float, optional): Personal comfort temperature (50-90°F, default: 70)

**Example GET Request**:
```http
GET /score?latitude=40.7128&longitude=-74.0060&comfort_temperature=70
```

**Example POST Request**:
```http
POST /score
Content-Type: application/json

{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "comfort_temperature": 70
}
```

**Example Response**:
```json
{
  "weather": {
    "temp_f": 43.0,
    "wind_mph": 20.0,
    "short_forecast": "mostly sunny",
    "location": "Hoboken, NJ",
    "period_start": "12:00 PM EST on November 17, 2025",
    "source": "weather.gov"
  },
  "comfort_score": 5.55,
  "clothing_recommendations": [
    {
      "name": "tee",
      "score": 1,
      "category": "base",
      "rainproof": null,
      "windproof": null,
      "insulated": null
    }
  ],
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

---

#### `GET /weather/current`
**Get Current Weather**

- **Description**: Fetches raw weather data without recommendations
- **Parameters**:
  - `latitude` (float, required): Latitude coordinate (-90 to 90)
  - `longitude` (float, required): Longitude coordinate (-180 to 180)
- **Response Model**: `WeatherResponse`

**Example Request**:
```http
GET /weather/current?latitude=40.7128&longitude=-74.0060
```

---

#### `GET /recommendations` / `POST /recommendations`
**Get Recommendations (Alias)**

- **Description**: Alias for `/score` endpoint
- **Same as**: `GET /score` / `POST /score`

---

#### `POST /users`
**Create User**

- **Description**: Creates a new user record (optional feature)
- **Request Model**: `UserCreate`
- **Response Model**: `UserResponse`

**Example Request**:
```http
POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "comfort_temperature": 72.0
}
```

---

#### `GET /users/{user_id}`
**Get User by ID**

- **Description**: Retrieves a user by their unique ID
- **Parameters**:
  - `user_id` (int, path): User's unique identifier
- **Response Model**: `UserResponse`

---

## Backend Functions Documentation

### Scoring Functions

#### `score_temperature(temperature)`
**File**: `backend/src/services/scoring/weather_scoring.py`

- **Description**: Scores temperature based on distance from comfort temperature
- **Parameters**:
  - `temperature` (float): Current temperature in Fahrenheit
- **Returns**: `float` - Temperature score (typically -10 to +10)
- **Formula**: `score = 10.0 - 0.5 * |temperature - COMFORT_TEMPERATURE|`
- **Example**:
  ```python
  score_temperature(70.0)  # Returns 10.0
  score_temperature(60.0)  # Returns 5.0
  score_temperature(30.0)  # Returns -10.0
  ```

---

#### `wind_multiplier(wind_speed, start=5.0, step=0.02, floor=0.6)`
**File**: `backend/src/services/scoring/weather_scoring.py`

- **Description**: Calculates wind multiplier to penalize comfort score for wind
- **Parameters**:
  - `wind_speed` (float): Wind speed in miles per hour
  - `start` (float, optional): Wind speed threshold before penalty (default: 5.0)
  - `step` (float, optional): Penalty per mph above threshold (default: 0.02)
  - `floor` (float, optional): Minimum multiplier value (default: 0.6)
- **Returns**: `float` - Wind multiplier between floor and 1.0
- **Formula**: `multiplier = max(floor, 1.0 - step * (wind_speed - start))`
- **Example**:
  ```python
  wind_multiplier(5.0)   # Returns 1.0 (no penalty)
  wind_multiplier(15.0)  # Returns 0.8
  wind_multiplier(25.0)  # Returns 0.6 (hits floor)
  ```

---

#### `score_weather(weather)`
**File**: `backend/src/services/scoring/weather_scoring.py`

- **Description**: Calculates overall comfort score from weather conditions
- **Parameters**:
  - `weather` (Weather object): Weather object with methods:
    - `get_temperature()`: Returns temperature in Fahrenheit
    - `get_wind_speed()`: Returns wind speed in mph
    - `get_short_forecast()`: Returns forecast description string
- **Returns**: `float` - Comfort score (higher = more comfortable)
- **Formula**: `comfort_score = (temperature_score * wind_multiplier) + forecast_score`
- **Example**:
  ```python
  # For 70°F, 5 mph wind, "sunny":
  # temperature_score = 10.0
  # wind_multiplier = 1.0
  # forecast_score = 10
  # Final score = 20.0
  ```

---

#### `recommend_clothing(comfort_score, temperature)`
**File**: `backend/src/services/scoring/clothing_scoring.py`

- **Description**: Converts comfort score to clothing recommendations
- **Parameters**:
  - `comfort_score` (float): Computed comfort score from weather_scoring
  - `temperature` (float): Current temperature in Fahrenheit
- **Returns**: `list` - Recommended clothing items as dictionaries
- **Warmth Mapping**:
  - `comfort_score >= 8`: 1 layer
  - `comfort_score >= 5`: 2 layers
  - `comfort_score >= 0`: 3 layers
  - `comfort_score >= -5`: 4 layers
  - `comfort_score < -5`: 5 layers
- **Example**:
  ```python
  recommend_clothing(5.55, 43.0)
  # Returns: [{"name": "tee", "category": "base", ...}, ...]
  ```

---

### Client Functions

#### `get_current_conditions(latitude, longitude)`
**File**: `backend/src/clients/nws_client.py`

- **Description**: Fetches current weather conditions from National Weather Service API
- **Parameters**:
  - `latitude` (float): Latitude in decimal degrees
  - `longitude` (float): Longitude in decimal degrees
- **Returns**: `dict` - Weather data containing:
  - `temp_f`: Temperature in Fahrenheit
  - `wind_mph`: Wind speed in mph
  - `short_forecast`: Forecast description
  - `period_start`: Timestamp string
  - `location`: City and state name
  - `source`: "weather.gov"
- **Raises**: `RuntimeError` if weather data unavailable

---

#### `get_point(latitude, longitude)`
**File**: `backend/src/clients/nws_client.py`

- **Description**: Resolves location to forecast office/grid URLs
- **Parameters**:
  - `latitude` (float): Latitude in decimal degrees
  - `longitude` (float): Longitude in decimal degrees
- **Returns**: `dict` - JSON object from NWS /points endpoint

---

#### `get_hourly_forecast(latitude, longitude)`
**File**: `backend/src/clients/nws_client.py`

- **Description**: Gets hourly forecast URL for a location
- **Parameters**:
  - `latitude` (float): Latitude in decimal degrees
  - `longitude` (float): Longitude in decimal degrees
- **Returns**: `str` - Full URL for hourly forecast endpoint

---

#### `get_location(latitude, longitude)`
**File**: `backend/src/clients/nws_client.py`

- **Description**: Gets city and state name for coordinates
- **Parameters**:
  - `latitude` (float): Latitude in decimal degrees
  - `longitude` (float): Longitude in decimal degrees
- **Returns**: `str` - City and state name (e.g., "New York, NY")

---

### Domain Models

#### `Weather` Class
**File**: `backend/src/domain/models/weather.py`

**Methods**:

- `__init__(latitude, longitude)`
  - **Description**: Creates Weather object and fetches NWS data
  - **Parameters**:
    - `latitude` (float): Latitude coordinate
    - `longitude` (float): Longitude coordinate

- `is_ready()`
  - **Description**: Checks if weather data is available
  - **Returns**: `bool` - True if weather data exists

- `get_temperature()`
  - **Description**: Gets temperature in Fahrenheit
  - **Returns**: `float` - Temperature (0.0 if missing)

- `get_temperature_celsius()`
  - **Description**: Gets temperature in Celsius
  - **Returns**: `float` - Temperature in Celsius

- `get_wind_speed()`
  - **Description**: Gets wind speed in mph
  - **Returns**: `float` - Wind speed (0.0 if missing)

- `get_short_forecast()`
  - **Description**: Gets forecast description
  - **Returns**: `str` - Forecast description (lowercase)

- `get_period_start()`
  - **Description**: Gets period start timestamp
  - **Returns**: `str` - Timestamp string

---

#### `User` Class (Domain Model)
**File**: `backend/src/domain/models/user.py`

**Methods**:

- `__init__(name, comfort_temperature)`
  - **Description**: Creates User object
  - **Parameters**:
    - `name` (str): User's name
    - `comfort_temperature` (float): Preferred comfort temperature

- `get_comfort_temperature()`
  - **Description**: Gets comfort temperature preference
  - **Returns**: `float` - Comfort temperature

- `get_clothing()`
  - **Description**: Gets clothing recommendations
  - **Returns**: `dict` - Clothing recommendations

- `get_score()`
  - **Description**: Gets comfort score
  - **Returns**: `float` - Comfort score

- `set_score(score)`
  - **Description**: Sets comfort score
  - **Parameters**: `score` (float): Comfort score value

---

### Utility Functions

#### `parse_wind_speed(wind_speed_str)`
**File**: `backend/src/utils/parsing.py`

- **Description**: Parses wind speed string from NWS API into numeric value
- **Parameters**:
  - `wind_speed_str` (str): Wind speed string (e.g., "5 mph", "10-15 mph", "calm")
- **Returns**: `float` - Wind speed in mph
- **Handles**:
  - Single values: "5 mph" → 5.0
  - Ranges: "10-15 mph" → 12.5 (average)
  - "calm" → 0.0

---

### Database Models

#### `User` Model (SQLAlchemy)
**File**: `backend/app/database/models.py`

- **Table**: `users`
- **Attributes**:
  - `id`: Primary key (Integer)
  - `name`: User's name (String)
  - `comfort_temperature`: Comfort temperature (Float, default: 70.0)
  - `created_at`: Creation timestamp (DateTime)
  - `updated_at`: Update timestamp (DateTime)
- **Relationships**: `recommendations` (one-to-many)

---

#### `WeatherCache` Model
**File**: `backend/app/database/models.py`

- **Table**: `weather_cache`
- **Attributes**:
  - `id`: Primary key (Integer)
  - `latitude`: Latitude coordinate (Float, indexed)
  - `longitude`: Longitude coordinate (Float, indexed)
  - `weather_data`: Cached weather data (JSON)
  - `cached_at`: Cache timestamp (DateTime)
  - `expires_at`: Expiration timestamp (DateTime)

---

#### `Recommendation` Model
**File**: `backend/app/database/models.py`

- **Table**: `recommendations`
- **Attributes**:
  - `id`: Primary key (Integer)
  - `user_id`: Foreign key to User (Integer, optional)
  - `latitude`: Request latitude (Float)
  - `longitude`: Request longitude (Float)
  - `comfort_temperature`: Used comfort temperature (Float)
  - `weather_data`: Weather conditions at request time (JSON)
  - `comfort_score`: Calculated comfort score (Float)
  - `clothing_recommendations`: Recommended items (JSON)
  - `created_at`: Creation timestamp (DateTime)
- **Relationships**: `user` (many-to-one, optional)

---

## Frontend Components Documentation

### App Component
**File**: `frontend/src/App.jsx`

**State Variables**:
- `latitude` (string): Latitude coordinate input
- `longitude` (string): Longitude coordinate input
- `comfortTemp` (string): Comfort temperature preference (default: "70")
- `selectedCity` (string): Selected city index from dropdown
- `loading` (boolean): API request loading state
- `result` (object|null): API response with recommendations
- `error` (string|null): Error message
- `currentLocation` (object|null): Current GPS location
- `locationLoading` (boolean): Geolocation loading state
- `locationError` (string|null): Geolocation error message

**Functions**:

- `apiPost(path, body, timeoutMs = 10000)`
  - **Description**: Makes POST request to backend API with timeout
  - **Parameters**:
    - `path` (string): API endpoint path
    - `body` (object): Request body
    - `timeoutMs` (number): Timeout in milliseconds
  - **Returns**: `Promise<object>` - Parsed JSON response
  - **Throws**: `Error` on failure or timeout

- `fetchWeatherRecommendations(lat, lon)`
  - **Description**: Fetches weather recommendations from API
  - **Parameters**:
    - `lat` (number|string): Latitude coordinate
    - `lon` (number|string): Longitude coordinate
  - **Updates**: `loading`, `error`, `result` state

- `handleSubmit(e)`
  - **Description**: Handles form submission
  - **Parameters**: `e` (Event): Form submit event

- `handleCityChange(cityIndex)`
  - **Description**: Handles city selection from dropdown
  - **Parameters**: `cityIndex` (string): City index in citiesData array
  - **Updates**: `selectedCity`, `latitude`, `longitude` state

- `getCurrentLocation()`
  - **Description**: Gets current location using geolocation API
  - **Updates**: Location-related state and automatically fetches recommendations

**Effects**:
- `useEffect`: Automatically gets location on component mount

---

### WeatherRecommendations Component
**File**: `frontend/src/components/WeatherRecommendations.jsx`

**Props**:
- `currentLocation` (object|null): Current GPS location
- `locationLoading` (boolean): Geolocation loading state
- `locationError` (string|null): Geolocation error
- `getCurrentLocation` (function): Function to request location
- `latitude` (string): Latitude input value
- `setLatitude` (function): Latitude setter
- `longitude` (string): Longitude input value
- `setLongitude` (function): Longitude setter
- `comfortTemp` (string): Comfort temperature value
- `setComfortTemp` (function): Comfort temperature setter
- `handleSubmit` (function): Form submission handler
- `loading` (boolean): API loading state
- `error` (string|null): API error message
- `result` (object|null): API response
- `weather` (object|null): Weather data
- `clothing` (array): Clothing recommendations
- `cities` (array): City data for dropdown
- `selectedCity` (string): Selected city index
- `onCityChange` (function): City selection handler

**Functions**:

- `handleLatitudeChange(e)`
  - **Description**: Handles latitude input change, clears city selection
  - **Parameters**: `e` (Event): Input change event

- `handleLongitudeChange(e)`
  - **Description**: Handles longitude input change, clears city selection
  - **Parameters**: `e` (Event): Input change event

**Renders**:
- Location display (if available)
- City selection dropdown
- Coordinate input form
- Comfort temperature input
- Submit button
- Error messages
- Loading indicators
- Weather information
- Comfort score
- Clothing recommendations

---

### WeatherCard Component
**File**: `frontend/src/components/WeatherCard.jsx`

**Props**:
- `weather` (object|null): Weather data object containing:
  - `location` (string): City and state name
  - `temp_f` (number): Temperature in Fahrenheit
  - `wind_mph` (number): Wind speed in mph
  - `short_forecast` (string): Forecast description

**Returns**: `JSX.Element|null` - Weather card or null if weather data missing

---

### Home Component
**File**: `frontend/src/pages/Home.jsx`

- **Description**: Simple wrapper that exports App component
- **Purpose**: Allows for future routing expansion

---

### Main Entry Point
**File**: `frontend/src/main.jsx`

- **Description**: React application entry point
- **Functionality**: Renders App component into DOM with StrictMode enabled

---

## Configuration Documentation

### Environment Variables

#### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `API_HOST`: Server host address (default: "0.0.0.0")
- `API_PORT`: Server port number (default: 8000)
- `DEBUG`: Enable debug mode (default: "False")
- `APP_NAME`: Application name for NWS API User-Agent
- `NWS_CONTACT`: Contact email for NWS API

#### Frontend
- `VITE_API_URL`: Backend API base URL (default: "http://127.0.0.1:8000")

---

### Configuration Constants

#### `COMFORT_TEMPERATURE`
**File**: `backend/src/config/common.py`
- **Value**: `70` (Fahrenheit)
- **Description**: Default comfort temperature for scoring

#### `FORECAST_SCORES`
**File**: `backend/src/config/common.py`
- **Type**: `dict`
- **Description**: Scores for different forecast conditions
- **Values**: Range from -10 (heavy snow) to +10 (sunny)

#### `CLOTHING_SCORES`
**File**: `backend/src/config/common.py`
- **Type**: `list[dict]`
- **Description**: Available clothing items with properties
- **Categories**: base, mid, outer, shell, accessory, bottom

#### `AUTO_ACCESSORIES`
**File**: `backend/src/config/common.py`
- **Type**: `list[dict]`
- **Description**: Rules for auto-adding accessories at temperature thresholds
- **Format**: `{"when_temp_below": temp, "add": [accessory_names]}`

#### `RECOMMENDATION_LIMITS`
**File**: `backend/src/config/common.py`
- **Type**: `dict`
- **Description**: Limits on number of recommendations
- **Keys**: `max_layers` (default: 5), `max_accessories` (default: 3)

---

## Data Structures

### RecommendationResponse
```typescript
{
  weather: {
    temp_f: number;
    wind_mph: number;
    short_forecast: string;
    location: string;
    period_start: string;
    source: string;
  };
  comfort_score: number;
  clothing_recommendations: Array<{
    name: string;
    score: number;
    category: string;
    rainproof?: boolean;
    windproof?: boolean;
    insulated?: boolean;
  }>;
  location: {
    latitude: number;
    longitude: number;
  };
}
```

### ClothingItem
```typescript
{
  name: string;           // e.g., "tee", "sweater", "light_jacket"
  score: number;          // Warmth score (1-6)
  category: string;      // "base", "mid", "outer", "shell", "accessory"
  rainproof?: boolean;    // Optional: rain protection
  windproof?: boolean;    // Optional: wind protection
  insulated?: boolean;    // Optional: insulation
}
```

---

## Algorithm Details

### Comfort Score Calculation

1. **Temperature Score**: `10.0 - 0.5 * |temp - 70|`
2. **Wind Multiplier**: `max(0.6, 1.0 - 0.02 * (wind - 5))`
3. **Adjusted Temperature**: `temperature_score * wind_multiplier`
4. **Forecast Score**: Lookup from `FORECAST_SCORES`
5. **Final Score**: `adjusted_temperature + forecast_score`

### Clothing Recommendation Algorithm

1. Map comfort score to `warmth_needed` (1-5 layers)
2. Add base layer if `warmth_needed >= 1`
3. Add mid layer if `warmth_needed >= 3`
4. Add outer layer if `warmth_needed >= 4`
5. Add shell if `comfort_score < 0` (adverse weather)
6. Add accessories based on temperature thresholds
7. Apply maximum layer limit (default: 5)

---

## Error Handling

### Backend Errors
- **400 Bad Request**: Invalid coordinates or missing required parameters
- **404 Not Found**: Weather data unavailable for location
- **500 Internal Server Error**: Server-side error (API failure, database error, etc.)

### Frontend Errors
- **Network Error**: Backend server unreachable
- **Timeout Error**: Request exceeded timeout (10 seconds)
- **Geolocation Error**: Browser geolocation failed or denied
- **Validation Error**: Invalid input data

---

## Notes

- All temperatures are in Fahrenheit
- Wind speeds are in miles per hour
- Coordinates use decimal degrees format
- API responses use JSON format
- Frontend uses React hooks for state management
- Backend uses FastAPI with Pydantic for validation

