/**
 * WeatherCard Component
 * 
 * Displays weather information in a card format using HeroUI components.
 * Shows location, temperature, wind speed, and forecast description.
 * 
 * @param {object} props - Component props
 * @param {object|null} props.weather - Weather data object containing:
 *   - location: City and state name (string)
 *   - temp_f: Temperature in Fahrenheit (number)
 *   - wind_mph: Wind speed in mph (number)
 *   - short_forecast: Forecast description (string)
 * 
 * @returns {JSX.Element|null} Weather card component or null if weather data is missing
 */
import { Card, CardHeader, CardBody, Divider } from "@heroui/react";

export default function WeatherCard({ weather }) {
  // Don't render if weather data is not available
  if (!weather) return null;

  return (
    <Card 
      isHoverable
      shadow="md"
      radius="lg"
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌤️</span>
          <h3 className="text-xl font-semibold">Weather Information</h3>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="gap-3 pt-4">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-default-500">Location:</span>
            <span className="font-semibold text-lg">{weather.location}</span>
          </div>
          <Divider />
          <div className="flex justify-between items-center">
            <span className="text-default-500">Temperature:</span>
            <span className="font-bold text-3xl text-primary">
              {weather.temp_f}°F
            </span>
          </div>
          <Divider />
          <div className="flex justify-between items-center">
            <span className="text-default-500">Wind Speed:</span>
            <span className="font-semibold text-lg">{weather.wind_mph} mph</span>
          </div>
          <Divider />
          <div className="flex flex-col gap-2 pt-1">
            <span className="text-default-500">Forecast:</span>
            <span className="font-medium text-base leading-relaxed">{weather.short_forecast}</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}




