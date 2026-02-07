/**
 * CurrentLocationDisplay Component
 * 
 * Shows the currently selected/viewed location prominently.
 * Displays location name, coordinates, and an icon.
 */
import { Card, CardBody, Chip } from "@heroui/react";
import { getLocationIcon } from "./CustomIcons";

export default function CurrentLocationDisplay({ currentCityDisplay }) {
  // Don't render if no location is selected
  if (!currentCityDisplay) {
    return null;
  }

  const LocationIcon = getLocationIcon(currentCityDisplay.icon);

  return (
    <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-success/5">
      <CardBody>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full bg-${currentCityDisplay.color}/10`}>
              <LocationIcon className={`w-8 h-8 text-${currentCityDisplay.color}`} />
            </div>
            <div>
              <p className="text-tiny text-default-500 uppercase font-semibold">
                Currently Viewing
              </p>
              <h2 className="text-2xl font-bold text-foreground">
                {currentCityDisplay.name}
              </h2>
              <p className="text-small text-default-500 mt-1">
                📍 {currentCityDisplay.coordinates}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {currentCityDisplay.isGPS && (
              <Chip 
                color="success" 
                variant="flat" 
                size="sm"
                startContent={
                  <svg 
                    className="w-4 h-4" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                  </svg>
                }
              >
                GPS Location
              </Chip>
            )}
            <Chip 
              color={currentCityDisplay.color} 
              variant="dot" 
              size="sm"
            >
              Active
            </Chip>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

