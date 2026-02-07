/**
 * Settings Page Component
 * 
 * Allows users to manage their profile settings:
 * - Comfort temperature preference
 * - Saved location
 * - Clothing wardrobe with ratings
 */
import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  Divider,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import citiesData from '../data/us_cities.json';
import { getLocationIcon, LOCATION_ICON_OPTIONS } from '../components/CustomIcons';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Clothing categories
const CATEGORIES = [
  { value: 'base', label: 'Base Layer', emoji: '👕' },
  { value: 'mid', label: 'Mid Layer', emoji: '🧥' },
  { value: 'outer', label: 'Outer Layer', emoji: '🧥' },
  { value: 'bottom', label: 'Bottoms', emoji: '👖' },
  { value: 'accessory', label: 'Accessory', emoji: '🧢' },
];

// Warmth rating colors
const getRatingColor = (rating) => {
  if (rating <= 2) return 'primary';
  if (rating <= 4) return 'success';
  if (rating <= 6) return 'warning';
  if (rating <= 8) return 'danger';
  return 'secondary';
};

export default function Settings() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Form states
  const [comfortTemp, setComfortTemp] = useState('70');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  // Add clothing modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'base',
    warmth_rating: 5.0,
    color: '',
  });

  // Add location modal
  const { isOpen: isLocationOpen, onOpen: onLocationOpen, onClose: onLocationClose } = useDisclosure();
  const [newLocation, setNewLocation] = useState({
    name: '',
    latitude: '',
    longitude: '',
    color: 'primary',
    icon: 'pin',
  });
  const [editingLocationIndex, setEditingLocationIndex] = useState(null);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchSettings(userData.id);
    } else {
      setError('Please log in to view settings');
      setLoading(false);
    }
  }, []);

  // Fetch user settings from API
  const fetchSettings = async (userId) => {
    try {
      const response = await fetch(`${BASE_URL}/settings/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      const data = await response.json();
      setSettings(data);
      
      // Populate form fields
      setComfortTemp(data.comfort_temperature?.toString() || '70');
      setLocationName(data.location_name || '');
      setLatitude(data.saved_latitude?.toString() || '');
      setLongitude(data.saved_longitude?.toString() || '');
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Save settings
  const handleSaveSettings = async () => {
    if (!user) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/settings/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comfort_temperature: parseFloat(comfortTemp),
          location_name: locationName || null,
          saved_latitude: latitude ? parseFloat(latitude) : null,
          saved_longitude: longitude ? parseFloat(longitude) : null,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      const data = await response.json();
      setSettings(data);
      
      // Update localStorage
      const updatedUser = { ...user, comfort_temperature: data.comfort_temperature };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Add clothing item
  const handleAddClothing = async () => {
    if (!user || !newItem.name) return;
    
    try {
      const response = await fetch(`${BASE_URL}/settings/${user.id}/clothing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add clothing item');
      }
      
      const data = await response.json();
      setSettings(data);
      
      // Reset form
      setNewItem({
        name: '',
        category: 'base',
        warmth_rating: 5.0,
        color: '',
      });
      
      onClose();
    } catch (err) {
      console.error('Error adding clothing:', err);
      alert(err.message);
    }
  };

  // Delete clothing item
  const handleDeleteClothing = async (index) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const response = await fetch(`${BASE_URL}/settings/${user.id}/clothing/${index}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete clothing item');
      }
      
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      console.error('Error deleting clothing:', err);
      alert(err.message);
    }
  };

  // Add or update saved location
  const handleSaveLocation = async () => {
    if (!user || !newLocation.name || !newLocation.latitude || !newLocation.longitude) return;
    
    try {
      const locationData = {
        name: newLocation.name,
        latitude: parseFloat(newLocation.latitude),
        longitude: parseFloat(newLocation.longitude),
        color: newLocation.color,
        icon: newLocation.icon,
      };

      const url = editingLocationIndex !== null
        ? `${BASE_URL}/settings/${user.id}/locations/${editingLocationIndex}`
        : `${BASE_URL}/settings/${user.id}/locations`;
      
      const method = editingLocationIndex !== null ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locationData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to save location');
      }
      
      const data = await response.json();
      setSettings(data);
      
      // Reset form
      setNewLocation({ name: '', latitude: '', longitude: '', color: 'primary', icon: 'pin' });
      setEditingLocationIndex(null);
      onLocationClose();
    } catch (err) {
      console.error('Error saving location:', err);
      alert(err.message);
    }
  };

  // Edit saved location
  const handleEditLocation = (index) => {
    const location = settings.saved_locations[index];
    setNewLocation({
      name: location.name,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      color: location.color || 'primary',
      icon: location.icon || 'pin',
    });
    setEditingLocationIndex(index);
    onLocationOpen();
  };

  // Delete saved location
  const handleDeleteLocation = async (index) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this location?')) return;
    
    try {
      const response = await fetch(`${BASE_URL}/settings/${user.id}/locations/${index}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete location');
      }
      
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      console.error('Error deleting location:', err);
      alert(err.message);
    }
  };

  // Handle city selection
  const handleCityChange = (cityIndex) => {
    if (cityIndex === '') {
      setSelectedCity('');
      return;
    }
    const index = parseInt(cityIndex);
    const city = citiesData[index];
    if (city && typeof city.latitude === 'number' && typeof city.longitude === 'number') {
      setSelectedCity(cityIndex);
      setLatitude(city.latitude.toString());
      setLongitude(city.longitude.toString());
      setLocationName(`${city.city}, ${city.state}`);
    }
  };

  // Get current location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(4));
        setLongitude(position.coords.longitude.toFixed(4));
        setLocationName('Current Location');
        setSelectedCity(''); // Clear city selection when using GPS
      },
      (err) => {
        alert('Unable to get location: ' + err.message);
      }
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <p className="text-center">Loading settings...</p>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardBody>
            <p className="text-danger">{error}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">⚙️ My Settings</h1>
      
      {error && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 mb-4">
          <p className="text-danger">{error}</p>
        </div>
      )}
      
      {/* Profile Section */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-semibold">👤 Profile</h2>
        </CardHeader>
        <CardBody className="gap-4">
          <div>
            <p className="text-small text-default-500">Email</p>
            <p className="font-semibold">{user?.email}</p>
          </div>
          <div>
            <p className="text-small text-default-500">Username</p>
            <p className="font-semibold">{user?.username}</p>
          </div>
        </CardBody>
      </Card>
      
      {/* Comfort Temperature */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-semibold">🌡️ Comfort Temperature</h2>
        </CardHeader>
        <CardBody>
          <Input
            type="number"
            label="Comfort Temperature (°F)"
            placeholder="70"
            value={comfortTemp}
            onValueChange={setComfortTemp}
            min="0"
            max="100"
            endContent={<span className="text-default-400">°F</span>}
          />
          <p className="text-small text-default-500 mt-2">
            Your ideal temperature for feeling comfortable
          </p>
        </CardBody>
      </Card>
      
      {/* Location Settings */}
      <Card className="mb-6">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">📍 Saved Location</h2>
          <Button
            size="sm"
            color="primary"
            variant="flat"
            onPress={handleGetLocation}
            startContent="📍"
          >
            Use Current Location
          </Button>
        </CardHeader>
        <CardBody className="gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              Select a City (optional)
            </label>
            <Dropdown>
              <DropdownTrigger>
                <Button 
                  variant="bordered"
                  className="justify-start"
                >
                  {selectedCity && citiesData[parseInt(selectedCity)]
                    ? `${citiesData[parseInt(selectedCity)]?.city}, ${citiesData[parseInt(selectedCity)]?.state}`
                    : "Choose a city"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu 
                aria-label="City selection"
                selectedKeys={selectedCity ? new Set([selectedCity]) : new Set([])}
                selectionMode="single"
                className="max-h-[300px] overflow-y-auto"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0];
                  handleCityChange(selected ? selected.toString() : '');
                }}
              >
                {citiesData.map((city, index) => (
                  <DropdownItem key={index.toString()}>
                    {city.city}, {city.state}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <p className="text-tiny text-default-400">
              Or enter coordinates manually below
            </p>
          </div>

          <Divider />

          <Input
            label="Custom Location Name"
            placeholder="e.g., Home, Work, Office"
            value={locationName}
            onValueChange={(value) => {
              setLocationName(value);
              setSelectedCity(''); // Clear city selection when manually editing
            }}
            description="Give your location a friendly name"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Latitude"
              placeholder="40.7128"
              value={latitude}
              onValueChange={(value) => {
                setLatitude(value);
                if (selectedCity) setSelectedCity(''); // Clear city when manually editing
              }}
              step="0.0001"
            />
            <Input
              type="number"
              label="Longitude"
              placeholder="-74.0060"
              value={longitude}
              onValueChange={(value) => {
                setLongitude(value);
                if (selectedCity) setSelectedCity(''); // Clear city when manually editing
              }}
              step="0.0001"
            />
          </div>
        </CardBody>
      </Card>
      
      {/* Save Button */}
      <div className="flex justify-end mb-6">
        <Button
          color="primary"
          size="lg"
          onPress={handleSaveSettings}
          isLoading={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
      
      <Divider className="my-8" />

      {/* Saved Locations (Quick Access) */}
      <Card className="mb-6">
        <CardHeader className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">⭐ Quick Access Locations</h2>
            <p className="text-small text-default-500 mt-1">
              Save favorite locations with custom colors for quick access on main page
            </p>
          </div>
          <Button
            color="primary"
            onPress={() => {
              setNewLocation({ name: '', latitude: '', longitude: '', color: 'primary' });
              setEditingLocationIndex(null);
              onLocationOpen();
            }}
            startContent={<span>➕</span>}
          >
            Add Location
          </Button>
        </CardHeader>
        <CardBody>
          {settings?.saved_locations && settings.saved_locations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {settings.saved_locations.map((location, index) => {
                const LocationIcon = getLocationIcon(location.icon);
                return (
                <Card key={index} className="border border-divider">
                  <CardBody>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Chip
                            color={location.color || 'primary'}
                            variant="flat"
                            size="lg"
                            startContent={<LocationIcon className="w-4 h-4" />}
                          >
                            <span className="font-semibold text-base">{location.name}</span>
                          </Chip>
                        </div>
                        <p className="text-small text-default-500">
                          📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="flat"
                          onPress={() => handleEditLocation(index)}
                        >
                          ✏️
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          color="danger"
                          variant="light"
                          onPress={() => handleDeleteLocation(index)}
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}
              )}
            </div>
          ) : (
            <p className="text-center text-default-500 py-8">
              No saved locations yet. Add your favorite locations for quick access!
            </p>
          )}
        </CardBody>
      </Card>

      <Divider className="my-8" />
      
      {/* Clothing Wardrobe */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">👕 My Wardrobe</h2>
          <Button
            color="primary"
            onPress={onOpen}
            startContent={<span>➕</span>}
          >
            Add Item
          </Button>
        </CardHeader>
        <CardBody>
          {settings?.clothing_list && settings.clothing_list.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {settings.clothing_list.map((item, index) => (
                <Card key={index} className="border border-divider">
                  <CardBody>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{item.name}</p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <Chip size="sm" variant="flat">
                            {CATEGORIES.find(c => c.value === item.category)?.emoji}{' '}
                            {item.category}
                          </Chip>
                          <Chip
                            size="sm"
                            color={getRatingColor(item.warmth_rating)}
                            variant="flat"
                          >
                            🌡️ {typeof item.warmth_rating === 'number' ? item.warmth_rating.toFixed(1) : item.warmth_rating}/10
                          </Chip>
                          {item.color && (
                            <Chip size="sm" variant="flat">
                              🎨 {item.color}
                            </Chip>
                          )}
                        </div>
                        <div className="flex gap-2 mt-2">
                          {item.windproof && (
                            <Chip size="sm" color="primary" variant="dot">
                              💨 Windproof
                            </Chip>
                          )}
                          {item.rainproof && (
                            <Chip size="sm" color="primary" variant="dot">
                              ☔ Rainproof
                            </Chip>
                          )}
                          {item.insulated && (
                            <Chip size="sm" color="warning" variant="dot">
                              🔥 Insulated
                            </Chip>
                          )}
                        </div>
                      </div>
                      <Button
                        isIconOnly
                        size="sm"
                        color="danger"
                        variant="light"
                        onPress={() => handleDeleteClothing(index)}
                      >
                        🗑️
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-default-500 py-8">
              No clothing items yet. Add your first item!
            </p>
          )}
        </CardBody>
      </Card>
      
      {/* Add Clothing Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add Clothing Item</ModalHeader>
              <ModalBody className="gap-4">
                <Input
                  label="Item Name"
                  placeholder="e.g., Winter Jacket"
                  value={newItem.name}
                  onValueChange={(value) => setNewItem({ ...newItem, name: value })}
                  isRequired
                />
                
                <Select
                  label="Category"
                  selectedKeys={[newItem.category]}
                  onSelectionChange={(keys) => {
                    const category = Array.from(keys)[0];
                    setNewItem({ ...newItem, category });
                  }}
                >
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.emoji} {cat.label}
                    </SelectItem>
                  ))}
                </Select>
                
                <Input
                  type="number"
                  label="Warmth Rating"
                  placeholder="5.0"
                  value={newItem.warmth_rating.toString()}
                  onValueChange={(value) =>
                    setNewItem({ ...newItem, warmth_rating: parseFloat(value) || 5.0 })
                  }
                  min="0"
                  max="10"
                  step="0.1"
                  description="0 = Very light, 10 = Very warm (0.1 increments for wind modifiers)"
                />
                
                <Input
                  label="Color (Optional)"
                  placeholder="e.g., Blue"
                  value={newItem.color}
                  onValueChange={(value) => setNewItem({ ...newItem, color: value })}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleAddClothing}>
                  Add Item
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Add/Edit Location Modal */}
      <Modal isOpen={isLocationOpen} onClose={onLocationClose} size="lg">
        <ModalContent>
          {(onLocationClose) => (
            <>
              <ModalHeader>
                {editingLocationIndex !== null ? 'Edit Location' : 'Add Quick Access Location'}
              </ModalHeader>
              <ModalBody className="gap-4">
                <Input
                  label="Location Name"
                  placeholder="e.g., Home, Office, Beach"
                  value={newLocation.name}
                  onValueChange={(value) => setNewLocation({ ...newLocation, name: value })}
                  isRequired
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    label="Latitude"
                    placeholder="40.7128"
                    value={newLocation.latitude}
                    onValueChange={(value) => setNewLocation({ ...newLocation, latitude: value })}
                    isRequired
                    step="0.0001"
                  />
                  <Input
                    type="number"
                    label="Longitude"
                    placeholder="-74.0060"
                    value={newLocation.longitude}
                    onValueChange={(value) => setNewLocation({ ...newLocation, longitude: value })}
                    isRequired
                    step="0.0001"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">Icon</label>
                  <div className="flex gap-2 flex-wrap">
                    {LOCATION_ICON_OPTIONS.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <Button
                          key={option.value}
                          variant={newLocation.icon === option.value ? 'solid' : 'bordered'}
                          color={newLocation.icon === option.value ? 'primary' : 'default'}
                          size="sm"
                          onPress={() => setNewLocation({ ...newLocation, icon: option.value })}
                          startContent={<IconComponent className="w-4 h-4" />}
                        >
                          {option.label}
                        </Button>
                      );
                    })}
                  </div>
                  <p className="text-tiny text-default-400 mt-2">
                    Choose an icon that represents this location
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">Button Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {['primary', 'success', 'warning', 'danger', 'secondary'].map((color) => (
                      <Button
                        key={color}
                        color={color}
                        variant={newLocation.color === color ? 'solid' : 'bordered'}
                        size="sm"
                        onPress={() => setNewLocation({ ...newLocation, color })}
                      >
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                      </Button>
                    ))}
                  </div>
                  <p className="text-tiny text-default-400 mt-2">
                    This color will be used for the quick-access button on the main page
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onLocationClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleSaveLocation}>
                  {editingLocationIndex !== null ? 'Update' : 'Add'} Location
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

