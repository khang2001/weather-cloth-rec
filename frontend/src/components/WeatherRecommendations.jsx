/**
 * WeatherRecommendations Component
 * 
 * Main UI component that displays the form for entering location coordinates,
 * city selection dropdown, and displays weather information and clothing recommendations.
 * Uses HeroUI components for a modern, beautiful interface.
 */
import { Button } from "@heroui/button";
import { Input } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Spinner } from "@heroui/react";
import { Divider } from "@heroui/react";
import { Alert } from "@heroui/react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import WeatherCard from "./WeatherCard";
import { getLocationIcon } from "./CustomIcons";
import CurrentLocationDisplay from "./CurrentLocationDisplay";

function WeatherRecommendations({
  currentLocation,
  locationLoading,
  locationError,
  getCurrentLocation,
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  comfortTemp,
  setComfortTemp,
  handleSubmit,
  loading,
  error,
  result,
  weather,
  clothing,
  cities,
  selectedCity,
  onCityChange,
  savedLocations = [],
  onQuickLocation,
  currentCityDisplay,
}) {
  /**
   * Handle latitude input change.
   * Clears city selection if user manually edits coordinates.
   */
  const handleLatitudeChange = (e) => {
    setLatitude(e.target.value);
    if (selectedCity !== "") {
      onCityChange(""); // Clear city selection when manually editing coordinates
    }
  };

  /**
   * Handle longitude input change.
   * Clears city selection if user manually edits coordinates.
   */
  const handleLongitudeChange = (e) => {
    setLongitude(e.target.value);
    if (selectedCity !== "") {
      onCityChange(""); // Clear city selection when manually editing coordinates
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Current Location Section */}
      {currentLocation && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-xl">📍</span>
              Current Location
            </h2>
            <p className="text-small text-default-500">
              Latitude: {currentLocation.latitude.toFixed(6)}, Longitude:{" "}
              {currentLocation.longitude.toFixed(6)}
            </p>
          </div>
          <Button
            color="primary"
            variant="flat"
            onPress={getCurrentLocation}
            isLoading={locationLoading}
            startContent={!locationLoading && "🔄"}
            className="w-fit"
          >
            {locationLoading ? "Getting Location..." : "Refresh Location"}
          </Button>
          <Divider />
        </div>
      )}

      {/* Location Loading State */}
      {locationLoading && !currentLocation && (
        <Alert
          color="primary"
          variant="flat"
          startContent={<Spinner size="sm" />}
        >
          Getting your current location...
        </Alert>
      )}

      {/* Location Error */}
      {locationError && (
        <Alert
          color="danger"
          variant="flat"
          title="Location Error"
          action={
            <Button
              size="sm"
              color="danger"
              variant="light"
              onPress={getCurrentLocation}
            >
              Try Again
            </Button>
          }
        >
          {locationError}
        </Alert>
      )}

      {/* Input Form Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="text-2xl">🌡️</span>
          Get Weather Recommendations
        </h2>
        <Divider />
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Quick Access Locations */}
            {savedLocations && savedLocations.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">
                  ⭐ Quick Access Locations
                </label>
                <div className="flex gap-2 flex-wrap">
                  {savedLocations.map((location, index) => {
                    const LocationIcon = getLocationIcon(location.icon);
                    return (
                      <Button
                        key={index}
                        color={location.color || 'primary'}
                        variant="flat"
                        size="md"
                        onPress={() => onQuickLocation(location)}
                        startContent={<LocationIcon className="w-4 h-4" />}
                      >
                        {location.name}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Select a City (optional)
              </label>
              <Dropdown>
                <DropdownTrigger>
                  <Button 
                    variant="solid" 
                    color="primary"
                    className="capitalize w-fit"
            
                  >
                    {selectedCity && cities[parseInt(selectedCity)]
                      ? `${cities[parseInt(selectedCity)]?.city}, ${cities[parseInt(selectedCity)]?.state}`
                      : "Choose a city"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu 
                  aria-label="City selection"
                  selectedKeys={selectedCity ? new Set([selectedCity]) : new Set([])}
                  selectionMode="single"
                  variant="solid"
                  className="max-h-[300px] overflow-y-auto"
                  classNames={{
                    base: "bg-content1",
                    list: "bg-content1"
                  }}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0];
                    onCityChange(selected ? selected.toString() : "");
                  }}
                >
                  {cities.map((city, index) => (
                    <DropdownItem key={index.toString()}>
                      {city.city}, {city.state}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>

            {/* Current City Display */}
            <CurrentLocationDisplay currentCityDisplay={currentCityDisplay} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Latitude"
                type="number"
                step="any"
                min="-90"
                max="90"
                value={latitude}
                onChange={handleLatitudeChange}
                isRequired
                placeholder="e.g., 40.7128"
              />

              <Input
                label="Longitude"
                type="number"
                step="any"
                min="-180"
                max="180"
                value={longitude}
                onChange={handleLongitudeChange}
                isRequired
                placeholder="e.g., -74.0060"
              />
            </div>

            <Input
              label="Comfort Temperature (°F)"
              type="number"
              step="any"
              min="0"
              max="100"
              value={comfortTemp}
              onChange={(e) => setComfortTemp(e.target.value)}
              placeholder="70"
              description="Your preferred comfortable temperature"
            />

          <Button
            type="submit"
            color="primary"
            size="lg"
            isLoading={loading}
            className="w-fit self-center"
          >
            {loading ? "Loading..." : "Get Recommendations"}
          </Button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <Alert color="danger" variant="flat" title="Error">
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Alert
          color="primary"
          variant="flat"
          startContent={<Spinner size="sm" />}
        >
          Fetching weather data...
        </Alert>
      )}

      {/* Results */}
      {result && weather && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weather Info Card */}
          <WeatherCard weather={weather} />

          {/* Recommendations Section */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <span className="text-2xl">👔</span>
              Recommendations
            </h3>
            <Divider />
              {/* Comfort Score */}
              <div className="flex flex-col gap-2 p-4 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg border border-primary-200 dark:border-primary-800">
                <span className="text-default-600 font-medium">Comfort Score</span>
                <div className="text-5xl font-bold text-primary">
                  {typeof result.comfort_score === "number"
                    ? result.comfort_score.toFixed(1)
                    : result.comfort_score}
                </div>
              </div>

              <Divider />

              {/* Clothing Recommendations */}
              <div className="flex flex-col gap-3">
                <span className="text-default-600 font-semibold text-base">
                  Recommended Clothing
                </span>
                <div className="flex flex-col gap-3">
                  {clothing.map((item, i) => (
                    <div
                      key={i}
                      className="p-4 bg-default-50 dark:bg-default-100/50 rounded-lg border border-divider hover:border-default-400 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">
                            {item.category === "base" && "👕"}
                            {item.category === "mid" && "🧥"}
                            {item.category === "outer" && "🧥"}
                            {item.category === "shell" && "🧥"}
                            {!["base", "mid", "outer", "shell"].includes(
                              item.category
                            ) && "👔"}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-semibold text-base">{item.name}</span>
                            <span className="text-small text-default-500 capitalize">
                              {item.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-wrap justify-end">
                          {item.rainproof && (
                            <Chip size="sm" color="success" variant="flat">
                              Rainproof
                            </Chip>
                          )}
                          {item.windproof && (
                            <Chip size="sm" color="warning" variant="flat">
                              Windproof
                            </Chip>
                          )}
                          {item.insulated && (
                            <Chip size="sm" color="secondary" variant="flat">
                              Insulated
                            </Chip>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          </div>
        </div>
      )}

      {/* Debug Info (if weather data is missing) */}
      {result && !weather && (
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-semibold text-warning flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            Debug: Received Data
          </h3>
          <Divider />
          <p className="text-default-500">
            The server responded, but the data structure is unexpected.
          </p>
          <pre className="bg-default-100 dark:bg-default-200 p-4 rounded-lg overflow-auto text-sm border border-default-200">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default WeatherRecommendations;
