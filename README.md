# Weather-Based Clothing Recommendation System

A monorepo containing a React frontend and FastAPI backend for weather-based clothing recommendations.

## Project Structure

```
project-root/
├── frontend/          # React + Vite frontend
├── backend/           # FastAPI backend
├── shared/            # Shared schemas and documentation
└── docker-compose.yml # Optional Docker setup
```

## Quick Start

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

4. Run the server:
```bash
uvicorn app.web:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env` and set:
```
VITE_API_URL=http://127.0.0.1:8000
```

4. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

- `GET /health` - Health check
- `GET /score` - Get clothing recommendations (query params: latitude, longitude, comfort_temperature)
- `POST /score` - Get clothing recommendations (JSON body)
- `GET /weather/current` - Get current weather conditions
- `GET /recommendations` - Alias for `/score`

### Request Parameters

- `latitude` (required): Latitude coordinate (-90 to 90)
- `longitude` (required): Longitude coordinate (-180 to 180)
- `comfort_temperature` (optional): Your personal comfort temperature in Fahrenheit (50-90°F). Defaults to 70°F if not provided.

### Response Format

The API returns:
- `weather`: Current weather conditions (temperature, wind speed, forecast, location)
- `comfort_score`: Calculated comfort score (higher = more comfortable)
- `clothing_recommendations`: List of recommended clothing items with properties (name, category, windproof, rainproof, insulated)
- `location`: Input coordinates

## Development Workflow

1. Start the backend on port 8000
2. Start the frontend on port 5173
3. The frontend will proxy API requests to the backend (configured in `vite.config.js`)

## Docker (Optional)

To run with Docker Compose:

```bash
docker-compose up
```

This will start:
- FastAPI backend on port 8000
- PostgreSQL database on port 5432

## Features

- 🌤️ **Real-time Weather Data**: Fetches current weather conditions from the official NWS API
- 📊 **Comfort Scoring**: Calculates a comfort score based on temperature, wind speed, and forecast conditions
- 👕 **Smart Recommendations**: Suggests appropriate clothing layers (base, mid, outer, shells) and accessories
- 🌡️ **Temperature-Based Layering**: Calculates clothing layers based on temperature deviation from your comfort temperature
- 💨 **Wind-Aware Recommendations**: Automatically adds layers and selects windproof outerwear when wind speed exceeds 15 mph
- 🔧 **Configurable**: Customize comfort temperature, forecast scoring, and clothing options

### Clothing Recommendation Algorithm

The system uses a temperature deviation-based approach to determine the number of clothing layers needed:

**Base Layer Calculation:**
- Starts with 1 base layer
- Adds 1 layer for every 20°F decrease below your comfort temperature
- Formula: `layers = 1 + floor((comfort_temp - actual_temp) / 20)`

**Wind Adjustment:**
- Adds 1 layer for every 5 mph of wind speed
- Formula: `wind_layers = floor(wind_speed / 5)`
- Automatically selects windproof outer layers when wind > 15 mph

**Example:**
- Temperature: 43°F, Wind: 20 mph, Comfort Temp: 70°F
- Temperature deviation: 70 - 43 = 27°F
- Base layers: 1 + floor(27/20) = 2 layers
- Wind adjustment: floor(20/5) = 4 layers
- **Result: 6 layers** → tee + sweater + windproof jacket + additional layers

## Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/
```

### Frontend Tests
(Add your frontend test commands here)

## Deployment

- **Frontend**: Build static assets (`npm run build`) and serve via CDN or behind the API
- **Backend**: Deploy FastAPI separately as an API service
- **Secrets**: Keep secrets in environment variables, not in the repo

## License

[Add your license information here]

## Contributing

[Add contribution guidelines here]
