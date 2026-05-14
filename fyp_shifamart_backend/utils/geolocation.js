/**
 * Geolocation Utility Functions
 * For calculating distances and handling location-based queries
 */

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in km
}

/**
 * Convert address to approximate coordinates (MOCK)
 * In production, use geocoding service like Google Maps API
 * @param {string} city - City name
 * @returns {object} {latitude, longitude}
 */
function getPakistaniCityCoordinates(city) {
  const cityCoordinates = {
    rawalpindi: { latitude: 33.5746, longitude: 74.3394 },
    islamabad: { latitude: 33.7294, longitude: 73.1883 },
    lahore: { latitude: 31.5204, longitude: 74.3587 },
    karachi: { latitude: 24.8607, longitude: 67.0011 },
    multan: { latitude: 30.1575, longitude: 71.4454 },
    faisalabad: { latitude: 31.4182, longitude: 72.3345 },
    peshawar: { latitude: 34.0151, longitude: 71.5790 },
    quetta: { latitude: 30.1798, longitude: 67.0096 },
    hyderabad: { latitude: 25.3960, longitude: 68.4719 },
    gujranwala: { latitude: 32.1814, longitude: 74.1986 },
    sialkot: { latitude: 32.4917, longitude: 74.5245 },
    jhang: { latitude: 31.2773, longitude: 72.3192 },
    sargodha: { latitude: 32.0815, longitude: 72.6711 },
    bahawalpur: { latitude: 29.3956, longitude: 71.6722 }
  };
  
  const normalizedCity = city.toLowerCase().replace(/\s+/g, '');
  
  if (cityCoordinates[normalizedCity]) {
    return cityCoordinates[normalizedCity];
  }
  
  // Default to Islamabad if city not found
  console.warn(`City '${city}' not found. Using Islamabad as default.`);
  return cityCoordinates.islamabad;
}

/**
 * Format distance for display
 * @param {number} distanceKm - Distance in kilometers
 * @returns {string} Formatted distance string
 */
function formatDistance(distanceKm) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Validate coordinates
 * @param {number} latitude - Latitude value
 * @param {number} longitude - Longitude value
 * @returns {boolean} Whether coordinates are valid
 */
function isValidCoordinates(latitude, longitude) {
  return (
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180
  );
}

/**
 * Convert GeoJSON format to readable object
 * @param {object} geoJSON - GeoJSON object {type: 'Point', coordinates: [lon, lat]}
 * @returns {object} {latitude, longitude}
 */
function geoJSONToCoordinates(geoJSON) {
  if (!geoJSON || !geoJSON.coordinates || geoJSON.coordinates.length !== 2) {
    return null;
  }
  
  return {
    longitude: geoJSON.coordinates[0],
    latitude: geoJSON.coordinates[1]
  };
}

/**
 * Convert coordinates to GeoJSON format
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {object} GeoJSON object
 */
function coordinatesToGeoJSON(latitude, longitude) {
  if (!isValidCoordinates(latitude, longitude)) {
    throw new Error('Invalid coordinates');
  }
  
  return {
    type: 'Point',
    coordinates: [longitude, latitude] // GeoJSON uses [longitude, latitude]
  };
}

module.exports = {
  calculateDistance,
  getPakistaniCityCoordinates,
  formatDistance,
  isValidCoordinates,
  geoJSONToCoordinates,
  coordinatesToGeoJSON
};
