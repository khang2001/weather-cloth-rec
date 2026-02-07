/**
 * Main Application Component
 * 
 * This is the root component of the weather clothing recommendation application.
 * It manages all application state, handles API communication, and coordinates
 * user interactions including geolocation, city selection, and form submission.
 * 
 * Features:
 * - Automatic geolocation on mount
 * - City selection from predefined list
 * - Manual coordinate entry
 * - Weather data fetching and recommendation display
 */
import { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import WeatherRecommendations from "./components/WeatherRecommendations";
import Settings from "./pages/Settings";
import citiesData from "./data/us_cities.json";

// Backend API base URL (configurable via environment variable)
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/**
 * Make a POST request to the backend API with timeout handling.
 * 
 * @param {string} path - API endpoint path (e.g., "/score")
 * @param {object} body - Request body to send as JSON
 * @param {number} timeoutMs - Request timeout in milliseconds (default: 10000)
 * @returns {Promise<object>} Parsed JSON response from the API
 * @throws {Error} If request fails, times out, or returns error status
 */
async function apiPost(path, body, timeoutMs = 10000) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const url = `${BASE_URL}${path}`;
    console.log("API Request:", url, body);
    
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    
    console.log("API Response status:", res.status, res.statusText);
    
    if (!res.ok) {
      const errorText = await res.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { detail: errorText || `HTTP ${res.status}: ${res.statusText}` };
      }
      throw new Error(errorData.detail || errorData.message || `HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log("API Response data:", data);
    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      throw err;
    }
    if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
      throw new Error(`Cannot connect to backend server at ${BASE_URL}. Make sure the backend is running.`);
    }
    throw err;
  } finally {
    clearTimeout(to);
  }
}

/**
 * Main App Component
 * 
 * Manages application state and coordinates user interactions.
 */
function App() {
  // Form input state
  const [latitude, setLatitude] = useState("");           // Latitude coordinate input
  const [longitude, setLongitude] = useState("");        // Longitude coordinate input
  const [comfortTemp, setComfortTemp] = useState("70");  // User's comfort temperature preference
  const [selectedCity, setSelectedCity] = useState("");   // Selected city index from dropdown
  
  // API request state
  const [loading, setLoading] = useState(false);         // Loading state for API requests
  const [result, setResult] = useState(null);             // API response with recommendations
  const [error, setError] = useState(null);               // Error message if request fails
  
  // Geolocation state
  const [currentLocation, setCurrentLocation] = useState(null);      // Current GPS location
  const [locationLoading, setLocationLoading] = useState(false);     // Loading state for geolocation
  const [locationError, setLocationError] = useState(null);           // Error message for geolocation

  // User saved locations
  const [savedLocations, setSavedLocations] = useState([]);
  
  // Current selected city display
  const [currentCityDisplay, setCurrentCityDisplay] = useState(null);

  /**
   * Fetch weather recommendations from the backend API.
   * 
   * Sends a POST request to /score endpoint with coordinates and comfort temperature.
   * Updates loading, error, and result state based on the response.
   * 
   * @param {number|string} lat - Latitude coordinate
   * @param {number|string} lon - Longitude coordinate
   */
  const fetchWeatherRecommendations = useCallback(async (lat, lon) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Prepare request payload
      const payload = {
        latitude: Number(lat),
        longitude: Number(lon),
        comfort_temperature: comfortTemp ? Number(comfortTemp) : undefined,
      };
      
      console.log("Sending request with comfort_temperature:", comfortTemp);
      
      // Make API request
      const data = await apiPost("/score", payload);
      console.log("Weather data received:", data);
      console.log("Comfort score from API:", data.comfort_score);
      
      // Validate response structure
      if (!data || !data.weather) {
        throw new Error("Invalid response from server: missing weather data");
      }
      
      // Update state with successful response
      setResult(data);
    } catch (err) {
      console.error("Error fetching weather:", err);
      // Handle different error types
      const errorMessage = err.name === "AbortError" 
        ? "Request timed out" 
        : err.message || "Failed to fetch weather data. Please check if the backend server is running.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [comfortTemp]);

  /**
   * Handle form submission.
   * 
   * Prevents default form behavior and fetches recommendations if coordinates are provided.
   * 
   * @param {Event} e - Form submit event
   */
  async function handleSubmit(e) {
    e.preventDefault();
    if (latitude && longitude) {
      await fetchWeatherRecommendations(latitude, longitude);
    }
  }

  /**
   * Handle city selection from dropdown.
   * 
   * Updates latitude and longitude inputs when a city is selected.
   * Clears city selection if empty string is passed.
   * 
   * @param {string} cityIndex - Index of selected city in citiesData array (as string)
   */
  const handleCityChange = useCallback((cityIndex) => {
    if (cityIndex === "") {
      setSelectedCity("");
      setCurrentCityDisplay(null);
      return;
    }
    const index = parseInt(cityIndex);
    const city = citiesData[index];
    // Validate city data and update coordinates
    if (city && typeof city.latitude === 'number' && typeof city.longitude === 'number') {
      setSelectedCity(cityIndex);
      // Update latitude and longitude immediately
      setLatitude(city.latitude.toString());
      setLongitude(city.longitude.toString());
      
      // Set current city display
      setCurrentCityDisplay({
        name: `${city.city}, ${city.state}`,
        icon: 'city',
        color: 'primary',
        coordinates: `${city.latitude.toFixed(4)}, ${city.longitude.toFixed(4)}`
      });
    }
  }, []);

  /**
   * Reverse geocode coordinates to get city name
   */
  const reverseGeocode = async (lat, lng) => {
    try {
      // Use Nominatim (OpenStreetMap) reverse geocoding API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'WeatherClothingApp/1.0'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const address = data.address;
        const city = address.city || address.town || address.village || address.county;
        const state = address.state;
        
        if (city && state) {
          return `${city}, ${state}`;
        } else if (city) {
          return city;
        }
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
    return 'Current Location';
  };

  /**
   * Get current location using browser geolocation API.
   * 
   * Requests user's current GPS coordinates and automatically fetches
   * weather recommendations. Clears city selection when using geolocation.
   */
  const getCurrentLocation = useCallback(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setLocationLoading(true);
    setLocationError(null);
    setSelectedCity(""); // Clear city selection when using geolocation

    // Request current position with high accuracy
    navigator.geolocation.getCurrentPosition(
      // Success callback
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        // Update state with location and coordinates
        setCurrentLocation({ latitude: lat, longitude: lon });
        setLatitude(lat.toString());
        setLongitude(lon.toString());
        setLocationLoading(false);
        
        // Get city name from coordinates
        const cityName = await reverseGeocode(lat, lon);
        
        // Set current city display
        setCurrentCityDisplay({
          name: cityName,
          icon: 'pin',
          color: 'success',
          coordinates: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
          isGPS: true
        });
        
        // Automatically fetch weather recommendations for current location
        fetchWeatherRecommendations(lat, lon);
      },
      // Error callback
      (err) => {
        setLocationError(
          err.message || "Unable to retrieve your location. Please enter coordinates manually."
        );
        setLocationLoading(false);
      },
      // Options
      {
        enableHighAccuracy: true,  // Request high accuracy GPS
        timeout: 10000,            // 10 second timeout
        maximumAge: 0,             // Don't use cached location
      }
    );
  }, [fetchWeatherRecommendations]);

  /**
   * Effect: Automatically get user's location on component mount.
   * 
   * Runs once when component first mounts to provide immediate recommendations.
   */
  useEffect(() => {
    // Automatically get location on component mount
    getCurrentLocation();

    // Fetch user's saved locations if logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        fetchUserLocations(userData.id);
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }

    // Listen for user login events to refresh saved locations
    const handleUserLogin = (event) => {
      if (event.detail && event.detail.id) {
        fetchUserLocations(event.detail.id);
      }
    };

    window.addEventListener('userLogin', handleUserLogin);

    return () => {
      window.removeEventListener('userLogin', handleUserLogin);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Fetch user's saved locations from API
   */
  const fetchUserLocations = async (userId) => {
    try {
      const response = await fetch(`${BASE_URL}/settings/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSavedLocations(data.saved_locations || []);
      }
    } catch (err) {
      console.error('Failed to fetch saved locations:', err);
    }
  };

  /**
   * Handle quick location button click
   */
  const handleQuickLocation = (location) => {
    setLatitude(location.latitude.toString());
    setLongitude(location.longitude.toString());
    setSelectedCity(''); // Clear city selection
    
    // Set current city display
    setCurrentCityDisplay({
      name: location.name,
      icon: location.icon,
      color: location.color,
      coordinates: `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
    });
    
    // Automatically fetch recommendations
    fetchWeatherRecommendations(location.latitude, location.longitude);
  };

  // Extract weather data from API response (with fallback)
  const weather = result?.weather || null;
  
  // Extract clothing recommendations from API response
  // Supports both new format (clothing_recommendations) and legacy format (recommended_layers)
  const clothing =
    result?.clothing_recommendations ??
    result?.recommended_layers?.map((n) => ({ name: n, category: "layer" })) ??
    [];

  return (
    <Router basename={import.meta.env.BASE_URL}>
    <Layout>
        <Routes>
          <Route
            path="/"
            element={
      <WeatherRecommendations
        currentLocation={currentLocation}
        locationLoading={locationLoading}
        locationError={locationError}
        getCurrentLocation={getCurrentLocation}
        latitude={latitude}
        setLatitude={setLatitude}
        longitude={longitude}
        setLongitude={setLongitude}
        comfortTemp={comfortTemp}
        setComfortTemp={setComfortTemp}
        handleSubmit={handleSubmit}
        loading={loading}
        error={error}
        result={result}
        weather={weather}
        clothing={clothing}
        cities={citiesData}
        selectedCity={selectedCity}
        onCityChange={handleCityChange}
                savedLocations={savedLocations}
                onQuickLocation={handleQuickLocation}
                currentCityDisplay={currentCityDisplay}
              />
            }
      />
          <Route path="/settings" element={<Settings />} />
        </Routes>
    </Layout>
    </Router>
  );
}

export default App;

