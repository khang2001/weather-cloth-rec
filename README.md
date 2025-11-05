# Weather-Based Clothing Recommendation System

A Python application that fetches real-time weather data from the U.S. National Weather Service (NWS) API and provides intelligent clothing recommendations based on temperature, wind speed, and forecast conditions.

## Features

- 🌤️ **Real-time Weather Data**: Fetches current weather conditions from the official NWS API
- 📊 **Comfort Scoring**: Calculates a comfort score based on temperature, wind speed, and forecast conditions
- 👕 **Smart Recommendations**: Suggests appropriate clothing layers (base, mid, outer, shells) and accessories
- 🔧 **Configurable**: Customize comfort temperature, forecast scoring, and clothing options
- 🧪 **Tested**: Includes unit tests for scoring functions

## Installation

### Prerequisites

- Python 3.7 or higher
- pip (Python package manager)

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd weather-cloth-rec
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file (optional, for NWS API user-agent):
```bash
APP_NAME=WeatherLayers
NWS_CONTACT=your-email@example.com
```

**Note**: The `.env` file is optional but recommended. The NWS API prefers applications to identify themselves with proper contact information.

## Usage

### Command Line Interface

Run the application with default coordinates (New York City area):
```bash
python app/run.py
```

Or specify custom latitude and longitude:
```bash
python app/run.py 34.05 -118.24  # Los Angeles
```

### Programmatic Usage

```python
from src.domain.models.weather import Weather
from src.services.scoring.weather_scoring import score_weather
from src.services.scoring.clothing_scoring import recommend_clothing

# Create weather object (automatically fetches from NWS)
weather = Weather(latitude=40.7128, longitude=-74.0060)

# Calculate comfort score
comfort_score = score_weather(weather)

# Get clothing recommendations
recommendations = recommend_clothing(comfort_score, weather.get_temperature())

print(f"Comfort Score: {comfort_score:.1f}")
print(f"Recommended Clothing: {recommendations}")
```

## Project Structure

```
weather-cloth-rec/
├── app/
│   └── run.py                 # CLI runner for testing
├── src/
│   ├── clients/
│   │   └── nws_client.py      # NWS API client
│   ├── config/
│   │   └── common.py          # Configuration (comfort temp, clothing items, etc.)
│   ├── domain/
│   │   └── models/
│   │       ├── weather.py     # Weather domain model
│   │       └── user.py        # User domain model
│   ├── services/
│   │   └── scoring/
│   │       ├── weather_scoring.py    # Weather → comfort score
│   │       └── clothing_scoring.py   # Comfort score → clothing layers
│   └── utils/
│       └── parsing.py         # Wind speed parsing utilities
├── tests/
│   └── test_scoring.py        # Unit tests
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

## How It Works

### 1. Weather Data Fetching

The `nws_client.py` module:
- Maps latitude/longitude to NWS forecast grid points
- Retrieves hourly forecast data
- Parses temperature (°F), wind speed (mph), and forecast text
- Handles API rate limiting and retries with exponential backoff

### 2. Comfort Scoring

The `weather_scoring.py` module calculates a comfort score:

- **Temperature Score**: Based on distance from ideal comfort temperature (default: 70°F)
  - Peak score (+10) at comfort temperature
  - Decreases by 0.5 points per °F away from comfort
- **Wind Multiplier**: Reduces comfort score for windy conditions
  - No penalty below 5 mph
  - Decreasing multiplier above 5 mph (minimum 0.6)
- **Forecast Score**: Adjusts based on weather conditions
  - Sunny: +10
  - Cloudy: +1 to +3
  - Rain/Snow: -5 to -10

**Final Score** = `(Temperature Score × Wind Multiplier) + Forecast Score`

### 3. Clothing Recommendations

The `clothing_scoring.py` module converts comfort scores to clothing:

- **Score ≥ 8**: Minimal layers (base layer only)
- **Score 5-7**: Light layers (base + optional mid)
- **Score 0-4**: Moderate layers (base + mid)
- **Score -5 to -1**: Heavy layers (base + mid + outer)
- **Score < -5**: Maximum layers (base + mid + outer + shell)

Accessories (hat, gloves, scarf) are automatically added based on temperature thresholds.

## Configuration

Edit `src/config/common.py` to customize:

- **`COMFORT_TEMPERATURE`**: Your ideal temperature (default: 70°F)
- **`FORECAST_SCORES`**: Score adjustments for different weather conditions
- **`CLOTHING_SCORES`**: Available clothing items with warmth scores
- **`AUTO_ACCESSORIES`**: Temperature thresholds for automatic accessory recommendations
- **`RECOMMENDATION_LIMITS`**: Maximum layers and accessories to recommend

## Testing

Run the test suite:
```bash
python tests/test_scoring.py
```

Tests cover:
- Temperature scoring
- Wind multiplier calculation
- Weather scoring integration

## API Reference

### `get_current_conditions(latitude, longitude)`

Fetches current weather conditions for a location.

**Returns:**
```python
{
    "temp_f": float,           # Temperature in Fahrenheit
    "wind_mph": float,         # Wind speed in mph
    "short_forecast": str,     # Forecast description
    "period_start": str,       # Period start time
    "source": "weather.gov",
    "location": str            # City, State
}
```

### `score_weather(weather)`

Calculates comfort score from weather object.

**Returns:** `float` - Comfort score (typically -10 to +20)

### `recommend_clothing(comfort_score, temperature)`

Generates clothing recommendations.

**Returns:** `list` - List of clothing item dictionaries

## Notes

- The NWS API is free and does not require an API key
- The application respects NWS rate limits with automatic retries
- Wind speed parsing handles various formats ("5 mph", "10-15 mph", "calm")
- Default coordinates in `run.py` point to Pennsylvania (40.952583, -75.165222)

## License

[Add your license information here]

## Contributing

[Add contribution guidelines here]
