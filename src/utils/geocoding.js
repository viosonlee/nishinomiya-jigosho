// Geocoding utility using Nominatim (OpenStreetMap) with localStorage caching

const CACHE_KEY = 'nishinomiya_geocode_cache';
const NISHINOMIYA_PREFIX = '兵庫県西宮市';

// Pre-defined coordinates for known areas in Nishinomiya
// These serve as fallbacks when geocoding fails
const AREA_COORDINATES = {
  '名塩': { lat: 34.8371, lng: 135.3208 },
  '生瀬': { lat: 34.8319, lng: 135.3249 },
  '塩瀬': { lat: 34.8350, lng: 135.3230 },
  '山口': { lat: 34.8173, lng: 135.2990 },
  '甲東園': { lat: 34.7683, lng: 135.3588 },
  '門戸': { lat: 34.7637, lng: 135.3514 },
  '上ヶ原': { lat: 34.7725, lng: 135.3480 },
  '甲陽園': { lat: 34.7700, lng: 135.3394 },
  '苦楽園': { lat: 34.7650, lng: 135.3320 },
  '夙川': { lat: 34.7461, lng: 135.3283 },
  '西宮北口': { lat: 34.7467, lng: 135.3597 },
  '今津': { lat: 34.7333, lng: 135.3556 },
  '鳴尾': { lat: 34.7260, lng: 135.3680 },
  '甲子園': { lat: 34.7217, lng: 135.3614 },
  '武庫川': { lat: 34.7333, lng: 135.3783 },
  '仁川': { lat: 34.7817, lng: 135.3594 },
  '瓦木': { lat: 34.7561, lng: 135.3700 },
  '津門': { lat: 34.7400, lng: 135.3450 },
  '用海': { lat: 34.7350, lng: 135.3417 },
  '浜脇': { lat: 34.7367, lng: 135.3350 },
  '広田': { lat: 34.7583, lng: 135.3400 },
  '高木': { lat: 34.7500, lng: 135.3500 },
  '大社': { lat: 34.7450, lng: 135.3300 },
  '安井': { lat: 34.7430, lng: 135.3340 },
  '高須': { lat: 34.7200, lng: 135.3750 },
  '南甲子園': { lat: 34.7150, lng: 135.3600 },
  '甲子園口': { lat: 34.7400, lng: 135.3800 },
  '上甲子園': { lat: 34.7350, lng: 135.3700 },
  '段上': { lat: 34.7670, lng: 135.3660 },
  '樋ノ口': { lat: 34.7530, lng: 135.3730 },
  '松山': { lat: 34.7400, lng: 135.3600 },
  '田近野': { lat: 34.7520, lng: 135.3650 },
  '荒木': { lat: 34.7460, lng: 135.3640 },
  '小松': { lat: 34.7390, lng: 135.3580 },
  '下大市': { lat: 34.7620, lng: 135.3570 },
  '上大市': { lat: 34.7680, lng: 135.3550 },
  '神呪': { lat: 34.7670, lng: 135.3520 },
  '能登': { lat: 34.7350, lng: 135.3350 },
  '戸田': { lat: 34.7300, lng: 135.3410 },
  '神祇官': { lat: 34.7480, lng: 135.3350 },
  '池田': { lat: 34.7450, lng: 135.3580 },
  '上鳴尾': { lat: 34.7310, lng: 135.3700 },
  '学文殿': { lat: 34.7280, lng: 135.3650 },
  '里中': { lat: 34.7250, lng: 135.3620 },
  '小曽根': { lat: 34.7230, lng: 135.3680 },
  '笠屋': { lat: 34.7210, lng: 135.3750 },
  '花園': { lat: 34.7380, lng: 135.3560 },
  '中屋': { lat: 34.7370, lng: 135.3530 },
  '柳本': { lat: 34.7360, lng: 135.3500 },
  '分銅': { lat: 34.7410, lng: 135.3420 },
  '与古道': { lat: 34.7420, lng: 135.3440 },
  '産所': { lat: 34.7430, lng: 135.3390 },
  '石在': { lat: 34.7440, lng: 135.3360 },
  '城ヶ堀': { lat: 34.7410, lng: 135.3460 },
  '馬場': { lat: 34.7390, lng: 135.3480 },
  '六湛寺': { lat: 34.7380, lng: 135.3430 },
  '社家': { lat: 34.7430, lng: 135.3310 },
  '越水': { lat: 34.7380, lng: 135.3380 },
  '中前田': { lat: 34.7340, lng: 135.3350 },
  '田中': { lat: 34.7310, lng: 135.3380 },
};

/**
 * Load geocode cache from localStorage
 */
function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Save geocode cache to localStorage
 */
function saveCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage might be full, silently ignore
  }
}

/**
 * Try to find area coordinates by matching address against known area names.
 */
function findAreaCoordinates(address) {
  for (const [area, coords] of Object.entries(AREA_COORDINATES)) {
    if (address.includes(area)) {
      return coords;
    }
  }
  return null;
}

/**
 * Geocode a single address using Nominatim API.
 * Returns { lat, lng } or null.
 */
async function geocodeAddress(address) {
  const fullAddress = `${NISHINOMIYA_PREFIX}${address}`;
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&countrycodes=jp`,
      {
        headers: {
          'Accept-Language': 'ja',
        },
      }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get coordinates for a service, using cache and fallbacks.
 */
export async function getServiceCoordinates(service) {
  const townName = service['住所（町名）'] || '';
  const townDetail = service['住所（町名以下）'] || '';
  const address = `${townName}${townDetail}`;
  
  if (!address) return null;
  
  // Check cache first
  const cache = loadCache();
  if (cache[address]) {
    return cache[address];
  }
  
  // Try area-based fallback (faster, no API call)
  const areaCoords = findAreaCoordinates(address);
  if (areaCoords) {
    cache[address] = areaCoords;
    saveCache(cache);
    return areaCoords;
  }
  
  // Try geocoding API
  const coords = await geocodeAddress(address);
  if (coords) {
    cache[address] = coords;
    saveCache(cache);
    return coords;
  }
  
  return null;
}

/**
 * Batch geocode services with rate limiting.
 * Returns a Map of service index -> { lat, lng }.
 */
export async function batchGeocodeServices(services) {
  const cache = loadCache();
  const results = new Map();
  const toGeocode = [];
  
  // First pass: use cache and area fallbacks
  for (let i = 0; i < services.length; i++) {
    const service = services[i];
    const townName = service['住所（町名）'] || '';
    const townDetail = service['住所（町名以下）'] || '';
    const address = `${townName}${townDetail}`;
    
    if (!address) continue;
    
    if (cache[address]) {
      results.set(i, cache[address]);
      continue;
    }
    
    const areaCoords = findAreaCoordinates(address);
    if (areaCoords) {
      cache[address] = areaCoords;
      results.set(i, areaCoords);
      continue;
    }
    
    toGeocode.push({ index: i, address });
  }
  
  // Save any new area-based results
  saveCache(cache);
  
  // Second pass: geocode remaining (with rate limit of 1 req/sec for Nominatim)
  for (const { index, address } of toGeocode) {
    const coords = await geocodeAddress(address);
    if (coords) {
      const currentCache = loadCache();
      currentCache[address] = coords;
      saveCache(currentCache);
      results.set(index, coords);
    }
    // Nominatim rate limit: max 1 request per second
    await new Promise(resolve => setTimeout(resolve, 1100));
  }
  
  return results;
}

/**
 * Calculate distance between two coordinates using Haversine formula.
 * Returns distance in kilometers.
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Format distance for display.
 */
export function formatDistance(km) {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}
