# weather_scoring.py
# temp/wind/forecast → comfort score

from src.config.common import FORECAST_SCORES, COMFORT_TEMPERATURE

# --- Temperature score (°F)------------------------
def score_temperature(temperature):
    """
    Score the temperature based on 
    it's distance from the comfort temperature chosen by the user.

    For example: Peak comfort at 70°F (= +10). Linearly decrease 0.5 points per °F away from 70.
    At |T-70| >= 40°F, score bottoms at -10.
    """
    diff = abs(float(temperature) - COMFORT_TEMPERATURE)
    score = 10.0 - 0.5 * diff  # 0.5 pts per °F away from COMFORT_TEMPERATURE
    return score

# --- Wind multiplier: always <= 1, decreases with wind ---
def wind_multiplier(wind_speed, start=5.0, step=0.02, floor=0.6):
    """
    Monotonic penalty:
      - <= start mph: no penalty (1.00)
      - every +1 mph above start reduces multiplier by 'step'
      - never drops below 'floor'
    Example (start=5, step=0.02, floor=0.6):
      5 mph -> 1.00
      15 mph -> 0.80
      25 mph -> 0.60 (hits floor)
    """
    w = max(0.0, float(wind_speed) - start)
    m = 1.0 - step * w
    return max(floor, m)



def score_weather(weather):
    """
    Score the weather data.
    temp/wind/forecast → comfort score
    """
    temperature = score_temperature(weather.get_temperature())
    wind_speed = weather.get_wind_speed() 
    short_forecast = weather.get_short_forecast()

    wind_multiplier_score = wind_multiplier(weather.get_wind_speed()) 
    temperature_score = temperature * wind_multiplier_score
    forecast_score = FORECAST_SCORES.get(short_forecast, 0)
    
    score = temperature_score + forecast_score
    return score

