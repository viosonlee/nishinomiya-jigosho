/**
 * Geocode all unique FULL addresses (町名+番地) from services.json
 * using Japan's Geospatial Information Authority (GSI - 国土地理院) API.
 *
 * GSI provides highly accurate block-level (番地/号) geocoding for Japan.
 * 
 * Usage: node scripts/geocode-addresses-gsi.mjs
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

// Extract unique full addresses (町名 + 町名以下)
// Note: Some addresses contain building names which might confuse the geocoder.
// GSI is usually smart enough, but stripping known building parts can help if they fail.
const uniqueAddresses = [...new Set(
  allServices
    .map(s => {
      const town = s['住所（町名）'] || '';
      let detail = s['住所（町名以下）'] || '';
      // Minimal cleaning: remove trailing building names or spaces if needed,
      // but GSI handles full addresses surprisingly well. We'll try raw first.
      return town + detail;
    })
    .filter(Boolean)
)].sort();

console.log(`Found ${uniqueAddresses.length} unique full addresses to geocode via GSI.\n`);

async function geocode(address) {
  const fullAddress = `${NISHINOMIYA_PREFIX}${address}`;
  const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(fullAddress)}`;

  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  
  if (data && data.length > 0) {
    // GSI returns [lng, lat]
    const [lng, lat] = data[0].geometry.coordinates;
    return {
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6)),
    };
  }
  return null;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const results = {};
  let success = 0;
  let failed = 0;
  const failedList = [];

  for (let i = 0; i < uniqueAddresses.length; i++) {
    let addr = uniqueAddresses[i];
    process.stdout.write(`[${i + 1}/${uniqueAddresses.length}] ${addr} ... `);

    // Clean address (remove building names, "号室", "階", etc.) to improve hit rate
    // e.g. "下大市東町１３ー８ 門戸グリーンビル２階C号室" -> "下大市東町１３ー８"
    let cleanAddr = addr.replace(/\s+.*$/, ''); // Remove anything after a space
    cleanAddr = cleanAddr.replace(/([0-9０-９]+(?:-[0-9０-９]+)*).*$/, '$1'); // Keep only up to the last hyphenated number block if it has extra fluff
    // Wait, regex might be too aggressive. Let's try raw first, if fails try clean.
    
    let coords = await geocode(addr);
    
    if (!coords) {
      // Fallback: try cleaned address
      let fallbackAddr = addr.split(/[\s　]/)[0]; // split by space or full-width space
      if (fallbackAddr !== addr) {
        process.stdout.write(` (Retry: ${fallbackAddr}) ... `);
        coords = await geocode(fallbackAddr);
      }
    }

    if (coords) {
      results[addr] = coords; // Store with original full address as key
      console.log(`✓ (${coords.lat}, ${coords.lng})`);
      success++;
    } else {
      console.log('✗ NOT FOUND');
      failed++;
      failedList.push(addr);
    }

    // Be nice to GSI API
    await sleep(200);
  }

  console.log(`\n--- Results ---`);
  console.log(`Geocoding: ${success}/${uniqueAddresses.length} succeeded`);

  writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`Written to: ${OUTPUT_PATH}`);

  if (failed > 0) {
    console.log(`\n⚠ Failed addresses (you may need to add manual fallbacks):`);
    failedList.forEach(a => console.log(`  - ${a}`));
  }
}

main().catch(console.error);
