/**
 * Geocode all unique town names (住所（町名）) from services.json
 * using Nominatim (OpenStreetMap) API.
 *
 * Note: Nominatim does NOT support Japanese street-level addresses (番地).
 * Town-level (町名) is the highest precision available.
 *
 * Usage: node scripts/geocode-towns.mjs
 * Output: src/data/addressCoordinates.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVICES_PATH = resolve(__dirname, '../src/data/services.json');
const OUTPUT_PATH = resolve(__dirname, '../src/data/addressCoordinates.json');

const NISHINOMIYA_PREFIX = '兵庫県西宮市';

const servicesData = JSON.parse(readFileSync(SERVICES_PATH, 'utf-8'));
const allServices = Object.values(servicesData).flat();
const uniqueTowns = [...new Set(allServices.map(s => s['住所（町名）']).filter(Boolean))].sort();

console.log(`Found ${uniqueTowns.length} unique town names to geocode.\n`);

async function geocode(townName) {
  const fullAddress = `${NISHINOMIYA_PREFIX}${townName}`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&countrycodes=jp`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'NishinomiyaJigosho/1.0', 'Accept-Language': 'ja' },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.length > 0) {
    return {
      lat: parseFloat(parseFloat(data[0].lat).toFixed(6)),
      lng: parseFloat(parseFloat(data[0].lon).toFixed(6)),
    };
  }
  return null;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  // Build a map: townName -> coordinates
  const townCoords = {};
  let success = 0;
  let failed = 0;
  const failedList = [];

  for (let i = 0; i < uniqueTowns.length; i++) {
    const town = uniqueTowns[i];
    process.stdout.write(`[${i + 1}/${uniqueTowns.length}] ${town} ... `);
    const coords = await geocode(town);
    if (coords) {
      townCoords[town] = coords;
      console.log(`✓ (${coords.lat}, ${coords.lng})`);
      success++;
    } else {
      console.log('✗ NOT FOUND');
      failed++;
      failedList.push(town);
    }
    if (i < uniqueTowns.length - 1) await sleep(1100);
  }

  // Now build the final map: full address -> coordinates
  // Each service's full address gets the coordinates of its town
  const addressCoords = {};
  for (const service of allServices) {
    const town = service['住所（町名）'] || '';
    const detail = service['住所（町名以下）'] || '';
    const fullAddr = town + detail;
    if (!fullAddr || addressCoords[fullAddr]) continue;
    if (townCoords[town]) {
      addressCoords[fullAddr] = townCoords[town];
    }
  }

  console.log(`\n--- Results ---`);
  console.log(`Town geocoding: ${success}/${uniqueTowns.length} succeeded`);
  console.log(`Address entries: ${Object.keys(addressCoords).length}`);

  writeFileSync(OUTPUT_PATH, JSON.stringify(addressCoords, null, 2), 'utf-8');
  console.log(`Written to: ${OUTPUT_PATH}`);

  if (failed > 0) {
    console.log(`\n⚠ Failed town names (need manual coordinates):`);
    failedList.forEach(t => console.log(`  - ${t}`));
  }
}

main().catch(console.error);
