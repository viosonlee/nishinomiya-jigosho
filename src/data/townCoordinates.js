import addressCoords from './addressCoordinates.json';

/**
 * Fallbacks for addresses that failed geocoding
 */
const FALLBACKS = {
  '建石町６丁目21-1F': { lat: 34.7330, lng: 135.3330 }, // Approximate coordinates for 建石町
};

/**
 * Get coordinates for a service by exact full address match (町名 + 町名以下).
 */
export function getServiceCoordinates(service) {
  const town = service['住所（町名）'] || '';
  const detail = service['住所（町名以下）'] || '';
  const fullAddr = town + detail;

  if (addressCoords[fullAddr]) {
    return addressCoords[fullAddr];
  }
  
  if (FALLBACKS[fullAddr]) {
    return FALLBACKS[fullAddr];
  }

  // Fallback to Nishinomiya city center
  return { lat: 34.7378, lng: 135.3417 };
}

export default addressCoords;
