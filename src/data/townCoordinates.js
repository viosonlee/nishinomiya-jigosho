import addressCoords from './addressCoordinates.json';

/**
 * Get coordinates for a service by exact full address match (町名 + 町名以下).
 * Data is sourced from GSI (国土地理院) which provides highly accurate 
 * block-level (番地/号) geocoding for Japan.
 */
export function getServiceCoordinates(service) {
  const town = service['住所（町名）'] || '';
  const detail = service['住所（町名以下）'] || '';
  const fullAddr = town + detail;

  if (addressCoords[fullAddr]) {
    return addressCoords[fullAddr];
  }

  // Fallback to Nishinomiya city center if new address is added without geocoding
  return { lat: 34.7378, lng: 135.3417 };
}

export default addressCoords;
