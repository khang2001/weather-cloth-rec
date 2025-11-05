# clothing_scoring.py
# comfort score → layers

from src.config.common import (
    CLOTHING_SCORES,
    AUTO_ACCESSORIES,
    RECOMMENDATION_LIMITS
)


def recommend_clothing(comfort_score, temperature):
    """
    Convert comfort score to clothing recommendations.
    
    Args:
        comfort_score: The computed comfort score from weather_scoring
        temperature: Current temperature in Fahrenheit
        
    Returns:
        list: Recommended clothing items as dictionaries
    """
    recommendations = []
    
    # Map comfort score to warmth needed
    # Lower scores need more layers
    if comfort_score >= 8:
        # Very comfortable - minimal layers
        warmth_needed = 1
    elif comfort_score >= 5:
        # Comfortable - light layers
        warmth_needed = 2
    elif comfort_score >= 0:
        # Neutral - moderate layers
        warmth_needed = 3
    elif comfort_score >= -5:
        # Cool - heavier layers
        warmth_needed = 4
    else:
        # Cold - maximum layers
        warmth_needed = 5
    
    # Select clothing based on warmth needed
    base_layers = [item for item in CLOTHING_SCORES if item["category"] == "base"]
    mid_layers = [item for item in CLOTHING_SCORES if item["category"] == "mid"]
    outer_layers = [item for item in CLOTHING_SCORES if item["category"] == "outer"]
    shells = [item for item in CLOTHING_SCORES if item["category"] == "shell"]
    
    # Add base layer
    if warmth_needed >= 1:
        recommendations.append(base_layers[0] if base_layers else None)
    
    # Add mid layer if needed
    if warmth_needed >= 3:
        recommendations.append(mid_layers[0] if mid_layers else None)
    
    # Add outer layer if needed
    if warmth_needed >= 4:
        recommendations.append(outer_layers[-1] if outer_layers else None)  # Heaviest outer layer
    
    # Add shell for rain/snow
    if comfort_score < 0:
        rain_shell = next((item for item in shells if item.get("rainproof")), None)
        if rain_shell:
            recommendations.append(rain_shell)
    
    # Auto-add accessories based on temperature
    for rule in AUTO_ACCESSORIES:
        if temperature < rule["when_temp_below"]:
            for accessory_name in rule["add"]:
                accessory = next((item for item in CLOTHING_SCORES if item["name"] == accessory_name), None)
                if accessory and accessory not in recommendations:
                    recommendations.append(accessory)
    
    # Filter out None values and limit layers
    recommendations = [r for r in recommendations if r is not None]
    
    # Apply limits
    max_layers = RECOMMENDATION_LIMITS.get("max_layers", 5)
    recommendations = recommendations[:max_layers]
    
    return recommendations

