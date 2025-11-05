# user.py
# User domain model

class User:
    def __init__(self, name, comfort_temperature):
        """
        Create a User object.
        """
        self.name = name
        self.comfort_temperature = comfort_temperature
        self.clothing = {}        
        self.score = 0  # clothing/comfort score you compute later

    def __str__(self):
        """
        Human-friendly summary. Uses safe getters so it won't crash if data is missing.
        """
        return (f"User: {self.name}, Comfort Temperature: {self.comfort_temperature}, Clothing: {self.clothing}")

    # ---- Accessors (defensive: use .get with defaults) -----------------------
    def get_comfort_temperature(self):
        return self.comfort_temperature

    def get_clothing(self):
        return self.clothing

    # ---- Scoring --------------------------------------------------------------
    def get_score(self):
        return self.score

    def set_score(self, score):
        self.score = score

