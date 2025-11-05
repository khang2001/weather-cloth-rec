COMFORT_TEMPERATURE = 70

FORECAST_SCORES = {
    # ☀️ Excellent conditions
    "sunny": 10,
    "mostly sunny": 8,
    "partly cloudy": 6,

    # ☁️ Neutral to mild discomfort
    "mostly cloudy": 3,
    "cloudy": 1,
    "fog": -2,

    # 🌧️ Adverse weather
    "rain": -5,
    "sleet": -6,
    "snow": -7,

    # 🌩️ Severe or dangerous
    "thunderstorms": -8,
    "heavy rain": -9,
    "heavy snow": -10,
}

# src/clothing_config.py
# A simple warmth scale (points) and gear flags.
# Edit these values—not the algorithms—to tune recommendations.

CONFIG_VERSION = "1.0.0"

# Core warmth points are roughly additive across layers.
# Think: base (light) → mid (medium) → outer (heavy).
CLOTHING_SCORES = [
    # --- Base layers (1–2 pts) ---
    {"name": "tee",               "score": 1, "category": "base"},
    {"name": "long_sleeve",       "score": 2, "category": "base"},
    {"name": "thermal_base",      "score": 3, "category": "base"},

    # --- Mid layers (2–4 pts) ---
    {"name": "sweater",           "score": 3, "category": "mid"},
    {"name": "fleece",            "score": 3, "category": "mid"},
    {"name": "heavy_sweater",     "score": 4, "category": "mid"},

    # --- Outer layers (3–6 pts) ---
    {"name": "light_jacket",      "score": 3, "category": "outer", "windproof": True},
    {"name": "insulated_jacket",  "score": 5, "category": "outer", "insulated": True},
    {"name": "down_coat",         "score": 6, "category": "outer", "insulated": True},

    # --- Shells (weather protection; small warmth + flags) ---
    {"name": "rain_shell",        "score": 2, "category": "shell", "rainproof": True, "windproof": True},
    {"name": "softshell",         "score": 3, "category": "shell", "windproof": True},

    # --- Accessories (fractional; add on top for extremes) ---
    {"name": "scarf",             "score": 1, "category": "accessory"},
    {"name": "hat",               "score": 1, "category": "accessory"},
    {"name": "gloves",            "score": 1, "category": "accessory"},
    {"name": "thermal_leggings",  "score": 2, "category": "bottom"},
]

# Optional auto-add rules for extreme temps (in °F)
AUTO_ACCESSORIES = [
    {"when_temp_below": 32, "add": ["hat", "gloves"]},
    {"when_temp_below": 20, "add": ["scarf"]},
    {"when_temp_below": 15, "add": ["thermal_leggings"]},
]

# Hard caps so we don't recommend 8+ bulky layers.
RECOMMENDATION_LIMITS = {
    "max_layers": 5,         # base + mid + outer + shell + 1 accessory
    "max_accessories": 3
}

