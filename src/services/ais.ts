import type { AisShip } from '@/types/osint'

/**
 * Simulerte AIS-skip i Oslofjorden.
 * Ekte AIS krever aisstream.io API-nøkkel + WebSocket.
 * Disse er realistiske skip med autentiske norske skipsnavn og ruter.
 */
const BASE_SHIPS: AisShip[] = [
  { mmsi: '257123450', name: 'COLOR FANTASY',    lat: 59.8923, lng: 10.6234, heading: 342, speedKnots: 18.4, shipType: 'passenger' },
  { mmsi: '257234561', name: 'PRINSESSE RAGNHILD',lat: 59.7123, lng: 10.5812, heading: 15,  speedKnots: 14.2, shipType: 'passenger' },
  { mmsi: '257345672', name: 'OSLO BULK',         lat: 59.6234, lng: 10.6123, heading: 5,   speedKnots: 9.1,  shipType: 'cargo' },
  { mmsi: '257456783', name: 'FJORDGLIMT',        lat: 59.8456, lng: 10.7123, heading: 190, speedKnots: 11.3, shipType: 'cargo' },
  { mmsi: '257567894', name: 'HØVDINGEN',         lat: 59.9023, lng: 10.7012, heading: 270, speedKnots: 3.2,  shipType: 'tug' },
  { mmsi: '257678905', name: 'MS NESODD',         lat: 59.8712, lng: 10.6678, heading: 320, speedKnots: 8.7,  shipType: 'passenger' },
  { mmsi: '257789016', name: 'KORSFJORD TANKER',  lat: 59.5934, lng: 10.5678, heading: 8,   speedKnots: 7.4,  shipType: 'tanker' },
  { mmsi: '257890127', name: 'OSLO BUGSÉR 2',     lat: 59.9084, lng: 10.7234, heading: 130, speedKnots: 2.1,  shipType: 'tug' },
  { mmsi: '257901238', name: 'DRAMMEN EXPRESS',   lat: 59.7456, lng: 10.5234, heading: 345, speedKnots: 12.8, shipType: 'cargo' },
  { mmsi: '258012349', name: 'BÆRUM SUPPLY',      lat: 59.8234, lng: 10.5901, heading: 22,  speedKnots: 6.3,  shipType: 'other' },
]

/** Legg til litt bevegelse basert på heading + hastighet */
function drift(ship: AisShip): AisShip {
  const deg2rad  = Math.PI / 180
  const knotsToMs = 0.514444
  const dtSec    = 300 + Math.random() * 300   // 5–10 min simulert
  const speed    = ship.speedKnots * knotsToMs
  const dist     = (speed * dtSec) / 6_371_000  // buelengde i radianer
  const lat = ship.lat + dist * Math.cos(ship.heading * deg2rad) * (180 / Math.PI)
  const lng = ship.lng + dist * Math.sin(ship.heading * deg2rad) * (180 / Math.PI) / Math.cos(ship.lat * deg2rad)
  return { ...ship, lat, lng }
}

let cached: AisShip[] = BASE_SHIPS

/**
 * Returnerer AIS-skip med litt simulert bevegelse siden forrige kall.
 * Med ekte aisstream.io-nøkkel kan dette byttes mot WebSocket.
 */
export function fetchAisShips(): AisShip[] {
  cached = cached.map(drift)
  return cached
}
