import { logger } from '@/lib/logger'
import { OSLO_DISTRICTS, OSLO_STREETS, OSLO_DEFAULT } from '@/lib/osloLocations'
import type { PolitiEvent } from '@/types/politiloggen'

const MODULE = 'geocoder'

interface Coords {
  lat: number
  lng: number
}

// ─── In-memory cache ──────────────────────────────────────────
const cache = new Map<string, Coords>()

// ─── Normalisering ────────────────────────────────────────────
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,\-–()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// ─── Legg til litt jitter så punkter ikke stablers oppå hverandre ──
function jitter(coord: Coords, radiusM = 300): Coords {
  const earthR  = 6_371_000
  const maxDeg  = (radiusM / earthR) * (180 / Math.PI)
  const angle   = Math.random() * 2 * Math.PI
  const dist    = Math.random() * maxDeg * 0.6
  return {
    lat: coord.lat + dist * Math.cos(angle),
    lng: coord.lng + dist * Math.sin(angle) / Math.cos((coord.lat * Math.PI) / 180),
  }
}

// ─── Lokal oppslagstabell-søk ─────────────────────────────────
function lookupLocal(text: string): Coords | null {
  const norm = normalize(text)

  // Sjekk gater først (mer presist)
  for (const [name, loc] of Object.entries(OSLO_STREETS)) {
    if (norm.includes(name)) {
      logger.debug(MODULE, `Gate-match: "${name}"`)
      return jitter({ lat: loc.lat, lng: loc.lng }, loc.radiusM ?? 200)
    }
  }

  // Deretter bydeler/nabolag
  for (const [name, loc] of Object.entries(OSLO_DISTRICTS)) {
    if (norm.includes(name)) {
      logger.debug(MODULE, `Bydel-match: "${name}"`)
      return jitter({ lat: loc.lat, lng: loc.lng }, loc.radiusM ?? 600)
    }
  }

  return null
}

// ─── OpenCage API (valgfri) ───────────────────────────────────
interface OpenCageResult {
  results: Array<{
    geometry: { lat: number; lng: number }
    confidence: number
  }>
}

async function lookupOpenCage(query: string): Promise<Coords | null> {
  const key = import.meta.env.VITE_OPENCAGE_KEY
  if (!key) return null

  const cacheKey = `opencage:${query}`
  if (cache.has(cacheKey)) return cache.get(cacheKey)!

  try {
    const url = new URL('https://api.opencagedata.com/geocode/v1/json')
    url.searchParams.set('q', `${query}, Oslo, Norway`)
    url.searchParams.set('key', key)
    url.searchParams.set('limit', '1')
    url.searchParams.set('countrycode', 'no')
    url.searchParams.set('language', 'no')

    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(5_000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = (await res.json()) as OpenCageResult
    const hit  = data.results[0]
    if (!hit || hit.confidence < 5) return null

    const coords: Coords = { lat: hit.geometry.lat, lng: hit.geometry.lng }
    cache.set(cacheKey, coords)
    logger.debug(MODULE, `OpenCage-treff: "${query}" → ${coords.lat}, ${coords.lng}`)
    return coords
  } catch (err) {
    logger.warn(MODULE, 'OpenCage-feil', err)
    return null
  }
}

// ─── Hoved-funksjon ───────────────────────────────────────────
/**
 * Geocoder en PolitiEvent.
 * Prioritet:
 *   1. Allerede har koordinater → returner uendret
 *   2. Cache → bruk cachet resultat
 *   3. Lokal oppslagstabell (gate → bydel)
 *   4. OpenCage API (kun hvis VITE_OPENCAGE_KEY er satt)
 *   5. Municipality-sentrum
 *   6. Oslo-default med stor jitter
 */
export async function geocodeEvent(event: PolitiEvent): Promise<PolitiEvent> {
  if (event.coordinates) return event

  const searchText = [event.title, event.body, event.municipality, event.district]
    .filter(Boolean)
    .join(' ')

  const cacheKey = normalize(searchText).slice(0, 80)

  if (cache.has(cacheKey)) {
    return { ...event, coordinates: cache.get(cacheKey) }
  }

  // 1. Lokal tabell
  let coords = lookupLocal(searchText)

  // 2. OpenCage (async, bare ved cache-miss og API-nøkkel)
  if (!coords && event.municipality) {
    coords = await lookupOpenCage(
      `${event.title} ${event.municipality}`.slice(0, 100)
    )
  }

  // 3. Fallback: municipality-oppslagstabell
  if (!coords && event.municipality) {
    coords = lookupLocal(event.municipality)
  }

  // 4. Oslo default med stor spredning
  if (!coords) {
    logger.debug(MODULE, `Ingen treff for: "${cacheKey.slice(0, 40)}" — bruker default`)
    coords = jitter({ lat: OSLO_DEFAULT.lat, lng: OSLO_DEFAULT.lng }, OSLO_DEFAULT.radiusM)
  }

  cache.set(cacheKey, coords)
  return { ...event, coordinates: coords }
}

/**
 * Geocoder en hel liste med events.
 * Kjører parallelt (maks 5 samtidige kall for å respektere rate limits).
 */
export async function geocodeEvents(events: PolitiEvent[]): Promise<PolitiEvent[]> {
  const needsGeocode = events.filter((e) => !e.coordinates)
  const hasCoords    = events.filter((e) =>  e.coordinates)

  if (needsGeocode.length === 0) return events

  logger.info(MODULE, `Geocoder ${needsGeocode.length} hendelser`)

  // Chunk i grupper på 5 for å unngå å hammere OpenCage
  const geocoded: PolitiEvent[] = []
  for (let i = 0; i < needsGeocode.length; i += 5) {
    const chunk   = needsGeocode.slice(i, i + 5)
    const results = await Promise.all(chunk.map(geocodeEvent))
    geocoded.push(...results)
  }

  // Behold original rekkefølge
  const geocodedById = new Map(geocoded.map((e) => [e.id, e]))
  return events.map((e) => geocodedById.get(e.id) ?? e)
}
