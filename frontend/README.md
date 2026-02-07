# Frontend

React + Vite frontend for weather-based clothing recommendations.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

Set `VITE_API_URL=http://127.0.0.1:8000` (or use Vite proxy)

3. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: `http://127.0.0.1:8000`)

## Features

- 📍 **Location Input**: Enter coordinates manually or use browser geolocation
- 🏙️ **City Selector**: Choose from 100+ US cities with pre-filled coordinates
- 🌡️ **Comfort Temperature**: Customize your personal comfort temperature (default: 70°F)
- 👕 **Smart Recommendations**: View recommended clothing layers based on weather conditions
- 📊 **Weather Display**: See current temperature, wind speed, and forecast

### City Selector

The frontend includes a city selector dropdown with 100+ US cities. When you select a city:
- Latitude and longitude fields are automatically filled
- You can still manually edit coordinates after selecting a city
- Manual coordinate entry clears the city selection

City data is stored in `src/data/us_cities.json` and includes major cities across all US states.

## Development

The frontend uses:
- React 18 for UI
- Vite for build tooling and dev server
- Proxy configuration in `vite.config.js` to avoid CORS issues during development

### Key Components

- **App.jsx**: Main application component with state management and API calls
- **WeatherRecommendations.jsx**: Form and results display component
- **WeatherCard.jsx**: Weather display component (if used)
- **City Data**: `src/data/us_cities.json` - JSON file containing US cities with coordinates




