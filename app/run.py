# run.py
# Purpose:
#   Minimal command-line runner to test the weather.gov client.
#   It calls `get_current_conditions` and prints the result.
#
# Usage:
#   python app/run.py                     # Uses NYC by default
#   python app/run.py 34.05 -118.24       # Pass your own lat lon (Los Angeles)

import sys
import os

# Add project root to Python path so imports work
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from src.clients.nws_client import get_current_conditions, fetch_short_forecast_once
from src.services.scoring.weather_scoring import score_weather
from src.domain.models.weather import Weather

def _parse_cli_coordinates(arguments):
    """
    Parse latitude/longitude from CLI arguments if provided; otherwise default to NYC.

    Args:
        arguments: Raw sys.argv list (including script name at index 0).

    Returns:
        (latitude, longitude) as floats.
    """
    if len(arguments) >= 3:
        try:
            latitude = float(arguments[1])
            longitude = float(arguments[2])
            return latitude, longitude
        except ValueError:
            # If the user provided bad numbers, fall back to NYC and inform them.
            print("Warning: Could not parse coordinates. Falling back to NYC (40.7128, -74.0060).")
    # Default coordinates: New York City
    return 40.952583, -75.165222



def main():
    latitude, longitude = _parse_cli_coordinates(sys.argv)
    current_conditions = get_current_conditions(latitude, longitude)
    # Printing as a plain dict is fine. You can pretty-print JSON if you prefer.
    print(fetch_short_forecast_once(latitude, longitude))
    weather = Weather(latitude, longitude)
    print(weather)
    print(score_weather(weather))


if __name__ == "__main__":
    main()

